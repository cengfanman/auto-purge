/**
 * Options page script for AutoPurge Extension
 * Handles settings, user management, and payment processing
 */

// Navigation functionality for left-right layout
function setupNavigation() {
  console.log('Setting up navigation...');
  
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');
  
  console.log('Found nav items:', navItems.length);
  console.log('Found content sections:', contentSections.length);
  
  navItems.forEach((item, index) => {
    console.log(`Setting up nav item ${index}:`, item.dataset.section);
    
    item.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Nav item clicked:', item.dataset.section);
      
      const targetSection = item.dataset.section;
      
      // Update active nav item
      navItems.forEach(nav => {
        nav.classList.remove('active');
      });
      item.classList.add('active');
      
      // Show target section
      contentSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
        
        if (section.id === targetSection) {
          section.classList.add('active');
          section.style.display = 'block';
          console.log('Showing section:', section.id);
        }
      });
      
      // 特殊处理：如果是历史记录页面，强制刷新内容
      if (targetSection === 'history') {
        console.log('History section activated, refreshing content...');
        setTimeout(() => {
          updateHistoryUI();
        }, 100);
      }
    });
  });
  
  console.log('Navigation setup complete');
}

// DOM elements - 初始化为 null，稍后获取
let userName = null;
let userEmail = null;
let planBadge = null;
let signInBtn = null;
let signUpBtn = null;
let upgradeBtn = null;
let enabledToggle = null;
let delayInput = null;
let freeLimitInput = null;
let shadowHistoryToggle = null;
let analyticsToggle = null;
let prioritySupportToggle = null;
let presetDomainsList = null;
let customDomainsList = null;
let newDomainInput = null;
let addDomainBtn = null;
let subscribeBtn = null;
let saveBtn = null;
let resetBtn = null;
let exportBtn = null;
let importBtn = null;

// Password protection elements (simplified for debugging)
let securityCurrentTimeSpan = null;
let securityPageLoadedSpan = null;

// History records elements (simplified for debugging)
let currentTimeSpan = null;
let pageLoadedSpan = null;

// Advanced features elements (simplified for debugging)
let featuresCurrentTimeSpan = null;
let featuresPageLoadedSpan = null;

// 获取 DOM 元素的函数
function getDOMElements() {
  console.log('Getting DOM elements...');
  
  userName = document.getElementById('userName');
  userEmail = document.getElementById('userEmail');
  planBadge = document.getElementById('planBadge');
  signInBtn = document.getElementById('signInBtn');
  signUpBtn = document.getElementById('signUpBtn');
  upgradeBtn = document.getElementById('upgradeBtn');
  enabledToggle = document.getElementById('enabledToggle');
  delayInput = document.getElementById('delayInput');
  freeLimitInput = document.getElementById('freeLimitInput');
  shadowHistoryToggle = document.getElementById('shadowHistoryToggle');
  analyticsToggle = document.getElementById('analyticsToggle');
  prioritySupportToggle = document.getElementById('prioritySupportToggle');
  presetDomainsList = document.getElementById('presetDomainsList');
  customDomainsList = document.getElementById('customDomainsList');
  newDomainInput = document.getElementById('newDomainInput');
  addDomainBtn = document.getElementById('addDomainBtn');
  subscribeBtn = document.getElementById('subscribeBtn');
  saveBtn = document.getElementById('saveBtn');
  resetBtn = document.getElementById('resetBtn');
  exportBtn = document.getElementById('exportBtn');
  importBtn = document.getElementById('importBtn');
  
  // Password protection elements (simplified for debugging)
  securityCurrentTimeSpan = document.getElementById('securityCurrentTime');
  securityPageLoadedSpan = document.getElementById('securityPageLoaded');
  
  // History records elements (simplified for debugging)
  currentTimeSpan = document.getElementById('currentTime');
  pageLoadedSpan = document.getElementById('pageLoaded');
  
  // Advanced features elements (simplified for debugging)
  featuresCurrentTimeSpan = document.getElementById('featuresCurrentTime');
  featuresPageLoadedSpan = document.getElementById('featuresPageLoaded');
  
  console.log('DOM elements found:');
  console.log('presetDomainsList:', presetDomainsList);
  console.log('customDomainsList:', customDomainsList);
  console.log('newDomainInput:', newDomainInput);
  console.log('addDomainBtn:', addDomainBtn);
  console.log('currentTimeSpan:', currentTimeSpan);
  console.log('pageLoadedSpan:', pageLoadedSpan);
  console.log('securityCurrentTimeSpan:', securityCurrentTimeSpan);
  console.log('securityPageLoadedSpan:', securityPageLoadedSpan);
  console.log('featuresCurrentTimeSpan:', featuresCurrentTimeSpan);
  console.log('featuresPageLoadedSpan:', featuresPageLoadedSpan);
  
  // 检查关键元素是否存在
  if (!presetDomainsList) {
    console.error('presetDomainsList not found!');
  }
  if (!customDomainsList) {
    console.error('customDomainsList not found!');
  }
  if (!currentTimeSpan) {
    console.error('currentTimeSpan not found!');
  }
  if (!securityCurrentTimeSpan) {
    console.error('securityCurrentTimeSpan not found!');
  }
  if (!featuresCurrentTimeSpan) {
    console.error('featuresCurrentTimeSpan not found!');
  }
}

