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
const planBadge = document.getElementById('plan-badge');

// License management elements
const licenseStatus = document.getElementById('licenseStatus');
const licenseInfo = document.getElementById('licenseInfo');
const licenseActivation = document.getElementById('licenseActivation');
const licenseKeyInput = document.getElementById('licenseKeyInput');
const activateLicenseBtn = document.getElementById('activateLicenseBtn');
const licenseError = document.getElementById('licenseError');
const licenseSuccess = document.getElementById('licenseSuccess');
const licenseActions = document.getElementById('licenseActions');
const manageLicenseBtn = document.getElementById('manageLicenseBtn');
const deactivateLicenseBtn = document.getElementById('deactivateLicenseBtn');

// Current configuration
let config = {};

// 倒计时相关变量
let countdownInterval = null;
let currentCountdown = 0;
let isDeletionInProgress = false;

// 记录已处理的URL，避免重复删除
let processedUrls = new Set();

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup initialized');
  await loadData();
  await updatePlanBadge();
  await updateLicenseStatus();
  setupEventListeners();
  updateUI();

  // Listen for license changes
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'license:activated' || message.type === 'license:changed' || message.type === 'license:deactivated') {
      updatePlanBadge();
      updateLicenseStatus();
    }
  });

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
  console.log('=== POPUP startCountdown START ===');
  console.log(`Starting countdown for ${seconds} seconds`);
  console.log('Current config:', config);
  console.log('isDeletionInProgress:', isDeletionInProgress);
  console.log('countdownInterval:', countdownInterval);
  
  // 清除之前的倒计时
  stopCountdown();
  
  // 设置初始值
  currentCountdown = seconds;
  countdownTime.textContent = `${currentCountdown}s`;
  
  // 显示倒计时
  countdown.style.display = 'block';
  siteStatus.style.display = 'none';
  removalStatus.style.display = 'none';
  
  console.log('Countdown UI updated, starting interval...');
  
  // 设置倒计时间隔
  countdownInterval = setInterval(() => {
    currentCountdown--;
    
    if (currentCountdown > 0) {
      // 更新倒计时显示
      countdownTime.textContent = `${currentCountdown}s`;
      console.log(`Countdown: ${currentCountdown}s remaining`);
    } else {
      // 倒计时结束，执行删除
      console.log('=== COUNTDOWN FINISHED, EXECUTING DELETION ===');
      stopCountdown();
      executeDeletion();
    }
  }, 1000);
  
  isDeletionInProgress = true;
  console.log('=== POPUP startCountdown SUCCESS ===');
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
  console.log('=== POPUP executeDeletion START ===');
  console.log('Current config:', config);
  
  try {
    // 显示删除中状态
    siteStatus.style.display = 'block';
    siteStatus.textContent = 'Clearing history...';
    
    console.log('Sending message to background script...');
    // 调用 background script 执行真正的删除
    const response = await chrome.runtime.sendMessage({ action: 'executeDeletion' });
    console.log('Background script response:', response);
    
    if (response && response.success) {
      // 删除完成，显示 "Removed" 状态
      console.log('Deletion successful, showing removed status');
      showRemovedStatus();
      
      // 更新统计数据
      await loadStats();
      
      console.log('=== POPUP executeDeletion SUCCESS ===');
    } else {
      console.error('Background script returned error:', response);
      throw new Error(response?.error || 'Deletion failed');
    }
    
  } catch (error) {
    console.error('=== POPUP executeDeletion ERROR ===');
    console.error('Deletion failed:', error);
    showError('Failed to clear history');
    
    // 恢复原始状态
    siteStatus.style.display = 'block';
    siteStatus.textContent = `History will be cleared immediately`;
  }
}

// 显示删除完成状态
function showRemovedStatus() {
  console.log('Showing removed status');
  
  // 隐藏状态
  siteStatus.style.display = 'none';
  
  // 显示删除完成状态
  removalStatus.style.display = 'block';
  
  // 设置删除完成标志，防止重新启动删除
  isDeletionInProgress = true;
  
  // 5秒后恢复原始状态
  setTimeout(() => {
    if (removalStatus.style.display !== 'none') {
      removalStatus.style.display = 'none';
      siteStatus.style.display = 'block';
      siteStatus.textContent = `History will be cleared immediately`;
      isDeletionInProgress = false;
    }
  }, 5000);
}

