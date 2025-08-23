/**
 * Popup script for AutoPurge Extension
 * Modern, clean interface with proper error handling
 */

// DOM elements
const statusBadge = document.getElementById('statusBadge');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const siteIcon = document.getElementById('siteIcon');
const siteName = document.getElementById('siteName');
const siteStatus = document.getElementById('siteStatus');
const detectionBadge = document.getElementById('detectionBadge');
const refreshSiteBtn = document.getElementById('refreshSiteBtn');
const domainsCount = document.getElementById('domainsCount');
const deletionsToday = document.getElementById('deletionsToday');
const deletionsTotal = document.getElementById('deletionsTotal');
const delayTime = document.getElementById('delayTime');
const queueSize = document.getElementById('queueSize');
const toggleBtn = document.getElementById('toggleBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const settingsBtn = document.getElementById('settingsBtn');
const proSection = document.getElementById('proSection');
const upgradeBtn = document.getElementById('upgradeBtn');
const helpLink = document.getElementById('helpLink');
const feedbackLink = document.getElementById('feedbackLink');
const privacyLink = document.getElementById('privacyLink');

// Current configuration
let config = {};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup initialized');
  await loadData();
  setupEventListeners();
  updateUI();
  
  // Refresh data periodically while popup is open
  setInterval(refreshStats, 3000);
});

// Load configuration and statistics
async function loadData() {
  try {
    console.log('Loading extension data...');
    
    // Get configuration
    config = await chrome.runtime.sendMessage({ action: 'getConfig' });
    
    if (!config) {
      throw new Error('Failed to load configuration');
    }
    
    console.log('Configuration loaded:', config);
    
    // Get current tab status
    await loadCurrentTabStatus();
    
    // Load statistics
    await loadStats();
    
  } catch (error) {
    console.error('Failed to load data:', error);
    showError('Failed to load extension data');
    
    // Set default config
    config = {
      enabled: false,
      delaySec: 10,
      userDomains: [],
      usage: { deletionsToday: 0, deletionsTotal: 0 }
    };
  }
}

// Load current tab status
async function loadCurrentTabStatus() {
  try {
    console.log('Loading current tab status...');
    
    // First test if background script is responding
    try {
      const testResponse = await chrome.runtime.sendMessage({ action: 'getConfig' });
      console.log('Background script test response:', testResponse);
    } catch (testError) {
      console.error('Background script test failed:', testError);
      updateCurrentSiteUI({ 
        isMatched: false, 
        error: 'Background script not responding' 
      });
      return;
    }
    
    // Get current tab status with timeout
    const tabStatus = await Promise.race([
      chrome.runtime.sendMessage({ action: 'getCurrentTabStatus' }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    ]);
    
    console.log('Received tab status:', tabStatus);
    
    // Check if we got a valid response
    if (tabStatus && typeof tabStatus === 'object' && tabStatus !== null) {
      updateCurrentSiteUI(tabStatus);
    } else {
      console.warn('Invalid tab status response:', tabStatus);
      updateCurrentSiteUI({ 
        isMatched: false, 
        error: 'Received invalid response' 
      });
    }
    
  } catch (error) {
    console.error('Failed to load current tab status:', error);
    updateCurrentSiteUI({ 
      isMatched: false, 
      error: `Connection failed: ${error.message || 'Unknown error'}` 
    });
    
    // Retry after a short delay
    setTimeout(async () => {
      try {
        console.log('Retrying to load current tab status...');
        const retryStatus = await Promise.race([
          chrome.runtime.sendMessage({ action: 'getCurrentTabStatus' }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Retry timeout')), 3000)
          )
        ]);
        
        console.log('Retry successful:', retryStatus);
        
        if (retryStatus && typeof retryStatus === 'object' && retryStatus !== null) {
          updateCurrentSiteUI(retryStatus);
        } else {
          console.warn('Invalid retry response:', retryStatus);
          updateCurrentSiteUI({ 
            isMatched: false, 
            error: 'Retry failed: Received invalid response' 
          });
        }
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        updateCurrentSiteUI({ 
          isMatched: false, 
          error: `Retry failed: ${retryError.message || 'Unknown error'}` 
        });
      }
    }, 1000);
  }
}

// Load statistics
async function loadStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    
    if (stats) {
      deletionsToday.textContent = stats.deletionsToday || 0;
      deletionsTotal.textContent = stats.deletionsTotal || 0;
      queueSize.textContent = stats.queueSize || 0;
    }
    
    // Update domains count
    if (config && config.userDomains) {
      const totalDomains = (config.userDomains.length || 0) + 20; // 20 preset domains
      domainsCount.textContent = totalDomains;
    }
    
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Update current site UI
function updateCurrentSiteUI(tabStatus) {
  console.log('Updating current site UI with:', tabStatus);

  if (tabStatus.error) {
    // Error occurred
    siteIcon.textContent = '⚠️';
    siteName.textContent = 'Failed to get';
    siteStatus.textContent = tabStatus.error;
    detectionBadge.style.display = 'none';
    console.error('Tab status error:', tabStatus.error);
  } else if (tabStatus.isMatched) {
    // Site is detected
    siteIcon.textContent = '🔞';
    siteName.textContent = tabStatus.hostname || 'Adult Website';
    siteStatus.textContent = `History will be cleared in ${config.delaySec} seconds`;
    detectionBadge.style.display = 'flex';
    console.log('Site detected as adult content');
  } else if (tabStatus.hostname && tabStatus.hostname !== 'Restricted Page' && tabStatus.hostname !== 'Invalid URL') {
    // Normal site
    siteIcon.textContent = '🌐';
    siteName.textContent = tabStatus.hostname;
    siteStatus.textContent = 'This website is not in the monitoring list';
    detectionBadge.style.display = 'none';
    console.log('Normal site detected:', tabStatus.hostname);
  } else {
    // Special cases
    siteIcon.textContent = '🌐';
    if (tabStatus.hostname === 'Restricted Page') {
      siteName.textContent = 'Chrome System Page';
      siteStatus.textContent = 'Extension cannot run on this page';
    } else if (tabStatus.hostname === 'Invalid URL') {
      siteName.textContent = 'Invalid Page';
      siteStatus.textContent = 'Please visit a valid webpage';
    } else {
      siteName.textContent = 'Unable to get current website';
      siteStatus.textContent = 'Please refresh or switch to a valid webpage';
    }
    detectionBadge.style.display = 'none';
  }
}

// Update UI based on configuration
function updateUI() {
  // Update status badge
  if (config.enabled) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Active';
    toggleBtn.textContent = 'Disable';
    toggleBtn.classList.remove('btn-primary');
    toggleBtn.classList.add('btn-secondary');
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Inactive';
    toggleBtn.textContent = 'Enable';
    toggleBtn.classList.remove('btn-secondary');
    toggleBtn.classList.add('btn-primary');
  }
  
  // Update delay time
  delayTime.textContent = `${config.delaySec}s`;
  
  // Show/hide pro section based on plan
  if (config.plan === 'pro') {
    proSection.style.display = 'block';
  } else {
    proSection.style.display = 'none';
  }
}

