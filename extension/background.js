/**
 * Background Service Worker for AutoPurge Extension
 * Responsibilities:
 * - Monitor web navigation events
 * - Schedule history deletion for matching domains
 * - Manage deletion queue with debouncing
 * - Track usage statistics
 * - Handle license verification and management
 */

// Import license manager
import { LicenseManager } from './license-manager.js';

// Initialize license manager
const licenseManager = new LicenseManager();

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  plan: "free",
  delaySec: 10,
  userDomains: [],
  freeLimit: 10,
  usage: { deletionsToday: 0, deletionsTotal: 0 }
};

// API Base URL (now handled by license manager)
const API_BASE_URL = 'https://api.autopurge.shop';

// License verification interval (24 hours)
const LICENSE_VERIFY_INTERVAL = 24 * 60 * 60 * 1000;

// Enhanced deletion pipeline with debouncing and retry logic
const deletionQueue = new Map(); // Map<url, {timeoutId, retryCount, timestamp}>
const errorStats = { deleteErrors: 0, retryErrors: 0 };

// Pro features - Shadow History
let cryptoManager = null;
let shadowDB = null;
let isProEnabled = false;

// Load preset domains and configuration on startup
let presetDomains = [];
let removedPresetDomains = [];
let config = DEFAULT_CONFIG;

// Initialize extension on startup and installation
async function initializeExtension() {
  console.log('AutoPurge extension initializing...');

  // Initialize license manager first
  await licenseManager.initialize();

  // Load or initialize configuration
  const stored = await chrome.storage.local.get();
  config = { ...DEFAULT_CONFIG, ...stored };
  await chrome.storage.local.set(config);

  // Load preset domains
  await loadPresetDomains();
  
  // Load removed preset domains
  await loadRemovedPresetDomains();

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
    console.log(`Loaded ${presetDomains.length} preset domains:`, presetDomains);
  } catch (error) {
    console.error('Failed to load preset domains:', error);
    presetDomains = [];
  }
}

// Load removed preset domains from storage
async function loadRemovedPresetDomains() {
  try {
    const stored = await chrome.storage.local.get(['removedPresetDomains']);
    removedPresetDomains = stored.removedPresetDomains || [];
    console.log(`Loaded ${removedPresetDomains.length} removed preset domains:`, removedPresetDomains);
  } catch (error) {
    console.error('Failed to load removed preset domains:', error);
    removedPresetDomains = [];
  }
}

// Enhanced domain matching with protocol filtering and subdomain support
function shouldPurgeDomain(url) {
  if (!config.enabled) {
    console.log('AutoPurge is disabled');
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    console.log('Checking URL for deletion:', url, 'hostname:', hostname);
    
    // Skip restricted protocols
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'file:', 'moz-extension:', 'edge:', 'about:', 'data:'];
    if (restrictedProtocols.some(protocol => urlObj.protocol.startsWith(protocol))) {
      console.log('Skipping restricted protocol:', urlObj.protocol);
      return false;
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      console.log('Skipping non-HTTP protocol:', urlObj.protocol);
      return false;
    }
    
    // Check against preset domains (excluding removed ones)
    console.log('Checking preset domains:', presetDomains);
    console.log('Removed preset domains:', removedPresetDomains);
    
    for (const domain of presetDomains) {
      // Skip if domain was removed by user
      if (removedPresetDomains.includes(domain)) {
        console.log('Skipping removed preset domain:', domain);
        continue;
      }
      
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log('Match found in active preset domains:', domain);
        return true;
      }
    }
    
    // Check against user domains
    console.log('Checking user domains:', config.userDomains);
    for (const domain of config.userDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log('Match found in user domains:', domain);
        return true;
      }
    }
    
    console.log('No match found for:', hostname);
    return false;
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return false;
  }
}

