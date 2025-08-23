/**
 * Popup script for AutoPurge Extension
 * Responsibilities:
 * - Display current status and statistics
 * - Provide quick history cleanup actions
 * - Show pending deletions queue
 * - Toggle extension on/off
 * - Navigate to options page
 */

// DOM elements
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const deletionsToday = document.getElementById('deletionsToday');
const deletionsTotal = document.getElementById('deletionsTotal');
const domainsCount = document.getElementById('domainsCount');
const delayTime = document.getElementById('delayTime');
const queueSize = document.getElementById('queueSize');
const pendingSection = document.getElementById('pendingSection');
const toggleBtn = document.getElementById('toggleBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Current configuration
let config = {};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  updateUI();
  
  // Refresh data periodically while popup is open
  setInterval(refreshStats, 2000);
});

// Load configuration and statistics
async function loadData() {
  try {
    // Get configuration
    config = await chrome.runtime.sendMessage({ action: 'getConfig' });
    
    if (!config) {
      throw new Error('Failed to load configuration');
    }
    
    // Get current tab status
    await loadCurrentTabStatus();
  } catch (error) {
    console.error('Failed to load data:', error);
    showError('Failed to load extension data');
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
    console.log('Chrome runtime available:', !!chrome.runtime);
    console.log('Chrome tabs available:', !!chrome.tabs);
    
    // First test if background script is responding
    try {
      console.log('Testing background script response...');
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
    
    // Add timeout to prevent hanging
    const tabStatus = await Promise.race([
      chrome.runtime.sendMessage({ action: 'getCurrentTabStatus' }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    ]);
    
    console.log('Received tab status:', tabStatus);
    console.log('Tab status type:', typeof tabStatus);
    console.log('Tab status keys:', tabStatus ? Object.keys(tabStatus) : 'no keys');
    
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
    // Try to provide more helpful error information
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

// Update current site UI
function updateCurrentSiteUI(tabStatus) {
  const siteIcon = document.getElementById('siteIcon');
  const siteName = document.getElementById('siteName');
  const siteStatusEl = document.getElementById('siteStatus');
  const detectionBadge = document.getElementById('detectionBadge');
  const currentSiteStatus = document.getElementById('currentSiteStatus');

  console.log('Updating current site UI with:', tabStatus);

  if (tabStatus.error) {
    // Error occurred
    siteIcon.textContent = '⚠️';
    siteName.textContent = 'Failed to get';
    siteStatusEl.textContent = tabStatus.error;
    detectionBadge.style.display = 'none';
    currentSiteStatus.classList.remove('detected');
    console.error('Tab status error:', tabStatus.error);
  } else if (tabStatus.isMatched) {
    // Site is detected
    siteIcon.textContent = '🔞';
    siteName.textContent = tabStatus.hostname || 'Adult Website';
    siteStatusEl.textContent = `History will be cleared in ${config.delaySec} seconds`;
    detectionBadge.style.display = 'flex';
    currentSiteStatus.classList.add('detected');
    console.log('Site detected as adult content');
  } else if (tabStatus.hostname && tabStatus.hostname !== 'Restricted Page' && tabStatus.hostname !== 'Invalid URL') {
    // Normal site
    siteIcon.textContent = '🌐';
    siteName.textContent = tabStatus.hostname;
    siteStatusEl.textContent = 'This website is not in the monitoring list';
    detectionBadge.style.display = 'none';
    currentSiteStatus.classList.remove('detected');
    console.log('Normal site detected:', tabStatus.hostname);
  } else {
    // Special cases
    siteIcon.textContent = '🌐';
    if (tabStatus.hostname === 'Restricted Page') {
      siteName.textContent = 'Chrome System Page';
      siteStatusEl.textContent = 'Extension cannot run on this page';
    } else if (tabStatus.hostname === 'Invalid URL') {
      siteName.textContent = 'Invalid Page';
      siteStatusEl.textContent = 'Please visit a valid webpage';
    } else {
      siteName.textContent = 'Unable to get current website';
      siteStatusEl.textContent = 'Please refresh or switch to a valid webpage';
    }
    detectionBadge.style.display = 'none';
    currentSiteStatus.classList.remove('detected');
    console.log('Special case handled:', tabStatus.hostname);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Click outside to close popup
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      e.stopPropagation();
    }
  });
  
  // Add refresh site button listener
  const refreshSiteBtn = document.getElementById('refreshSiteBtn');
  if (refreshSiteBtn) {
    refreshSiteBtn.addEventListener('click', loadCurrentTabStatus);
  }
}

// Update UI elements
function updateUI() {
  // Update status indicator
  statusIndicator.className = `status ${config.enabled ? 'enabled' : 'disabled'}`;
  statusText.textContent = config.enabled ? 'Enabled' : 'Disabled';
  
  // Update toggle button
  toggleBtn.textContent = config.enabled ? 'Disable' : 'Enable';
  toggleBtn.className = config.enabled ? 'btn btn-secondary btn-full' : 'btn btn-full';
  
  // Update statistics
  deletionsToday.textContent = config.usage?.deletionsToday || 0;
  deletionsTotal.textContent = config.usage?.deletionsTotal || 0;
  
  // Update monitoring info
  const totalDomains = (config.userDomains?.length || 0) + 20; // 20 preset domains
  domainsCount.textContent = totalDomains;
  delayTime.textContent = config.delaySec || 10;
}

// Refresh statistics from background
async function refreshStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    if (stats) {
      deletionsToday.textContent = stats.deletionsToday || 0;
      deletionsTotal.textContent = stats.deletionsTotal || 0;
      
      // Update pending deletions
      const queueCount = stats.queueSize || 0;
      queueSize.textContent = queueCount;
      pendingSection.style.display = queueCount > 0 ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Failed to refresh stats:', error);
  }
}

// Toggle extension on/off
async function toggleExtension() {
  try {
    showLoading(true);
    
    const newEnabled = !config.enabled;
    const response = await chrome.runtime.sendMessage({
      action: 'updateConfig',
      config: { enabled: newEnabled }
    });
    
    if (response.success) {
      config.enabled = newEnabled;
      updateUI();
      showSuccess(`Extension ${newEnabled ? 'enabled' : 'disabled'}`);
    } else {
      throw new Error('Failed to update configuration');
    }
  } catch (error) {
    console.error('Failed to toggle extension:', error);
    showError('Failed to toggle extension');
  } finally {
    showLoading(false);
  }
}

// Delete recent history
async function deleteRecentHistory(minutes) {
  try {
    showLoading(true);
    
    const response = await chrome.runtime.sendMessage({
      action: 'deleteRecentHistory',
      minutes: minutes
    });
    
    if (response.success) {
      showSuccess(`Deleted history from last ${minutes} minutes`);
      // Refresh stats after deletion
      setTimeout(refreshStats, 500);
    } else {
      throw new Error(response.error || 'Failed to delete history');
    }
  } catch (error) {
    console.error('Failed to delete recent history:', error);
    showError('Failed to delete history');
  } finally {
    showLoading(false);
  }
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

// Show loading indicator
function showLoading(show) {
  loadingIndicator.style.display = show ? 'block' : 'none';
  
  // Disable buttons during loading
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = show;
  });
}

// Show success message
function showSuccess(message) {
  hideMessages();
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
}

// Show error message
function showError(message) {
  hideMessages();
  errorText.textContent = message;
  errorMessage.style.display = 'block';
  
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Hide all messages
function hideMessages() {
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';
}

// Make functions available globally for onclick handlers
window.toggleExtension = toggleExtension;
window.deleteRecentHistory = deleteRecentHistory;
window.openOptions = openOptions;
window.refreshCurrentSite = loadCurrentTabStatus;

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.close();
  } else if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
    toggleExtension();
  }
});

// Close popup when clicking outside (if in a popup window)
document.addEventListener('click', (e) => {
  if (e.target === document.body) {
    window.close();
  }
});