// Current configuration
let config = {};
let presetDomains = [];
let user = null;
let historyRecords = [];
let passwordConfig = {
  enabled: false,
  hash: null,
  salt: null
};

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Options page initialized');
  
  // 首先获取 DOM 元素
  getDOMElements();
  
  // 设置导航
  setupNavigation();
  
  // 强制显示默认内容
  forceShowContent();
  
  // 加载数据
  await loadData();
  
  // 设置事件监听器
  setupEventListeners();
  
  // 更新 UI
  updateUI();
  
  console.log('Initialization complete');
});

// 强制显示内容的函数
function forceShowContent() {
  console.log('Force showing content...');
  
  // 确保默认显示 Overview 部分
  const overviewSection = document.getElementById('overview');
  if (overviewSection) {
    overviewSection.classList.add('active');
    overviewSection.style.display = 'block';
    console.log('Overview section activated');
  }
  
  // 确保其他部分隐藏
  const allSections = document.querySelectorAll('.content-section');
  allSections.forEach(section => {
    if (section.id !== 'overview') {
      section.classList.remove('active');
      section.style.display = 'none';
    }
  });
  
  // 确保导航项正确设置
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === 'overview') {
      item.classList.add('active');
    }
  });
  
  console.log('Content display forced');
}

// Load configuration and data
async function loadData() {
  try {
    console.log('Loading options data...');
    
    // Get configuration
    try {
      config = await chrome.runtime.sendMessage({ action: 'getConfig' });
      console.log('Config loaded from chrome.runtime:', config);
    } catch (chromeError) {
      console.warn('Chrome runtime message failed, using default config:', chromeError);
      config = null;
    }
    
    if (!config) {
      console.log('Using default configuration');
      // Set default config
      config = {
        enabled: false,
        delaySec: 10,
        freeLimit: 10,
        userDomains: [],
        plan: 'free',
        usage: { deletionsToday: 0, deletionsTotal: 0 }
      };
    }
    
    // Load preset domains - 确保这个总是被调用
    console.log('Loading preset domains...');
    await loadPresetDomains();
    
    // Load user data
    await loadUserData();
    
    // Load password configuration
    await loadPasswordConfig();
    
    // Load history records
    await loadHistoryRecords();
    
    // Load history settings
    await loadHistorySettings();
    
    console.log('Options data loaded successfully:', { config, presetDomains, user, passwordConfig, historyRecords });
    
  } catch (error) {
    console.error('Failed to load options data:', error);
    showError('Failed to load extension data');
    
    // 即使出错也要设置默认配置
    if (!config) {
      config = {
        enabled: false,
        delaySec: 10,
        freeLimit: 10,
        userDomains: [],
        plan: 'free',
        usage: { deletionsToday: 0, deletionsTotal: 0 }
      };
    }
    
    // 确保预设域名被加载
    if (!presetDomains || presetDomains.length === 0) {
      console.log('Loading preset domains after error...');
      await loadPresetDomains();
    }
  }
}

// Load preset domains
async function loadPresetDomains() {
  try {
    console.log('Loading preset domains...');
    const response = await fetch(chrome.runtime.getURL('data/preset-domains.json'));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    presetDomains = data.domains || [];
    console.log(`Loaded ${presetDomains.length} preset domains from JSON file`);
    
  } catch (error) {
    console.error('Failed to load preset domains from JSON file:', error);
    console.log('Using fallback preset domains...');
    
    // 备用预设域名列表
    presetDomains = [
      "google.com",
      "facebook.com", 
      "youtube.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com",
      "reddit.com",
      "amazon.com",
      "netflix.com",
      "spotify.com"
    ];
    
    console.log(`Using ${presetDomains.length} fallback preset domains`);
  }
  
  // 确保 presetDomains 是数组
  if (!Array.isArray(presetDomains)) {
    console.warn('Preset domains is not an array, converting...');
    presetDomains = [];
  }
  
  // 如果没有域名，强制添加一些测试域名
  if (presetDomains.length === 0) {
    console.log('No preset domains found, adding test domains...');
    presetDomains = [
      "test1.com",
      "test2.com", 
      "test3.com",
      "test4.com",
      "test5.com"
    ];
  }
  
  console.log('Final preset domains:', presetDomains);
  
  // 立即尝试更新域名列表（如果 DOM 已经准备好）
  if (presetDomainsList) {
    console.log('DOM ready, updating domain lists immediately');
    updateDomainLists();
  } else {
    console.log('DOM not ready yet, will update later');
  }
}

