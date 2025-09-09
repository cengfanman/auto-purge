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

// API Base URL
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
  
  // Initialize device fingerprint if not exists
  await initializeDeviceFingerprint();
  
  // Start license verification timer
  await startLicenseVerificationTimer();
  
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
    
    // Check against preset domains
    console.log('Checking preset domains:', presetDomains);
    for (const domain of presetDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log('Match found in preset domains:', domain);
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
          const stored = await chrome.storage.local.get(['license']);
          sendResponse(stored.license || { plan: 'free' });
        } catch (error) {
          console.error('Failed to get license state:', error);
          sendResponse({ plan: 'free' });
        }
      })();
      return true;
      
    case 'license:activate':
      (async () => {
        try {
          const result = await activateLicense(message.licenseKey);
          sendResponse(result);
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
      
    case 'license:verify':
      (async () => {
        try {
          const result = await verifyLicenseToken();
          sendResponse(result);
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
      
    case 'license:clear':
      (async () => {
        try {
          const result = await clearLicense();
          sendResponse(result);
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
      
    case 'license:manage':
      (async () => {
        try {
          const result = await getLicenseManagement(message.licenseKey);
          sendResponse(result);
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
      
    case 'license:deactivateDevice':
      (async () => {
        try {
          const result = await deactivateDevice(message.licenseKey, message.deviceId);
          sendResponse(result);
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
      
    case 'checkout:create':
      (async () => {
        try {
          const result = await createCheckout(
            message.provider,
            message.productCode,
            message.email
          );
          sendResponse(result);
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

// ============ LICENSE MANAGEMENT FUNCTIONS ============

// Initialize device fingerprint
async function initializeDeviceFingerprint() {
  try {
    const stored = await chrome.storage.local.get(['device']);
    if (!stored.device || !stored.device.fingerprint) {
      // Generate UUID v4 using crypto.getRandomValues
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      
      // Set version (4) and variant bits
      array[6] = (array[6] & 0x0f) | 0x40;
      array[8] = (array[8] & 0x3f) | 0x80;
      
      // Convert to UUID string format
      const fingerprint = Array.from(array, (byte, i) => {
        const hex = byte.toString(16).padStart(2, '0');
        if (i === 4 || i === 6 || i === 8 || i === 10) return '-' + hex;
        return hex;
      }).join('');
      
      await chrome.storage.local.set({ device: { fingerprint } });
      console.log('Device fingerprint generated:', fingerprint);
    }
  } catch (error) {
    console.error('Failed to initialize device fingerprint:', error);
  }
}

// Start license verification timer
async function startLicenseVerificationTimer() {
  // Verify license on startup
  await verifyLicenseToken();
  
  // Set up periodic verification
  setInterval(async () => {
    await verifyLicenseToken();
  }, LICENSE_VERIFY_INTERVAL);
}

// Activate license
async function activateLicense(licenseKey) {
  try {
    const device = await chrome.storage.local.get(['device']);
    if (!device.device || !device.device.fingerprint) {
      throw new Error('Device fingerprint not initialized');
    }
    
    const response = await fetch(`${API_BASE_URL}/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        deviceFingerprint: device.device.fingerprint,
        userAgent: navigator.userAgent
      })
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Activation failed');
    }
    
    // Normalize response data
    const expiresAtMs = result.data.exp || Date.parse(result.data.expiresAt);
    
    // Save license data
    const license = {
      plan: result.data.plan,
      token: result.data.token,
      expiresAt: expiresAtMs,
      exp: expiresAtMs,
      deviceId: result.data.deviceId,
      licCodeMasked: result.data.licCodeMasked,
      provider: 'coinbase'
    };
    
    await chrome.storage.local.set({ license });
    config.plan = result.data.plan;
    
    // Broadcast license change
    chrome.runtime.sendMessage({ type: 'license:changed' }).catch(() => {});
    
    console.log('License activated successfully');
    return { ok: true };
    
  } catch (error) {
    console.error('License activation failed:', error);
    
    // Map API errors to user-friendly messages
    if (error.message.includes('INVALID') || error.message.includes('Invalid license key')) {
      throw new Error('Invalid license key');
    } else if (error.message.includes('EXPIRED') || error.message.includes('expired')) {
      throw new Error('Expired license');
    } else if (error.message.includes('REVOKED') || error.message.includes('revoked')) {
      throw new Error('License revoked');
    } else if (error.message.includes('DEVICE_LIMIT') || error.message.includes('Device limit reached')) {
      throw new Error('Device limit reached');
    }
    
    throw new Error('Activation failed, please retry');
  }
}

// Verify license token
async function verifyLicenseToken() {
  try {
    const stored = await chrome.storage.local.get(['license']);
    if (!stored.license || !stored.license.token) {
      return { ok: false, plan: 'free' };
    }
    
    const response = await fetch(`${API_BASE_URL}/licenses/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: stored.license.token })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success && result.data.valid === true) {
      // Update license data
      const license = {
        ...stored.license,
        plan: result.data.plan,
        grace: result.data.grace,
        expiresAt: Date.parse(result.data.expiresAt)
      };
      
      await chrome.storage.local.set({ license });
      config.plan = result.data.plan;
      
      // Broadcast license change
      chrome.runtime.sendMessage({ type: 'license:changed' }).catch(() => {});
      
      return { ok: true, plan: result.data.plan };
    } else {
      // License is invalid, downgrade to free but keep some data for UI
      const license = {
        plan: 'free',
        licCodeMasked: stored.license.licCodeMasked
      };
      
      await chrome.storage.local.set({ license });
      config.plan = 'free';
      
      // Broadcast license change
      chrome.runtime.sendMessage({ type: 'license:changed' }).catch(() => {});
      
      return { ok: false, plan: 'free' };
    }
    
  } catch (error) {
    console.error('License verification failed:', error);
    
    // On network error, keep current license status
    const stored = await chrome.storage.local.get(['license']);
    return { 
      ok: false, 
      plan: stored.license?.plan || 'free' 
    };
  }
}

// Clear license
async function clearLicense() {
  try {
    await chrome.storage.local.set({ 
      license: { plan: 'free' } 
    });
    config.plan = 'free';
    
    // Broadcast license change
    chrome.runtime.sendMessage({ type: 'license:changed' }).catch(() => {});
    
    return { ok: true };
  } catch (error) {
    console.error('Failed to clear license:', error);
    throw error;
  }
}

// Create checkout session
async function createCheckout(provider, productCode, email) {
  try {
    console.log('Creating checkout:', { provider, productCode, email });
    
    const response = await fetch(`${API_BASE_URL}/checkout/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, productCode, email })
    });
    
    const result = await response.json();
    console.log('Checkout API response:', result);
    
    if (!response.ok || !result.success || !result.data || !result.data.hosted_url) {
      throw new Error('Checkout creation failed');
    }
    
    console.log('Opening Coinbase URL in new tab:', result.data.hosted_url);
    
    // Open checkout URL in new tab
    try {
      const newTab = await chrome.tabs.create({ url: result.data.hosted_url });
      console.log('New tab created successfully:', newTab.id);
    } catch (tabError) {
      console.error('Failed to create new tab:', tabError);
      // Tab creation failed, but we still return success with the URL
      // The options page can handle this as a fallback
      return { ok: true, hosted_url: result.data.hosted_url, tabError: tabError.message };
    }
    
    return { ok: true, hosted_url: result.data.hosted_url };
  } catch (error) {
    console.error('Checkout creation failed:', error);
    throw error;
  }
}

// Normalize timestamp to epoch milliseconds
function toEpochMs(maybeNumberOrISO) {
  if (typeof maybeNumberOrISO === "number") {
    return maybeNumberOrISO < 1e12 ? maybeNumberOrISO * 1000 : maybeNumberOrISO;
  }
  if (typeof maybeNumberOrISO === "string") {
    return Date.parse(maybeNumberOrISO);
  }
  return undefined;
}

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

// Get license management information
async function getLicenseManagement(licenseKey) {
  try {
    const response = await fetch(`${API_BASE_URL}/licenses/manage?licenseKey=${encodeURIComponent(licenseKey)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to get license management info');
    }
    
    return { ok: true, data: result.data };
  } catch (error) {
    console.error('License management failed:', error);
    throw error;
  }
}

// Deactivate a device from license
async function deactivateDevice(licenseKey, deviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/licenses/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceId })
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to deactivate device');
    }
    
    return { ok: true, data: result.data };
  } catch (error) {
    console.error('Device deactivation failed:', error);
    throw error;
  }
}
