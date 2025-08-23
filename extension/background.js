/**
 * Background Service Worker for AutoPurge Extension
 * Responsibilities:
 * - Monitor web navigation events
 * - Schedule history deletion for matching domains
 * - Manage deletion queue with debouncing
 * - Track usage statistics
 */

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  plan: "free",
  delaySec: 10,
  userDomains: [],
  freeLimit: 10,
  usage: { deletionsToday: 0, deletionsTotal: 0 }
};

// Enhanced deletion pipeline with debouncing and retry logic
const deletionQueue = new Map(); // Map<url, {timeoutId, retryCount, timestamp}>
const errorStats = { deleteErrors: 0, retryErrors: 0 };

// Pro features - Shadow History
let cryptoManager = null;
let shadowDB = null;
let isProEnabled = false;

// Load preset domains and configuration on startup
let presetDomains = [];
let config = DEFAULT_CONFIG;

// Initialize extension on startup and installation
async function initializeExtension() {
  console.log('AutoPurge extension initializing...');
  
  // Load or initialize configuration
  const stored = await chrome.storage.local.get();
  config = { ...DEFAULT_CONFIG, ...stored };
  await chrome.storage.local.set(config);
  
  // Load preset domains
  await loadPresetDomains();
  
  // Initialize Pro features if enabled
  if (config.plan === 'pro') {
    await initializeProFeatures();
  }
  
  console.log('AutoPurge extension initialized successfully');
}

// Initialize on installation
chrome.runtime.onInstalled.addListener(initializeExtension);

// Initialize on startup (service worker wake up)
chrome.runtime.onStartup.addListener(initializeExtension);

// Initialize immediately when service worker loads
(async () => {
  try {
    await initializeExtension();
    console.log('Initial service worker setup completed');
  } catch (error) {
    console.error('Failed to initialize service worker:', error);
  }
})();

// Load preset domains from data file
async function loadPresetDomains() {
  try {
    const response = await fetch(chrome.runtime.getURL('data/preset-domains.json'));
    const data = await response.json();
    presetDomains = data.domains || [];
    console.log(`Loaded ${presetDomains.length} preset domains`);
  } catch (error) {
    console.error('Failed to load preset domains:', error);
    presetDomains = [];
  }
}

// Enhanced domain matching with protocol filtering and subdomain support
function shouldPurgeDomain(url) {
  if (!config.enabled) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Skip restricted protocols
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'file:', 'moz-extension:', 'edge:', 'about:', 'data:'];
    if (restrictedProtocols.some(protocol => urlObj.protocol.startsWith(protocol))) {
      return false;
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check against preset domains
    for (const domain of presetDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return true;
      }
    }
    
    // Check against user domains
    for (const domain of config.userDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return false;
  }
}

// Schedule URL for deletion with enhanced pipeline
async function scheduleDelete(url, tabId = null) {
  const isMatched = shouldPurgeDomain(url);
  if (!isMatched) return false;
  
  // Check if already scheduled
  if (deletionQueue.has(url)) {
    const existing = deletionQueue.get(url);
    clearTimeout(existing.timeoutId);
    
    // Update existing entry
    existing.timestamp = Date.now();
    existing.tabId = tabId;
    
    // Schedule deletion after delay
    existing.timeoutId = setTimeout(async () => {
      await deleteFromHistory(url);
      deletionQueue.delete(url);
    }, config.delaySec * 1000);
    
    console.log(`Updated deletion schedule for: ${url} (delay: ${config.delaySec}s)`);
    return true;
  }
  
  // Create new deletion entry
  const deletionEntry = {
    timeoutId: null,
    retryCount: 0,
    timestamp: Date.now(),
    tabId: tabId
  };
  
  // Schedule deletion after delay
  deletionEntry.timeoutId = setTimeout(async () => {
    await deleteFromHistory(url);
    deletionQueue.delete(url);
  }, config.delaySec * 1000);
  
  deletionQueue.set(url, deletionEntry);
  console.log(`Scheduled deletion for: ${url} (delay: ${config.delaySec}s)`);
  
  // Store in shadow history if Pro is enabled
  if (isProEnabled && cryptoManager && shadowDB) {
    await storeInShadowHistory(url, tabId);
  }
  
  return true;
}