// 重置站点状态
function resetSiteStatus() {
  console.log('Resetting site status');
  
  // 隐藏所有状态
  removalStatus.style.display = 'none';
  
  // 显示原始状态
  siteStatus.style.display = 'block';
  
  // 重置状态
  isDeletionInProgress = false;
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
    console.log('=== SITE DETECTED AS MATCHED ===');
    console.log('tabStatus:', tabStatus);
    console.log('config.enabled:', config.enabled);
    console.log('isDeletionInProgress:', isDeletionInProgress);
    console.log('countdownInterval:', countdownInterval);

    siteIcon.textContent = '🌐';
    siteName.textContent = tabStatus.hostname || 'Monitored Website';

    // 显示检测徽章
    detectionBadge.style.display = 'flex';

    // 检查URL是否已处理过
    const currentUrl = tabStatus.url || tabStatus.hostname;
    if (processedUrls.has(currentUrl)) {
      console.log('=== URL ALREADY PROCESSED, SKIPPING ===');
      // 显示已删除状态
      removalStatus.style.display = 'block';
      siteStatus.style.display = 'none';
      return;
    }

    // 直接执行删除，不需要倒计时
    if (config.enabled && !isDeletionInProgress) {
      console.log('=== CONDITIONS MET, EXECUTING DELETION DIRECTLY ===');
      // 标记URL已处理
      processedUrls.add(currentUrl);
      executeDeletion();
    } else {
      console.log('=== CONDITIONS NOT MET, SHOWING STATUS ONLY ===');
      console.log('Reason: enabled=' + config.enabled + ', inProgress=' + isDeletionInProgress);
      siteStatus.textContent = `History will be cleared immediately`;
    }

    console.log('Site detected as monitored content');
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
let lastCheckedUrl = null;
async function refreshStats() {
  try {
    await loadStats();

    // 获取当前标签页URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tab?.url || '';

    // 如果URL变化了，清除已处理记录
    if (currentUrl !== lastCheckedUrl) {
      console.log('URL changed, clearing processed URLs');
      processedUrls.clear();
      lastCheckedUrl = currentUrl;
    }

    // 如果删除已完成，不要重新检查标签页状态
    // 只在没有删除完成状态时检查状态
    if (!isDeletionInProgress && config.enabled && removalStatus.style.display === 'none') {
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

  // License management
  activateLicenseBtn.addEventListener('click', activateLicense);
  deactivateLicenseBtn.addEventListener('click', deactivateLicense);
  manageLicenseBtn.addEventListener('click', manageLicense);

  // License key input
  licenseKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      activateLicense();
    }
  });

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

// 测试调试函数
function testDebug() {
  console.log('=== TEST DEBUG START ===');
  console.log('Current config:', config);
  console.log('isDeletionInProgress:', isDeletionInProgress);
  console.log('countdownInterval:', countdownInterval);
  console.log('currentCountdown:', currentCountdown);
  
  // 显示在页面上
  const debugInfo = `
Config: ${JSON.stringify(config, null, 2)}
isDeletionInProgress: ${isDeletionInProgress}
countdownInterval: ${!!countdownInterval}
currentCountdown: ${currentCountdown}
  `;
  
  alert('Debug Info:\n' + debugInfo);
  console.log('=== TEST DEBUG END ===');
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
    processedUrls.clear();
    lastCheckedUrl = null;
    console.log('Force reset complete');
  },
  // 测试调试
  testDebug: () => testDebug()
};

// Update plan badge based on license state
async function updatePlanBadge() {
  if (!planBadge) {
    console.error('planBadge element not found!');
    return;
  }

  try {
    console.log('=== Updating plan badge ===');
    const response = await chrome.runtime.sendMessage({ action: 'license:getState' });
    console.log('License state response:', response);

    const license = response || { plan: 'free' };
    console.log('License plan:', license.plan);
    console.log('Has license:', license.hasLicense);
    console.log('License data:', license.licenseData);

    // Reset classes
    planBadge.className = 'ap-badge';

    // Update badge based on plan
    if (license.plan === 'pro') {
      console.log('Setting badge to Pro');
      planBadge.classList.add('ap-badge--pro');
      planBadge.textContent = 'Pro';
    } else if (license.plan === 'pro_trial') {
      console.log('Setting badge to Trial');
      planBadge.classList.add('ap-badge--trial');
      planBadge.textContent = 'Trial';
    } else {
      console.log('Setting badge to Free');
      planBadge.classList.add('ap-badge--free');
      planBadge.textContent = 'Free';
    }

    console.log('Badge classes:', planBadge.className);
    console.log('Badge text:', planBadge.textContent);

  } catch (error) {
    console.error('Failed to update plan badge:', error);
    // Default to free on error
    planBadge.className = 'ap-badge ap-badge--free';
    planBadge.textContent = 'Free';
  }
}