// Schedule URL for deletion with enhanced pipeline
async function scheduleDelete(url, tabId = null) {
  console.log('scheduleDelete called for:', url);
  const isMatched = shouldPurgeDomain(url);
  console.log('Domain match result:', isMatched);
  
  if (!isMatched) return false;
  
  // Check if already scheduled - if so, don't reschedule
  if (deletionQueue.has(url)) {
    console.log('URL already in deletion queue, skipping reschedule to prevent loops');
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
    console.log('Executing scheduled deletion for:', url);
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
    console.log('=== deleteFromHistory START ===');
    console.log('URL to delete:', url);
    
    // Get page title before deletion for history record
    let pageTitle = '';
    try {
      const tabs = await chrome.tabs.query({ url: url });
      if (tabs && tabs.length > 0) {
        pageTitle = tabs[0].title || '';
        console.log('Page title found:', pageTitle);
      }
    } catch (titleError) {
      console.log('Could not get page title:', titleError.message);
    }
    
    // Extract domain from URL
    let domain = '';
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
      console.log('Domain extracted:', domain);
    } catch (urlError) {
      console.log('Could not extract domain from URL:', urlError.message);
    }
    
    console.log('Attempting to delete URL from Chrome history...');
    await chrome.history.deleteUrl({ url });
    console.log('URL successfully deleted from Chrome history');
    
    // Record the deletion in history records
    console.log('Recording history deletion...');
    await recordHistoryDeletion(url, pageTitle, domain);
    console.log('History deletion recorded');
    
    // Update statistics
    config.usage.deletionsTotal++;
    config.usage.deletionsToday++;
    await chrome.storage.local.set({ usage: config.usage });
    console.log('Statistics updated');
    
    console.log(`=== deleteFromHistory SUCCESS: ${url} ===`);
  } catch (error) {
    console.error('=== deleteFromHistory ERROR ===');
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
          
          // Record the deletion in history records
          await recordHistoryDeletion(url, '', domain);
          
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

// Remove onCompleted listener to prevent duplicate scheduling
// The onCommitted event is sufficient for scheduling deletions

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
        title: "AutoPurge - Adult website detected, history will be cleared automatically",
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
    
    // If navigating away from a monitored domain, clear any pending deletions for this tab
    if (!isMatched) {
      clearPendingDeletionsForTab(tabId);
    }
  }
});