// Delete URL from history with retry logic
async function deleteFromHistory(url) {
  try {
    await chrome.history.deleteUrl({ url });
    
    // Update statistics
    config.usage.deletionsTotal++;
    config.usage.deletionsToday++;
    await chrome.storage.local.set({ usage: config.usage });
    
    console.log(`Deleted from history: ${url}`);
  } catch (error) {
    console.error('Failed to delete from history:', url, error);
    errorStats.deleteErrors++;
    
    // Retry once after delay if not already retried
    const queueEntry = deletionQueue.get(url);
    if (queueEntry && queueEntry.retryCount === 0) {
      queueEntry.retryCount = 1;
      
      // Retry after 5 seconds
      setTimeout(async () => {
        try {
          await chrome.history.deleteUrl({ url });
          console.log(`Retry successful for: ${url}`);
          
          // Update statistics
          config.usage.deletionsTotal++;
          config.usage.deletionsToday++;
          await chrome.storage.local.set({ usage: config.usage });
        } catch (retryError) {
          console.error('Retry failed for:', url, retryError);
          errorStats.retryErrors++;
        }
      }, 5000);
    }
  }
}

// Listen for navigation events with enhanced handling
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId === 0) {
    const url = details.url;
    const isMatched = await scheduleDelete(url, details.tabId);
    
    // Update badge to show detection status
    await updateBadgeForTab(details.tabId, isMatched);
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId === 0) {
    // For long navigation chains, only record the final URL
    // This prevents excessive shadow history entries
    if (details.transitionType === 'link' || details.transitionType === 'typed') {
      const isMatched = await scheduleDelete(details.url, details.tabId);
      await updateBadgeForTab(details.tabId, isMatched);
    }
  }
});

// Update badge to show site detection status
async function updateBadgeForTab(tabId, isMatched) {
  try {
    // Check if tab still exists before updating badge
    const tab = await chrome.tabs.get(tabId);
    if (!tab) {
      console.log(`Tab ${tabId} no longer exists, skipping badge update`);
      return;
    }
    
    if (isMatched) {
      chrome.action.setBadgeText({
        text: "●",
        tabId: tabId
      });
      chrome.action.setBadgeBackgroundColor({
        color: "#ff4444",
        tabId: tabId
      });
      chrome.action.setTitle({
        title: "AutoPurge - 已识别成人网站，将自动清理历史记录",
        tabId: tabId
      });
    } else {
      chrome.action.setBadgeText({
        text: "",
        tabId: tabId
      });
      chrome.action.setTitle({
        title: "AutoPurge - History Cleaner",
        tabId: tabId
      });
    }
  } catch (error) {
    // Tab might be closed or not accessible
    console.log(`Failed to update badge for tab ${tabId}:`, error.message);
    // Don't throw error, just log it
  }
}

// Clear badge when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  // Don't try to update badge for closed tab, just log it
  console.log(`Tab ${tabId} closed, badge will be cleared automatically`);
});

// Clear badge when navigating away from monitored sites
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const isMatched = shouldPurgeDomain(tab.url);
      await updateBadgeForTab(activeInfo.tabId, isMatched);
    }
  } catch (error) {
    // Tab might be closed or not accessible
    console.log(`Failed to get tab ${activeInfo.tabId}:`, error.message);
    await updateBadgeForTab(activeInfo.tabId, false);
  }
});

// Update tab URLs when they change
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.url) {
    const isMatched = shouldPurgeDomain(tab.url);
    await updateBadgeForTab(tabId, isMatched);
  }
});

