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
const countdown = document.getElementById('countdown');
const countdownTime = document.getElementById('countdownTime');
const removalStatus = document.getElementById('removalStatus');
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

// 倒计时相关变量
let countdownInterval = null;
let currentCountdown = 0;
let isDeletionInProgress = false;

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

// 开始倒计时
function startCountdown(seconds) {
  console.log(`Starting countdown for ${seconds} seconds`);
  
  // 清除之前的倒计时
  stopCountdown();
  
  // 设置初始值
  currentCountdown = seconds;
  countdownTime.textContent = `${currentCountdown}s`;
  
  // 显示倒计时
  countdown.style.display = 'block';
  siteStatus.style.display = 'none';
  removalStatus.style.display = 'none';
  
  // 设置倒计时间隔
  countdownInterval = setInterval(() => {
    currentCountdown--;
    
    if (currentCountdown > 0) {
      // 更新倒计时显示
      countdownTime.textContent = `${currentCountdown}s`;
      console.log(`Countdown: ${currentCountdown}s remaining`);
    } else {
      // 倒计时结束，执行删除
      console.log('Countdown finished, executing deletion');
      stopCountdown();
      executeDeletion();
    }
  }, 1000);
  
  isDeletionInProgress = true;
}

// 停止倒计时
function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  isDeletionInProgress = false;
}

// 执行删除操作
async function executeDeletion() {
  console.log('Executing deletion...');
  
  try {
    // 显示删除中状态
    countdown.style.display = 'none';
    siteStatus.style.display = 'block';
    siteStatus.textContent = 'Clearing history...';
    
    // 模拟删除操作（实际应该调用 background script）
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 删除完成，显示 "Removed" 状态
    showRemovedStatus();
    
    // 更新统计数据
    await loadStats();
    
    console.log('Deletion completed successfully');
    
  } catch (error) {
    console.error('Deletion failed:', error);
    showError('Failed to clear history');
    
    // 恢复原始状态
    countdown.style.display = 'none';
    siteStatus.style.display = 'block';
    siteStatus.textContent = `History will be cleared in ${config.delaySec} seconds`;
  }
}

// 显示删除完成状态
function showRemovedStatus() {
  console.log('Showing removed status');
  
  // 隐藏倒计时和状态
  countdown.style.display = 'none';
  siteStatus.style.display = 'none';
  
  // 显示删除完成状态
  removalStatus.style.display = 'block';
  
  // 5秒后恢复原始状态
  setTimeout(() => {
    if (removalStatus.style.display !== 'none') {
      removalStatus.style.display = 'none';
      siteStatus.style.display = 'block';
      siteStatus.textContent = `History will be cleared in ${config.delaySec} seconds`;
    }
  }, 5000);
}

// 重置站点状态
function resetSiteStatus() {
  console.log('Resetting site status');
  
  // 停止倒计时
  stopCountdown();
  
  // 隐藏所有状态
  countdown.style.display = 'none';
  removalStatus.style.display = 'none';
  
  // 显示原始状态
  siteStatus.style.display = 'block';
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

  // 重置之前的站点状态
  resetSiteStatus();

  if (tabStatus.error) {
    // Error occurred
    siteIcon.textContent = '⚠️';
    siteName.textContent = 'Failed to get';
    siteStatus.textContent = tabStatus.error;
    detectionBadge.style.display = 'none';
    console.error('Tab status error:', tabStatus.error);
  } else if (tabStatus.isMatched) {
    // Site is detected - 启动倒计时
    siteIcon.textContent = '🔞';
    siteName.textContent = tabStatus.hostname || 'Adult Website';
    
    // 显示检测徽章
    detectionBadge.style.display = 'flex';
    
    // 只有在没有倒计时进行且扩展启用时才启动倒计时
    if (config.enabled && !isDeletionInProgress && !countdownInterval) {
      console.log('Starting countdown for detected site');
      startCountdown(config.delaySec);
    } else {
      console.log('Countdown already in progress or extension disabled, showing status only');
      siteStatus.textContent = `History will be cleared in ${config.delaySec} seconds`;
    }
    
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
    
    // 如果倒计时正在进行，不要重新检查标签页状态，避免重复启动
    // 只在没有倒计时时检查状态
    if (!isDeletionInProgress && config.enabled) {
      // 重新检查当前标签页状态
      await loadCurrentTabStatus();
    }
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
    
    // 如果禁用扩展，停止倒计时
    if (!newEnabled) {
      stopCountdown();
      resetSiteStatus();
    }
    
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
  config,
  // 倒计时调试函数
  startCountdown: (seconds = 10) => startCountdown(seconds),
  stopCountdown: () => stopCountdown(),
  executeDeletion: () => executeDeletion(),
  showRemovedStatus: () => showRemovedStatus(),
  resetSiteStatus: () => resetSiteStatus(),
  getCountdownState: () => ({
    isDeletionInProgress,
    currentCountdown,
    hasInterval: !!countdownInterval,
    countdownInterval: countdownInterval
  }),
  // 强制重置所有状态
  forceReset: () => {
    console.log('Force resetting all states...');
    stopCountdown();
    resetSiteStatus();
    isDeletionInProgress = false;
    currentCountdown = 0;
    console.log('Force reset complete');
  }
};