// Load user data
async function loadUserData() {
  try {
    // Check if user is logged in
    const storedUser = localStorage.getItem('autopurge_user');
    if (storedUser) {
      user = JSON.parse(storedUser);
      console.log('User loaded from storage:', user);
    } else {
      user = null;
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
    user = null;
  }
}

// Load password configuration
async function loadPasswordConfig() {
  try {
    const stored = localStorage.getItem('autopurge_password');
    if (stored) {
      passwordConfig = JSON.parse(stored);
      console.log('Password config loaded:', passwordConfig);
    } else {
      passwordConfig = { enabled: false, hash: null, salt: null };
    }
  } catch (error) {
    console.error('Failed to load password config:', error);
    passwordConfig = { enabled: false, hash: null, salt: null };
  }
}

// Load history records
async function loadHistoryRecords() {
  try {
    const stored = await chrome.storage.local.get(['historyRecords']);
    if (stored.historyRecords) {
      historyRecords = stored.historyRecords;
      console.log('History records loaded:', historyRecords.length, 'records');
    } else {
      historyRecords = [];
    }
  } catch (error) {
    console.error('Failed to load history records:', error);
    historyRecords = [];
  }
}

// Load history settings
async function loadHistorySettings() {
  try {
    const stored = await chrome.storage.local.get(['historySettings']);
    if (stored.historySettings) {
      const settings = stored.historySettings;
      if (autoRecordToggle) autoRecordToggle.checked = settings.autoRecord || true;
      if (maxRecordsInput) maxRecordsInput.value = settings.maxRecords || 1000;
      if (retentionDaysInput) retentionDaysInput.value = settings.retentionDays || 30;
      console.log('History settings loaded:', settings);
    } else {
      // Set default values
      if (autoRecordToggle) autoRecordToggle.checked = true;
      if (maxRecordsInput) maxRecordsInput.value = 1000;
      if (retentionDaysInput) retentionDaysInput.value = 30;
    }
  } catch (error) {
    console.error('Failed to load history settings:', error);
    // Set default values on error
    if (autoRecordToggle) autoRecordToggle.checked = true;
    if (maxRecordsInput) maxRecordsInput.value = 1000;
    if (retentionDaysInput) retentionDaysInput.value = 30;
  }
}

// Setup event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // User management
  if (signInBtn) signInBtn.addEventListener('click', showSignInModal);
  if (signUpBtn) signUpBtn.addEventListener('click', showSignUpModal);
  if (upgradeBtn) upgradeBtn.addEventListener('click', showUpgradeModal);
  
  // Settings toggles
  if (enabledToggle) enabledToggle.addEventListener('change', updateConfig);
  if (delayInput) delayInput.addEventListener('change', updateConfig);
  if (freeLimitInput) freeLimitInput.addEventListener('change', updateConfig);
  
  // Pro feature toggles
  if (shadowHistoryToggle) shadowHistoryToggle.addEventListener('change', updateProFeatures);
  if (analyticsToggle) analyticsToggle.addEventListener('change', updateProFeatures);
  if (prioritySupportToggle) prioritySupportToggle.addEventListener('change', updateProFeatures);
  
  // Domain management
  if (addDomainBtn) addDomainBtn.addEventListener('click', addCustomDomain);
  if (newDomainInput) {
    newDomainInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addCustomDomain();
    });
  }
  
  // Payment
  if (subscribeBtn) subscribeBtn.addEventListener('click', processSubscription);
  
  // Save/Reset
  if (saveBtn) saveBtn.addEventListener('click', saveSettings);
  if (resetBtn) resetBtn.addEventListener('click', resetToDefaults);
  if (exportBtn) exportBtn.addEventListener('click', exportSettings);
  if (importBtn) importBtn.addEventListener('click', importSettings);
  
  // Payment method selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => selectPaymentMethod(method));
  });
  
  // Password protection
  if (passwordEnabledToggle) passwordEnabledToggle.addEventListener('change', togglePasswordProtection);
  if (updatePasswordBtn) updatePasswordBtn.addEventListener('click', updatePassword);
  if (removePasswordBtn) removePasswordBtn.addEventListener('click', removePassword);
  
  // History records (simplified for debugging)
  // No complex event listeners for now
  
  console.log('Event listeners setup complete');
}

// Update UI based on configuration
function updateUI() {
  console.log('Updating UI...');
  
  // Update toggles
  if (enabledToggle) enabledToggle.checked = config.enabled;
  if (delayInput) delayInput.value = config.delaySec;
  if (freeLimitInput) freeLimitInput.value = config.freeLimit;
  
  // Update pro features
  if (shadowHistoryToggle) shadowHistoryToggle.checked = config.plan === 'pro' && config.shadowHistory;
  if (analyticsToggle) analyticsToggle.checked = config.plan === 'pro' && config.analytics;
  if (prioritySupportToggle) prioritySupportToggle.checked = config.plan === 'pro' && config.prioritySupport;
  
  // Disable pro features if not pro plan
  const proFeatures = [shadowHistoryToggle, analyticsToggle, prioritySupportToggle];
  proFeatures.forEach(toggle => {
    if (toggle) {
      toggle.disabled = config.plan !== 'pro';
    }
  });
  
  // Update user interface
  updateUserInterface();
  
  // Update domain lists - 确保域名列表被更新
  updateDomainLists();
  
  // Update password protection UI
  updatePasswordUI();
  
  // Update history records UI (simplified for debugging)
  updateTestInfo();
  
  // 添加调试信息
  console.log('UI updated, preset domains:', presetDomains);
  console.log('UI updated, custom domains:', config.userDomains);
  
  console.log('UI update complete');
}

// Update user interface
function updateUserInterface() {
  console.log('Updating user interface...');
  
  if (user) {
    if (userName) userName.textContent = user.name || 'User';
    if (userEmail) userEmail.textContent = user.email;
    if (planBadge) {
      planBadge.textContent = user.plan || 'Free';
      planBadge.className = `plan-badge ${user.plan === 'pro' ? 'pro' : ''}`;
    }
    
    if (signInBtn) signInBtn.style.display = 'none';
    if (signUpBtn) signUpBtn.style.display = 'none';
    if (upgradeBtn) upgradeBtn.style.display = user.plan !== 'pro' ? 'block' : 'none';
  } else {
    if (userName) userName.textContent = 'Guest User';
    if (userEmail) userEmail.textContent = 'Not signed in';
    if (planBadge) {
      planBadge.textContent = 'Free';
      planBadge.className = 'plan-badge';
    }
    
    if (signInBtn) signInBtn.style.display = 'block';
    if (signUpBtn) signUpBtn.style.display = 'block';
    if (upgradeBtn) upgradeBtn.style.display = 'none';
  }
  
  console.log('User interface update complete');
}