// Handle messages from popup/options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  console.log('Current config state:', config);
  console.log('Preset domains loaded:', presetDomains.length);
  console.log('Message sender:', sender);
  console.log('SendResponse function:', typeof sendResponse);
  
  switch (message.action) {
    case 'getConfig':
      sendResponse(config);
      break;
      
    case 'updateConfig':
      (async () => {
        config = { ...config, ...message.config };
        await chrome.storage.local.set(config);
        sendResponse({ success: true });
      })();
      return true; // Keep message channel open for async response
      break;
      
    case 'deleteRecentHistory': {
      const { minutes } = message;
      const startTime = Date.now() - (minutes * 60 * 1000);
      
      (async () => {
        try {
          await chrome.history.deleteRange({
            startTime,
            endTime: Date.now()
          });
          
          // Update statistics
          config.usage.deletionsTotal += 10; // Estimate
          await chrome.storage.local.set({ usage: config.usage });
          
          sendResponse({ success: true });
        } catch (error) {
          console.error('Failed to delete recent history:', error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keep message channel open for async response
      break;
    }
      
    case 'getStats':
      sendResponse({
        deletionsToday: config.usage.deletionsToday,
        deletionsTotal: config.usage.deletionsTotal,
        queueSize: deletionQueue.size
      });
      break;
      
    case 'getCurrentTabStatus':
      // Use Promise-based approach for better async handling
      (async () => {
        try {
          console.log('Getting current tab status...');
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('Found tabs:', tabs);
          
          if (tabs && tabs.length > 0) {
            const tab = tabs[0];
            console.log('Current tab:', tab);
            
            if (tab.url && tab.url !== 'chrome://newtab/' && !tab.url.startsWith('chrome://')) {
              try {
                const urlObj = new URL(tab.url);
                const hostname = urlObj.hostname;
                const isMatched = shouldPurgeDomain(tab.url);
                
                console.log('URL parsed successfully:', { url: tab.url, hostname, isMatched });
                
                sendResponse({
                  isMatched: isMatched,
                  hostname: hostname,
                  url: tab.url,
                  title: tab.title || '无标题'
                });
              } catch (urlError) {
                console.error('Failed to parse URL:', tab.url, urlError);
                sendResponse({ 
                  isMatched: false, 
                  hostname: '无效URL',
                  url: tab.url,
                  title: tab.title || '无标题',
                  error: 'URL解析失败'
                });
              }
            } else {
              console.log('Tab has restricted URL:', tab.url);
              sendResponse({ 
                isMatched: false, 
                hostname: '受限页面',
                url: tab.url || '无URL',
                title: tab.title || '无标题',
                error: '无法访问此页面'
              });
            }
          } else {
            console.log('No active tabs found');
            sendResponse({ 
              isMatched: false, 
              error: '未找到活动标签页' 
            });
          }
        } catch (error) {
          console.error('Failed to get current tab status:', error);
          sendResponse({ 
            isMatched: false, 
            error: error.message || '未知错误' 
          });
        }
      })();
      return true; // Keep message channel open for async response
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Reset daily statistics at midnight
function resetDailyStats() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(async () => {
    config.usage.deletionsToday = 0;
    await chrome.storage.local.set({ usage: config.usage });
    console.log('Daily statistics reset');
    
    // Schedule next reset
    resetDailyStats();
  }, msUntilMidnight);
}

// Initialize daily stats reset
resetDailyStats();

// Reload configuration when storage changes
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local') {
    const stored = await chrome.storage.local.get();
    config = { ...DEFAULT_CONFIG, ...stored };
    console.log('Configuration reloaded');
    
    // Check if Pro status changed
    if (changes.plan && stored.plan === 'pro' && !isProEnabled) {
      await initializeProFeatures();
    } else if (changes.plan && stored.plan === 'free' && isProEnabled) {
      await disableProFeatures();
    }
  }
});

// Pro Features Implementation
async function initializeProFeatures() {
  try {
    // Dynamically import Pro modules
    const cryptoModule = await import('./crypto.js');
    const dbModule = await import('./db.js');
    
    cryptoManager = new cryptoModule.CryptoManager();
    shadowDB = new dbModule.ShadowHistoryDB();
    
    await shadowDB.init();
    isProEnabled = true;
    
    console.log('Pro features initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Pro features:', error);
    isProEnabled = false;
  }
}

async function disableProFeatures() {
  if (shadowDB) {
    shadowDB.close();
    shadowDB = null;
  }
  
  if (cryptoManager) {
    cryptoManager.lock();
    cryptoManager = null;
  }
  
  isProEnabled = false;
  console.log('Pro features disabled');
}

async function storeInShadowHistory(url, tabId) {
  try {
    if (!cryptoManager || !shadowDB || !cryptoManager.isUnlocked()) {
      return; // Cannot store without unlocked crypto manager
    }
    
    // Get tab information for better record
    let tabInfo = null;
    try {
      const tabs = await chrome.tabs.get(tabId);
      tabInfo = {
        title: tabs.title,
        url: tabs.url
      };
    } catch (error) {
      // Tab might be closed, use basic info
      tabInfo = { title: '', url: url };
    }
    
    // Create record data
    const recordData = {
      url: url,
      title: tabInfo.title || '',
      visitedAt: Date.now(),
      ruleId: getRuleIdForUrl(url)
    };
    
    // Encrypt record
    const masterKey = cryptoManager.getMasterKey();
    const { iv, cipherText } = await cryptoManager.encrypt(JSON.stringify(recordData), masterKey);
    
    // Store encrypted record
    const record = {
      iv: iv,
      cipherText: cipherText,
      createdAt: Date.now()
    };
    
    await shadowDB.storeRecord(record);
    console.log('Shadow history record stored for:', url);
    
  } catch (error) {
    console.error('Failed to store in shadow history:', error);
  }
}

function getRuleIdForUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check preset domains
    for (let i = 0; i < presetDomains.length; i++) {
      if (hostname === presetDomains[i] || hostname.endsWith('.' + presetDomains[i])) {
        return `preset_${i}`;
      }
    }
    
    // Check user domains
    for (let i = 0; i < config.userDomains.length; i++) {
      if (hostname === config.userDomains[i] || hostname.endsWith('.' + config.userDomains[i])) {
        return `user_${i}`;
      }
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}