// Refresh statistics
async function refreshStats() {
  try {
    await loadStats();
  } catch (error) {
    console.error('Failed to refresh stats:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Refresh site button
  refreshSiteBtn.addEventListener('click', loadCurrentTabStatus);
  
  // Toggle extension
  toggleBtn.addEventListener('click', toggleExtension);
  
  // Clear recent history
  clearHistoryBtn.addEventListener('click', clearRecentHistory);
  
  // Settings button
  settingsBtn.addEventListener('click', openSettings);
  
  // Upgrade button
  upgradeBtn.addEventListener('click', openUpgrade);
  
  // Footer links
  helpLink.addEventListener('click', openHelp);
  feedbackLink.addEventListener('click', openFeedback);
  privacyLink.addEventListener('click', openPrivacy);
}

// Toggle extension on/off
async function toggleExtension() {
  try {
    const newEnabled = !config.enabled;
    
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: { enabled: newEnabled } 
    });
    
    config.enabled = newEnabled;
    updateUI();
    
    console.log(`Extension ${newEnabled ? 'enabled' : 'disabled'}`);
    
  } catch (error) {
    console.error('Failed to toggle extension:', error);
    showError('Failed to update extension status');
  }
}

// Clear recent history
async function clearRecentHistory() {
  try {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to clear recent browsing history? This action cannot be undone.')) {
      return;
    }
    
    clearHistoryBtn.disabled = true;
    clearHistoryBtn.textContent = 'Clearing...';
    
    await chrome.runtime.sendMessage({ 
      action: 'deleteRecentHistory', 
      minutes: 60 // Clear last hour
    });
    
    // Refresh stats
    await loadStats();
    
    showSuccess('Recent history cleared successfully');
    
  } catch (error) {
    console.error('Failed to clear history:', error);
    showError('Failed to clear history');
  } finally {
    clearHistoryBtn.disabled = false;
    clearHistoryBtn.textContent = 'Clear Recent';
  }
}

// Open settings page
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Open upgrade page
function openUpgrade() {
  // Open upgrade page in new tab
  chrome.tabs.create({ url: 'https://autopurge.com/upgrade' });
}

// Open help
function openHelp() {
  chrome.tabs.create({ url: 'https://autopurge.com/help' });
}

// Open feedback
function openFeedback() {
  chrome.tabs.create({ url: 'https://autopurge.com/feedback' });
}

// Open privacy
function openPrivacy() {
  chrome.tabs.create({ url: 'https://autopurge.com/privacy' });
}

// Show success message
function showSuccess(message) {
  // Create temporary success message
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success';
  successDiv.textContent = message;
  
  // Insert after header
  const header = document.querySelector('.header');
  header.parentNode.insertBefore(successDiv, header.nextSibling);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Show error message
function showError(message) {
  // Create temporary error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-warning';
  errorDiv.textContent = message;
  
  // Insert after header
  const header = document.querySelector('.header');
  header.parentNode.insertBefore(errorDiv, header.nextSibling);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Export functions for debugging
window.popupDebug = {
  loadData,
  loadCurrentTabStatus,
  loadStats,
  toggleExtension,
  clearRecentHistory,
  config
};