// Clear pending deletions for a specific tab
function clearPendingDeletionsForTab(tabId) {
  for (const [url, entry] of deletionQueue.entries()) {
    if (entry.tabId === tabId) {
      console.log(`Clearing pending deletion for tab ${tabId}: ${url}`);
      clearTimeout(entry.timeoutId);
      deletionQueue.delete(url);
    }
  }
}

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
      
    // ======= LICENSE MANAGEMENT MESSAGES =======
    case 'license:getState':
      (async () => {
        try {
          const stored = await chrome.storage.local.get(['licenseData', 'plan']);
          const licenseData = stored.licenseData || null;
          const plan = stored.plan || 'free';
          sendResponse({
            plan: plan,
            licenseData: licenseData,
            hasLicense: !!licenseData
          });
        } catch (error) {
          console.error('Failed to get license state:', error);
          sendResponse({ plan: 'free', licenseData: null, hasLicense: false });
        }
      })();
      return true;

    case 'license:activate':
      (async () => {
        try {
          const result = await licenseManager.activateLicense(message.licenseKey);
          sendResponse({ ok: true, data: result });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;

    case 'license:verify':
      (async () => {
        try {
          const result = await licenseManager.verifyLicense();
          sendResponse({ ok: result.valid, data: result });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;

    case 'license:deactivate':
      (async () => {
        try {
          await licenseManager.deactivateLicense();
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;

    case 'license:info':
      (async () => {
        try {
          const result = await licenseManager.getLicenseInfo();
          sendResponse({ ok: true, data: result });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;

    case 'license:hasProFeatures':
      (async () => {
        try {
          const result = await licenseManager.hasProFeatures();
          sendResponse({ ok: true, hasProFeatures: result });
        } catch (error) {
          sendResponse({ ok: false, hasProFeatures: false });
        }
      })();
      return true;

    case 'checkout:create':
      (async () => {
        try {
          const result = await licenseManager.createCheckout(message.email);
          
          // Try to open the checkout URL in a new tab
          try {
            await chrome.tabs.create({ url: result });
            sendResponse({ ok: true, url: result });
          } catch (tabError) {
            // If tab creation fails, still return success but indicate tab error
            console.warn('Failed to create tab:', tabError);
            sendResponse({ 
              ok: true, 
              url: result, 
              hosted_url: result,
              tabError: true 
            });
          }
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
      
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
          
          // Try multiple methods to get the current tab
          let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('Method 1 - active: true, currentWindow: true, found tabs:', tabs);
          
          // If no tabs found, try without currentWindow restriction
          if (!tabs || tabs.length === 0) {
            tabs = await chrome.tabs.query({ active: true });
            console.log('Method 2 - active: true, found tabs:', tabs);
          }
          
          // If still no tabs found, try getting the last focused window
          if (!tabs || tabs.length === 0) {
            tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            console.log('Method 3 - active: true, lastFocusedWindow: true, found tabs:', tabs);
          }
          
          // If still no tabs found, get all tabs and find the most recent one
          if (!tabs || tabs.length === 0) {
            const allTabs = await chrome.tabs.query({});
            console.log('Method 4 - all tabs, found:', allTabs.length);
            if (allTabs.length > 0) {
              // Find the most recently active tab
              tabs = [allTabs.reduce((latest, current) => {
                return (current.lastAccessed || 0) > (latest.lastAccessed || 0) ? current : latest;
              })];
              console.log('Selected most recent tab:', tabs[0]);
            }
          }
          
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
                  hostname: 'Invalid URL',
                  url: tab.url,
                  title: tab.title || 'No Title',
                  error: 'URL parsing failed'
                });
              }
            } else {
              console.log('Tab has restricted URL:', tab.url);
              sendResponse({ 
                isMatched: false, 
                hostname: 'Restricted Page',
                url: tab.url || 'No URL',
                title: tab.title || 'No Title',
                error: 'Cannot access this page'
              });
            }
          } else {
            console.log('No active tabs found');
            sendResponse({ 
              isMatched: false, 
              error: 'No active tab found' 
            });
          }
        } catch (error) {
          console.error('Failed to get current tab status:', error);
          sendResponse({ 
            isMatched: false, 
            error: error.message || 'Unknown error' 
          });
        }
      })();
      return true; // Keep message channel open for async response
      
    case 'executeDeletion':
      // Execute immediate deletion for current tab
      (async () => {
        try {
          console.log('=== executeDeletion START ===');
          
          // Try multiple methods to get the current tab
          let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('Method 1 - active: true, currentWindow: true, found tabs:', tabs);
          
          // If no tabs found, try without currentWindow restriction
          if (!tabs || tabs.length === 0) {
            tabs = await chrome.tabs.query({ active: true });
            console.log('Method 2 - active: true, found tabs:', tabs);
          }
          
          // If still no tabs found, try getting the last focused window
          if (!tabs || tabs.length === 0) {
            tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            console.log('Method 3 - active: true, lastFocusedWindow: true, found tabs:', tabs);
          }
          
          // If still no tabs found, get all tabs and find the most recent one
          if (!tabs || tabs.length === 0) {
            const allTabs = await chrome.tabs.query({});
            console.log('Method 4 - all tabs, found:', allTabs.length);
            if (allTabs.length > 0) {
              // Find the most recently active tab
              tabs = [allTabs.reduce((latest, current) => {
                return (current.lastAccessed || 0) > (latest.lastAccessed || 0) ? current : latest;
              })];
              console.log('Selected most recent tab:', tabs[0]);
            }
          }
          
          if (tabs && tabs.length > 0) {
            const tab = tabs[0];
            console.log('Current tab for deletion:', tab);
            
            if (tab.url && shouldPurgeDomain(tab.url)) {
              console.log('Executing immediate deletion for:', tab.url);
              await deleteFromHistory(tab.url);
              sendResponse({ success: true });
            } else {
              console.log('URL not eligible for deletion:', tab.url);
              sendResponse({ success: false, error: 'URL not eligible for deletion' });
            }
          } else {
            console.log('No active tabs found for deletion');
            sendResponse({ success: false, error: 'No active tab found' });
          }
        } catch (error) {
          console.error('Failed to execute deletion:', error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keep message channel open for async response
      
    case 'reloadPresetDomains':
      (async () => {
        try {
          await loadPresetDomains();
          sendResponse({ success: true, domains: presetDomains });
        } catch (error) {
          console.error('Failed to reload preset domains:', error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Keep message channel open for async response
      
    case 'updateRemovedPresetDomains':
      (async () => {
        try {
          await loadRemovedPresetDomains();
          sendResponse({ success: true, removedDomains: removedPresetDomains });
        } catch (error) {
          console.error('Failed to update removed preset domains:', error);
          sendResponse({ success: false, error: error.message });
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

// Record history deletion for tracking
async function recordHistoryDeletion(url, title, domain) {
  try {
    console.log('=== recordHistoryDeletion START ===');
    console.log('URL:', url);
    console.log('Title:', title);
    console.log('Domain:', domain);
    
    // Check if auto recording is enabled
    const settings = await chrome.storage.local.get(['historySettings']);
    const historySettings = settings.historySettings || { autoRecord: true, maxRecords: 1000, retentionDays: 30 };
    
    console.log('History settings:', historySettings);
    
    // If autoRecord is false, enable it automatically
    if (!historySettings.autoRecord) {
      console.log('Auto recording is disabled, enabling it automatically...');
      historySettings.autoRecord = true;
      await chrome.storage.local.set({ historySettings: historySettings });
      console.log('Auto recording enabled successfully');
    }
    
    // Load existing history records
    const stored = await chrome.storage.local.get(['historyRecords']);
    let historyRecords = stored.historyRecords || [];
    
    console.log('Existing history records count:', historyRecords.length);
    console.log('Existing records:', historyRecords);
    
    // Create new record
    const record = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: url,
      title: title || '',
      domain: domain || '',
      deletedAt: Date.now()
    };
    
    console.log('Created new record:', record);
    
    // Add to beginning of array
    historyRecords.unshift(record);
    console.log('After adding new record, count:', historyRecords.length);
    
    // Apply retention policy
    const retentionTime = historySettings.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    historyRecords = historyRecords.filter(record => record.deletedAt > cutoffTime);
    console.log('After retention filter, count:', historyRecords.length);
    
    // Limit to max records
    if (historyRecords.length > historySettings.maxRecords) {
      historyRecords = historyRecords.slice(0, historySettings.maxRecords);
      console.log('After max records limit, count:', historyRecords.length);
    }
    
    console.log('Final history records count:', historyRecords.length);
    console.log('Final records:', historyRecords);
    
    // Save updated records
    console.log('Saving records to storage...');
    await chrome.storage.local.set({ historyRecords: historyRecords });
    console.log('Records saved to storage');
    
    // Verify the save
    const verify = await chrome.storage.local.get(['historyRecords']);
    console.log('Verification - stored records count:', verify.historyRecords?.length || 0);
    console.log('Verification - stored records:', verify.historyRecords);
    
    console.log(`=== recordHistoryDeletion SUCCESS: ${url} ===`);
    
  } catch (error) {
    console.error('=== recordHistoryDeletion ERROR ===');
    console.error('Failed to record history deletion:', error);
  }
}

// ============ LICENSE MANAGEMENT ============
// License management is now handled by the LicenseManager class

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