// Update domain lists
function updateDomainLists() {
  console.log('Updating domain lists...');
  console.log('Preset domains:', presetDomains);
  console.log('Custom domains:', config.userDomains);
  
  // Update preset domains
  if (presetDomainsList) {
    console.log('Preset domains list element found:', presetDomainsList);
    
    // 只有当有预设域名时才清空并重新填充
    if (presetDomains && presetDomains.length > 0) {
      presetDomainsList.innerHTML = '';
      presetDomains.forEach(domain => {
        const domainItem = createDomainItem(domain, 'preset');
        presetDomainsList.appendChild(domainItem);
        console.log('Added preset domain:', domain);
      });
    } else {
      console.log('No preset domains to display, keeping static content');
    }
  } else {
    console.error('Preset domains list element not found!');
  }
  
  // Update custom domains
  if (customDomainsList) {
    console.log('Custom domains list element found:', customDomainsList);
    
    // 只有当有自定义域名时才清空并重新填充
    if (config.userDomains && config.userDomains.length > 0) {
      customDomainsList.innerHTML = '';
      config.userDomains.forEach(domain => {
        const domainItem = createDomainItem(domain, 'custom');
        customDomainsList.appendChild(domainItem);
        console.log('Added custom domain:', domain);
      });
    } else {
      console.log('No custom domains to display, keeping static content');
    }
  } else {
    console.error('Custom domains list element not found!');
  }
  
  console.log('Domain lists update complete');
}

// Create domain item element
function createDomainItem(domain, type) {
  const item = document.createElement('div');
  item.className = `domain-item ${type}`;
  
  const domainName = document.createElement('span');
  domainName.className = 'domain-name';
  domainName.textContent = domain;
  
  item.appendChild(domainName);
  
  if (type === 'custom') {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeCustomDomain(domain));
    item.appendChild(removeBtn);
  }
  
  return item;
}

// Add custom domain
async function addCustomDomain() {
  const domain = newDomainInput.value.trim().toLowerCase();
  
  console.log('Adding custom domain:', domain);
  
  if (!domain) {
    showError('Please enter a domain name');
    return;
  }
  
  // Validate domain format
  if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/.test(domain)) {
    showError('Please enter a valid domain name (e.g., example.com)');
    return;
  }
  
  // Check if domain already exists
  if (presetDomains.includes(domain) || (config.userDomains || []).includes(domain)) {
    showError('Domain already exists');
    return;
  }
  
  // Check free plan limit
  if (config.plan === 'free' && (config.userDomains || []).length >= config.freeLimit) {
    showError(`Free plan limit reached (${config.freeLimit} domains). Please upgrade to Pro for unlimited domains.`);
    return;
  }
  
  try {
    // Add domain to config
    if (!config.userDomains) config.userDomains = [];
    config.userDomains.push(domain);
    
    console.log('Domain added to config, new userDomains:', config.userDomains);
    
    // Try to update configuration via chrome.runtime.sendMessage
    try {
      await chrome.runtime.sendMessage({ 
        action: 'updateConfig', 
        config: { userDomains: config.userDomains } 
      });
      console.log('Configuration updated via chrome.runtime.sendMessage');
    } catch (chromeError) {
      console.warn('Chrome runtime message failed, continuing with local update:', chromeError);
      // 如果 chrome.runtime.sendMessage 失败，我们仍然可以继续本地更新
    }
    
    // Update UI
    updateDomainLists();
    newDomainInput.value = '';
    
    showSuccess(`Domain "${domain}" added successfully`);
    
  } catch (error) {
    console.error('Failed to add domain:', error);
    showError('Failed to add domain');
  }
}

// Remove custom domain
async function removeCustomDomain(domain) {
  console.log('Removing custom domain:', domain);
  
  try {
    // Remove domain from config
    config.userDomains = config.userDomains.filter(d => d !== domain);
    
    console.log('Domain removed from config, new userDomains:', config.userDomains);
    
    // Try to update configuration via chrome.runtime.sendMessage
    try {
      await chrome.runtime.sendMessage({ 
        action: 'updateConfig', 
        config: { userDomains: config.userDomains } 
      });
      console.log('Configuration updated via chrome.runtime.sendMessage');
    } catch (chromeError) {
      console.warn('Chrome runtime message failed, continuing with local update:', chromeError);
      // 如果 chrome.runtime.sendMessage 失败，我们仍然可以继续本地更新
    }
    
    // Update UI
    updateDomainLists();
    
    showSuccess(`Domain "${domain}" removed successfully`);
    
  } catch (error) {
    console.error('Failed to remove domain:', error);
    showError('Failed to remove domain');
  }
}

// Update configuration
async function updateConfig() {
  try {
    const updates = {};
    
    if (enabledToggle.checked !== config.enabled) {
      updates.enabled = enabledToggle.checked;
    }
    
    if (parseInt(delayInput.value) !== config.delaySec) {
      updates.delaySec = parseInt(delayInput.value);
    }
    
    if (parseInt(freeLimitInput.value) !== config.freeLimit) {
      updates.freeLimit = parseInt(freeLimitInput.value);
    }
    
    if (Object.keys(updates).length > 0) {
      await chrome.runtime.sendMessage({ 
        action: 'updateConfig', 
        config: updates 
      });
      
      Object.assign(config, updates);
      showSuccess('Settings updated successfully');
    }
    
  } catch (error) {
    console.error('Failed to update config:', error);
    showError('Failed to update settings');
  }
}