// License Management Functions

async function updateLicenseStatus() {
  try {
    const licenseState = await chrome.runtime.sendMessage({ action: 'license:getState' });

    if (licenseState && licenseState.hasLicense && licenseState.licenseData) {
      // Has active license
      const licenseData = licenseState.licenseData;
      const expiresAt = new Date(licenseData.expiresAt);

      licenseInfo.innerHTML = `
        <span class="license-text">License active until ${expiresAt.toLocaleDateString()}</span>
      `;

      // Show license management buttons, hide activation form
      licenseActivation.style.display = 'none';
      licenseActions.style.display = 'flex';
      upgradeBtn.style.display = 'none';

      proSection.setAttribute('data-has-license', 'true');
    } else {
      // No license
      licenseInfo.innerHTML = `
        <span class="license-text">No active license</span>
      `;

      // Show activation form, hide license management buttons
      licenseActivation.style.display = 'block';
      licenseActions.style.display = 'none';
      upgradeBtn.style.display = 'block';

      proSection.setAttribute('data-has-license', 'false');
    }
  } catch (error) {
    console.error('Failed to update license status:', error);
    licenseInfo.innerHTML = `
      <span class="license-text">Error loading license status</span>
    `;
  }
}

async function activateLicense() {
  const licenseKey = licenseKeyInput.value.trim();

  if (!licenseKey) {
    showLicenseError('Please enter a license key');
    return;
  }

  // Validate license key format
  if (!/^AP-\d{4}-[A-Z0-9]{6}$/.test(licenseKey)) {
    showLicenseError('Invalid license key format. Expected: AP-YYYY-XXXXXX');
    return;
  }

  try {
    activateLicenseBtn.disabled = true;
    activateLicenseBtn.textContent = 'Activating...';
    clearLicenseMessages();

    const result = await chrome.runtime.sendMessage({
      action: 'license:activate',
      licenseKey: licenseKey
    });

    if (result.ok) {
      showLicenseSuccess('License activated successfully!');
      licenseKeyInput.value = '';

      // Update status after a short delay
      setTimeout(() => {
        updateLicenseStatus();
        updatePlanBadge();
      }, 1000);
    } else {
      showLicenseError(result.error || 'License activation failed');
    }
  } catch (error) {
    console.error('License activation error:', error);
    showLicenseError('Failed to activate license. Please try again.');
  } finally {
    activateLicenseBtn.disabled = false;
    activateLicenseBtn.textContent = 'Activate';
  }
}

async function deactivateLicense() {
  if (!confirm('Are you sure you want to deactivate this license? This will downgrade your account to free.')) {
    return;
  }

  try {
    deactivateLicenseBtn.disabled = true;
    deactivateLicenseBtn.textContent = 'Deactivating...';

    const result = await chrome.runtime.sendMessage({
      action: 'license:deactivate'
    });

    if (result.ok) {
      // Update status
      updateLicenseStatus();
      updatePlanBadge();
    } else {
      alert('Failed to deactivate license: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('License deactivation error:', error);
    alert('Failed to deactivate license. Please try again.');
  } finally {
    deactivateLicenseBtn.disabled = false;
    deactivateLicenseBtn.textContent = 'Deactivate';
  }
}

async function manageLicense() {
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'license:info'
    });

    if (result.ok && result.data) {
      const licenseData = result.data;
      alert(`License Information:
- Email: ${licenseData.license.email}
- Plan: ${licenseData.license.plan}
- Devices: ${licenseData.stats.activeDevices}/${licenseData.license.maxDevices}
- Expires: ${new Date(licenseData.license.expiresAt).toLocaleDateString()}`);
    } else {
      alert('Failed to get license information');
    }
  } catch (error) {
    console.error('License info error:', error);
    alert('Failed to get license information');
  }
}

function showLicenseError(message) {
  licenseError.textContent = message;
  licenseError.style.display = 'block';
  licenseSuccess.style.display = 'none';
}

function showLicenseSuccess(message) {
  licenseSuccess.textContent = message;
  licenseSuccess.style.display = 'block';
  licenseError.style.display = 'none';
}

function clearLicenseMessages() {
  licenseError.style.display = 'none';
  licenseSuccess.style.display = 'none';
}

// 全局测试函数
window.testDebug = testDebug;
