/**
 * Options page script for AutoPurge Extension
 * Handles settings, user management, and payment processing
 */

// Navigation functionality for left-right layout
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show target section
      contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) {
          section.classList.add('active');
        }
      });
    });
  });
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

// 获取 DOM 元素的函数
function getDOMElements() {
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
  
  console.log('DOM elements found:');
  console.log('presetDomainsList:', presetDomainsList);
  console.log('customDomainsList:', customDomainsList);
  console.log('newDomainInput:', newDomainInput);
  console.log('addDomainBtn:', addDomainBtn);
}

// Current configuration
let config = {};
let presetDomains = [];
let user = null;

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Options page initialized');
  
  // 首先获取 DOM 元素
  getDOMElements();
  
  // 设置导航
  setupNavigation();
  
  // 加载数据
  await loadData();
  
  // 设置事件监听器
  setupEventListeners();
  
  // 更新 UI
  updateUI();
  
  console.log('Initialization complete');
});

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
    
    console.log('Options data loaded successfully:', { config, presetDomains, user });
    
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