// Update pro features
async function updateProFeatures() {
  if (config.plan !== 'pro') {
    showError('Pro features require a Pro subscription');
    return;
  }
  
  try {
    const updates = {
      shadowHistory: shadowHistoryToggle.checked,
      analytics: analyticsToggle.checked,
      prioritySupport: prioritySupportToggle.checked
    };
    
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: updates 
    });
    
    Object.assign(config, updates);
    showSuccess('Pro features updated successfully');
    
  } catch (error) {
    console.error('Failed to update pro features:', error);
    showError('Failed to update pro features');
  }
}

// Select payment method
function selectPaymentMethod(method) {
  // Remove previous selection
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
  
  // Select new method
  method.classList.add('selected');
}

// Process subscription
async function processSubscription() {
  const selectedMethod = document.querySelector('.payment-method.selected');
  
  if (!selectedMethod) {
    showError('Please select a payment method');
    return;
  }
  
  const paymentMethod = selectedMethod.dataset.method;
  
  try {
    // Show loading state
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = 'Processing...';
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user plan
    user = {
      name: 'Pro User',
      email: 'user@example.com',
      plan: 'pro',
      subscriptionId: 'sub_' + Date.now()
    };
    
    // Save user data
    localStorage.setItem('autopurge_user', JSON.stringify(user));
    
    // Update config
    config.plan = 'pro';
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: { plan: 'pro' } 
    });
    
    // Update UI
    updateUI();
    
    showSuccess('Successfully upgraded to Pro! Welcome to premium features.');
    
  } catch (error) {
    console.error('Subscription failed:', error);
    showError('Subscription failed. Please try again.');
  } finally {
    subscribeBtn.disabled = false;
    subscribeBtn.textContent = 'Subscribe Now';
  }
}

// Save settings
async function saveSettings() {
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    // Save all current settings
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: config 
    });
    
    showSuccess('Settings saved successfully');
    
  } catch (error) {
    console.error('Failed to save settings:', error);
    showError('Failed to save settings');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

// Reset to defaults
async function resetToDefaults() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
    return;
  }
  
  try {
    resetBtn.disabled = true;
    resetBtn.textContent = 'Resetting...';
    
    // Reset config to defaults
    config = {
      enabled: false,
      delaySec: 10,
      freeLimit: 10,
      userDomains: [],
      plan: 'free',
      usage: { deletionsToday: 0, deletionsTotal: 0 }
    };
    
    // Update configuration
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: config 
    });
    
    // Update UI
    updateUI();
    
    showSuccess('Settings reset to defaults');
    
  } catch (error) {
    console.error('Failed to reset settings:', error);
    showError('Failed to reset settings');
  } finally {
    resetBtn.disabled = false;
    resetBtn.textContent = 'Reset to Defaults';
  }
}

// Export settings
function exportSettings() {
  try {
    const exportData = {
      config: config,
      user: user,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopurge-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccess('Settings exported successfully');
    
  } catch (error) {
    console.error('Failed to export settings:', error);
    showError('Failed to export settings');
  }
}

// Import settings
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.config) {
        config = { ...config, ...importData.config };
        await chrome.runtime.sendMessage({ 
          action: 'updateConfig', 
          config: config 
        });
      }
      
      if (importData.user) {
        user = importData.user;
        localStorage.setItem('autopurge_user', JSON.stringify(user));
      }
      
      updateUI();
      showSuccess('Settings imported successfully');
      
    } catch (error) {
      console.error('Failed to import settings:', error);
      showError('Failed to import settings. Invalid file format.');
    }
  };
  
  input.click();
}

// Show sign in modal
function showSignInModal() {
  // Simple modal for demo purposes
  const email = prompt('Enter your email:');
  const password = prompt('Enter your password:');
  
  if (email && password) {
    // Simulate authentication
    user = {
      name: 'User',
      email: email,
      plan: 'free'
    };
    
    localStorage.setItem('autopurge_user', JSON.stringify(user));
    updateUI();
    showSuccess('Signed in successfully');
  }
}

// Show sign up modal
function showSignUpModal() {
  const name = prompt('Enter your name:');
  const email = prompt('Enter your email:');
  const password = prompt('Enter your password:');
  
  if (name && email && password) {
    // Simulate registration
    user = {
      name: name,
      email: email,
      plan: 'free'
    };
    
    localStorage.setItem('autopurge_user', JSON.stringify(user));
    updateUI();
    showSuccess('Account created successfully');
  }
}

// Show upgrade modal
function showUpgradeModal() {
  // Redirect to payment section
  document.querySelector('.payment-section').scrollIntoView({ behavior: 'smooth' });
}

// Show success message
function showSuccess(message) {
  showMessage(message, 'success');
}

// Show error message
function showError(message) {
  showMessage(message, 'error');
}

// Show message
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'warning'}`;
  messageDiv.textContent = message;
  
  // 添加样式
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  
  // 根据类型设置背景色
  if (type === 'success') {
    messageDiv.style.background = '#27ae60';
  } else {
    messageDiv.style.background = '#e74c3c';
  }
  
  // 添加到页面
  document.body.appendChild(messageDiv);
  
  // 添加动画样式
  if (!document.getElementById('message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 移除消息
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, type === 'success' ? 3000 : 5000);
}

// Export functions for debugging
window.optionsDebug = {
  config,
  user,
  presetDomains,
  loadData,
  updateConfig,
  addCustomDomain,
  removeCustomDomain,
  updateDomainLists,
  loadPresetDomains,
  // 添加测试函数
  testAddDomain: () => {
    const testDomain = 'test' + Date.now() + '.com';
    console.log('Testing add domain with:', testDomain);
    if (window.optionsDebug.config.userDomains) {
      window.optionsDebug.config.userDomains.push(testDomain);
      window.optionsDebug.updateDomainLists();
      console.log('Test domain added:', testDomain);
    }
  },
  testRemoveDomain: () => {
    if (window.optionsDebug.config.userDomains && window.optionsDebug.config.userDomains.length > 0) {
      const removedDomain = window.optionsDebug.config.userDomains.pop();
      window.optionsDebug.updateDomainLists();
      console.log('Test domain removed:', removedDomain);
    }
  },
  forceRefreshDomains: () => {
    console.log('Force refreshing domains...');
    console.log('Current preset domains:', presetDomains);
    console.log('Current custom domains:', config.userDomains);
    updateDomainLists();
    console.log('Force refresh complete');
  }
};

// 全局函数，方便从 HTML 调用
window.forceRefreshDomains = () => {
  window.optionsDebug.forceRefreshDomains();
};

// ==================== 密码功能实现 ====================

// 生成随机盐值
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 使用 Web Crypto API 进行密码哈希
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 验证密码
async function verifyPassword(password, hash, salt) {
  const hashedPassword = await hashPassword(password, salt);
  return hashedPassword === hash;
}

// 更新密码保护 UI
function updatePasswordUI() {
  if (!passwordEnabledToggle || !passwordSettings) return;
  
  passwordEnabledToggle.checked = passwordConfig.enabled;
  passwordSettings.style.display = passwordConfig.enabled ? 'block' : 'none';
  
  // 清空密码输入框
  if (currentPasswordInput) currentPasswordInput.value = '';
  if (newPasswordInput) newPasswordInput.value = '';
  if (confirmPasswordInput) confirmPasswordInput.value = '';
}

// 切换密码保护
async function togglePasswordProtection() {
  const enabled = passwordEnabledToggle.checked;
  
  if (enabled) {
    // 启用密码保护 - 需要设置密码
    const password = prompt('Enter a password to protect AutoPurge settings:');
    if (!password) {
      passwordEnabledToggle.checked = false;
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      passwordEnabledToggle.checked = false;
      return;
    }
    
    try {
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      
      passwordConfig = {
        enabled: true,
        hash: hash,
        salt: salt
      };
      
      localStorage.setItem('autopurge_password', JSON.stringify(passwordConfig));
      updatePasswordUI();
      showSuccess('Password protection enabled');
      
    } catch (error) {
      console.error('Failed to enable password protection:', error);
      showError('Failed to enable password protection');
      passwordEnabledToggle.checked = false;
    }
  } else {
    // 禁用密码保护
    passwordConfig = { enabled: false, hash: null, salt: null };
    localStorage.removeItem('autopurge_password');
    updatePasswordUI();
    showSuccess('Password protection disabled');
  }
}

// 更新密码
async function updatePassword() {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showError('Please fill in all password fields');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showError('New passwords do not match');
    return;
  }
  
  if (newPassword.length < 6) {
    showError('New password must be at least 6 characters long');
    return;
  }
  
  try {
    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, passwordConfig.hash, passwordConfig.salt);
    if (!isValid) {
      showError('Current password is incorrect');
      return;
    }
    
    // 生成新的哈希
    const salt = generateSalt();
    const hash = await hashPassword(newPassword, salt);
    
    passwordConfig = {
      enabled: true,
      hash: hash,
      salt: salt
    };
    
    localStorage.setItem('autopurge_password', JSON.stringify(passwordConfig));
    
    // 清空输入框
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    
    showSuccess('Password updated successfully');
    
  } catch (error) {
    console.error('Failed to update password:', error);
    showError('Failed to update password');
  }
}

// 移除密码
async function removePassword() {
  const currentPassword = currentPasswordInput.value;
  
  if (!currentPassword) {
    showError('Please enter current password to remove password protection');
    return;
  }
  
  try {
    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, passwordConfig.hash, passwordConfig.salt);
    if (!isValid) {
      showError('Current password is incorrect');
      return;
    }
    
    passwordConfig = { enabled: false, hash: null, salt: null };
    localStorage.removeItem('autopurge_password');
    
    // 清空输入框并更新 UI
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    passwordEnabledToggle.checked = false;
    updatePasswordUI();
    
    showSuccess('Password protection removed');
    
  } catch (error) {
    console.error('Failed to remove password:', error);
    showError('Failed to remove password');
  }
}

// ==================== 简化测试功能 ====================

// 更新测试信息
function updateTestInfo() {
  console.log('Updating test info...');
  
  // History Records 页面
  if (currentTimeSpan) {
    currentTimeSpan.textContent = new Date().toLocaleString();
    console.log('✅ History current time updated');
  } else {
    console.log('❌ currentTimeSpan not found');
  }
  
  if (pageLoadedSpan) {
    pageLoadedSpan.textContent = new Date().toLocaleString();
    console.log('✅ History page loaded time updated');
  } else {
    console.log('❌ pageLoadedSpan not found');
  }
  
  // Security 页面
  if (securityCurrentTimeSpan) {
    securityCurrentTimeSpan.textContent = new Date().toLocaleString();
    console.log('✅ Security current time updated');
  } else {
    console.log('❌ securityCurrentTimeSpan not found');
  }
  
  if (securityPageLoadedSpan) {
    securityPageLoadedSpan.textContent = new Date().toLocaleString();
    console.log('✅ Security page loaded time updated');
  } else {
    console.log('❌ securityPageLoadedSpan not found');
  }
  
  // Advanced Features 页面
  if (featuresCurrentTimeSpan) {
    featuresCurrentTimeSpan.textContent = new Date().toLocaleString();
    console.log('✅ Features current time updated');
  } else {
    console.log('❌ featuresCurrentTimeSpan not found');
  }
  
  if (featuresPageLoadedSpan) {
    featuresPageLoadedSpan.textContent = new Date().toLocaleString();
    console.log('✅ Features page loaded time updated');
  } else {
    console.log('❌ featuresPageLoadedSpan not found');
  }
  
  console.log('Test info update complete');
}

// ==================== 历史记录功能实现 ====================

// 更新历史记录 UI
function updateHistoryUI() {
  if (!historyList || !totalRecords || !todayRecords || !weekRecords || !storageUsed) return;
  
  // 更新统计信息
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  const todayCount = historyRecords.filter(record => record.deletedAt >= today.getTime()).length;
  const weekCount = historyRecords.filter(record => record.deletedAt >= weekAgo).length;
  const totalCount = historyRecords.length;
  
  // 计算存储使用量
  const storageSize = JSON.stringify(historyRecords).length;
  const storageMB = (storageSize / (1024 * 1024)).toFixed(2);
  
  totalRecords.textContent = totalCount;
  todayRecords.textContent = todayCount;
  weekRecords.textContent = weekCount;
  storageUsed.textContent = storageMB + ' MB';
  
  // 更新历史记录列表
  updateHistoryList();
}

// 更新历史记录列表
function updateHistoryList() {
  if (!historyList) return;
  
  if (historyRecords.length === 0) {
    historyList.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #7f8c8d;">
        <div style="font-size: 48px; margin-bottom: 10px;">📜</div>
        <div>No history records found</div>
        <div style="font-size: 12px; margin-top: 5px;">Deleted browsing history will appear here</div>
      </div>
    `;
    return;
  }
  
  // 按删除时间倒序排列
  const sortedRecords = [...historyRecords].sort((a, b) => b.deletedAt - a.deletedAt);
  
  let html = '';
  sortedRecords.forEach(record => {
    const deletedDate = new Date(record.deletedAt);
    const timeAgo = getTimeAgo(record.deletedAt);
    
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-bottom: 1px solid #eee; background: white;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; color: #2c3e50; margin-bottom: 4px; word-break: break-all;">
            ${record.title || record.url}
          </div>
          <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 2px; word-break: break-all;">
            ${record.url}
          </div>
          <div style="font-size: 11px; color: #95a5a6;">
            Deleted ${timeAgo} • ${deletedDate.toLocaleString()}
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button onclick="viewHistoryRecord('${record.id}')" style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            View
          </button>
          <button onclick="deleteHistoryRecord('${record.id}')" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            Delete
          </button>
        </div>
      </div>
    `;
  });
  
  historyList.innerHTML = html;
}

// 获取相对时间
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// 刷新历史记录
async function refreshHistoryRecords() {
  await loadHistoryRecords();
  updateHistoryUI();
  showSuccess('History records refreshed');
}

// 导出历史记录
function exportHistoryRecords() {
  if (historyRecords.length === 0) {
    showError('No history records to export');
    return;
  }
  
  try {
    const exportData = {
      records: historyRecords,
      exportDate: new Date().toISOString(),
      totalRecords: historyRecords.length
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopurge-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccess('History records exported successfully');
    
  } catch (error) {
    console.error('Failed to export history records:', error);
    showError('Failed to export history records');
  }
}

// 清空历史记录
async function clearHistoryRecords() {
  if (historyRecords.length === 0) {
    showError('No history records to clear');
    return;
  }
  
  if (!confirm(`Are you sure you want to clear all ${historyRecords.length} history records? This action cannot be undone.`)) {
    return;
  }
  
  try {
    historyRecords = [];
    await chrome.storage.local.remove(['historyRecords']);
    updateHistoryUI();
    showSuccess('All history records cleared');
    
  } catch (error) {
    console.error('Failed to clear history records:', error);
    showError('Failed to clear history records');
  }
}

// 过滤历史记录
function filterHistoryRecords() {
  if (!historyFilter) return;
  
  const filter = historyFilter.value;
  const now = Date.now();
  let filteredRecords = [...historyRecords];
  
  switch (filter) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredRecords = historyRecords.filter(record => record.deletedAt >= today.getTime());
      break;
    case 'week':
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
      filteredRecords = historyRecords.filter(record => record.deletedAt >= weekAgo);
      break;
    case 'month':
      const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
      filteredRecords = historyRecords.filter(record => record.deletedAt >= monthAgo);
      break;
  }
  
  // 更新显示
  updateHistoryListWithFilter(filteredRecords);
}

// 搜索历史记录
function searchHistoryRecords() {
  if (!historySearch) return;
  
  const searchTerm = historySearch.value.toLowerCase();
  if (!searchTerm) {
    updateHistoryList();
    return;
  }
  
  const filteredRecords = historyRecords.filter(record => 
    record.url.toLowerCase().includes(searchTerm) || 
    (record.title && record.title.toLowerCase().includes(searchTerm))
  );
  
  updateHistoryListWithFilter(filteredRecords);
}

// 使用过滤后的记录更新列表
function updateHistoryListWithFilter(filteredRecords) {
  if (!historyList) return;
  
  if (filteredRecords.length === 0) {
    historyList.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #7f8c8d;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
        <div>No matching records found</div>
        <div style="font-size: 12px; margin-top: 5px;">Try adjusting your search or filter</div>
      </div>
    `;
    return;
  }
  
  // 按删除时间倒序排列
  const sortedRecords = [...filteredRecords].sort((a, b) => b.deletedAt - a.deletedAt);
  
  let html = '';
  sortedRecords.forEach(record => {
    const deletedDate = new Date(record.deletedAt);
    const timeAgo = getTimeAgo(record.deletedAt);
    
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-bottom: 1px solid #eee; background: white;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; color: #2c3e50; margin-bottom: 4px; word-break: break-all;">
            ${record.title || record.url}
          </div>
          <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 2px; word-break: break-all;">
            ${record.url}
          </div>
          <div style="font-size: 11px; color: #95a5a6;">
            Deleted ${timeAgo} • ${deletedDate.toLocaleString()}
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button onclick="viewHistoryRecord('${record.id}')" style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            View
          </button>
          <button onclick="deleteHistoryRecord('${record.id}')" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            Delete
          </button>
        </div>
      </div>
    `;
  });
  
  historyList.innerHTML = html;
}

// 更新历史记录设置
async function updateHistorySettings() {
  if (!autoRecordToggle || !maxRecordsInput || !retentionDaysInput) return;
  
  const settings = {
    autoRecord: autoRecordToggle.checked,
    maxRecords: parseInt(maxRecordsInput.value),
    retentionDays: parseInt(retentionDaysInput.value)
  };
  
  try {
    await chrome.storage.local.set({ historySettings: settings });
    showSuccess('History settings updated');
  } catch (error) {
    console.error('Failed to update history settings:', error);
    showError('Failed to update history settings');
  }
}

// 查看历史记录详情
function viewHistoryRecord(recordId) {
  const record = historyRecords.find(r => r.id === recordId);
  if (!record) return;
  
  const details = `
URL: ${record.url}
Title: ${record.title || 'No title'}
Deleted: ${new Date(record.deletedAt).toLocaleString()}
Domain: ${record.domain || 'Unknown'}
  `;
  
  alert(details);
}

// 删除单个历史记录
async function deleteHistoryRecord(recordId) {
  if (!confirm('Are you sure you want to delete this history record?')) return;
  
  try {
    historyRecords = historyRecords.filter(r => r.id !== recordId);
    await chrome.storage.local.set({ historyRecords: historyRecords });
    updateHistoryUI();
    showSuccess('History record deleted');
  } catch (error) {
    console.error('Failed to delete history record:', error);
    showError('Failed to delete history record');
  }
}

// 添加历史记录（供 background script 调用）
function addHistoryRecord(url, title, domain) {
  const record = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    url: url,
    title: title || '',
    domain: domain || '',
    deletedAt: Date.now()
  };
  
  historyRecords.unshift(record);
  
  // 限制记录数量
  const maxRecords = 1000; // 默认最大记录数
  if (historyRecords.length > maxRecords) {
    historyRecords = historyRecords.slice(0, maxRecords);
  }
  
  chrome.storage.local.set({ historyRecords: historyRecords });
  updateHistoryUI();
}

// 重新加载预设域名
async function reloadPresetDomains() {
  try {
    reloadDomainsBtn.disabled = true;
    reloadDomainsBtn.textContent = 'Reloading...';
    
    const response = await chrome.runtime.sendMessage({ action: 'reloadPresetDomains' });
    
    if (response.success) {
      presetDomains = response.domains;
      updateDomainLists();
      showSuccess(`Reloaded ${presetDomains.length} preset domains`);
    } else {
      showError('Failed to reload domains: ' + response.error);
    }
    
  } catch (error) {
    console.error('Failed to reload preset domains:', error);
    showError('Failed to reload domains');
  } finally {
    reloadDomainsBtn.disabled = false;
    reloadDomainsBtn.textContent = 'Reload Domains';
  }
}

// 导出函数供全局使用
window.viewHistoryRecord = viewHistoryRecord;
window.deleteHistoryRecord = deleteHistoryRecord;
window.addHistoryRecord = addHistoryRecord;

// 调试函数
window.debugOptions = {
  // 检查页面状态
  checkPageStatus: () => {
    console.log('=== 页面状态检查 ===');
    console.log('DOM 加载完成:', document.readyState);
    console.log('当前活动部分:', document.querySelector('.content-section.active')?.id);
    console.log('导航项数量:', document.querySelectorAll('.nav-item').length);
    console.log('内容部分数量:', document.querySelectorAll('.content-section').length);
    
    // 检查关键元素
    const keyElements = [
      'presetDomainsList', 'customDomainsList', 'currentTimeSpan', 
      'pageLoadedSpan', 'securityCurrentTime', 'securityPageLoaded',
      'featuresCurrentTime', 'featuresPageLoaded'
    ];
    
    keyElements.forEach(id => {
      const element = document.getElementById(id);
      console.log(`${id}:`, element ? '✅ 找到' : '❌ 未找到');
    });
  },
  
  // 强制显示所有内容
  forceShowAll: () => {
    console.log('强制显示所有内容...');
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
      section.style.display = 'block';
      section.classList.add('active');
    });
    console.log('所有内容已显示');
  },
  
  // 重置到默认状态
  resetToDefault: () => {
    console.log('重置到默认状态...');
    forceShowContent();
    console.log('已重置到默认状态');
  },
  
  // 测试历史记录功能
  testHistoryRecords: () => {
    console.log('测试历史记录功能...');
    updateTestInfo();
    console.log('历史记录功能测试完成');
  }
};

console.log('调试函数已加载，可以使用:');
console.log('- window.debugOptions.checkPageStatus() - 检查页面状态');
console.log('- window.debugOptions.forceShowAll() - 强制显示所有内容');
console.log('- window.debugOptions.resetToDefault() - 重置到默认状态');
console.log('- window.debugOptions.testHistoryRecords() - 测试历史记录功能');
