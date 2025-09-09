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
        console.log('=== HISTORY SECTION ACTIVATED ===');
        console.log('Refreshing history content...');
        setTimeout(async () => {
          console.log('Calling updateHistoryUI...');
          // 确保DOM元素存在
          if (!historyList) {
            console.log('History list element not found, re-getting DOM elements...');
            getDOMElements();
            console.log('After re-getting DOM elements, historyList:', historyList);
          }
          console.log('About to call updateHistoryUI, historyList:', historyList);
          await updateHistoryUI();
          console.log('updateHistoryUI completed');
        }, 200);
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
let presetDomainsList = null;
let customDomainsList = null;
let newDomainInput = null;
let addDomainBtn = null;
let subscribeBtn = null;
let saveBtn = null;
let resetBtn = null;
let exportBtn = null;
let importBtn = null;

// Password protection elements
let passwordEnabledToggle = null;
let passwordSettings = null;
let passwordStatus = null;
let passwordStatusText = null;
let currentPasswordDiv = null;
let currentPasswordInput = null;
let newPasswordInput = null;
let confirmPasswordInput = null;
let updatePasswordBtn = null;
let deletePasswordBtn = null;

// Password verification modal elements
let passwordVerifyModal = null;
let verifyPasswordInput = null;
let verifyCancelBtn = null;
let verifyConfirmBtn = null;

// Create password modal elements
let createPasswordModal = null;
let createPasswordInput = null;
let createConfirmPasswordInput = null;
let createCancelBtn = null;
let createConfirmBtn = null;

// Delete password modal elements
let deletePasswordModal = null;
let deleteHistoryRecords = null;
let deleteCancelBtn = null;
let deleteConfirmBtn = null;


// History records elements
let refreshHistoryBtn = null;
let exportHistoryBtn = null;
let clearHistoryBtn = null;
let historyFilter = null;
let historySearch = null;
let historyStats = null;
let historyList = null;
let totalRecords = null;
let todayRecords = null;
let weekRecords = null;
let storageUsed = null;
let autoRecordToggle = null;
let maxRecordsInput = null;
let retentionDaysInput = null;
let reloadDomainsBtn = null;

// Advanced features elements
let shadowHistoryToggle = null;
let analyticsToggle = null;
let prioritySupportToggle = null;
let apiAccessToggle = null;
let upgradeToProBtn = null;
let shadowHistoryStatus = null;
let shadowHistoryCount = null;
let analyticsStatus = null;
let analyticsCount = null;
let prioritySupportStatus = null;
let prioritySupportTime = null;
let apiAccessStatus = null;
let apiKeyDisplay = null;

// 获取 DOM 元素的函数
function getDOMElements() {
  console.log('Getting DOM elements...');
  
  userName = document.getElementById('userName');
  userEmail = document.getElementById('userEmail');
  planBadge = document.getElementById('planBadge');
  signInBtn = document.getElementById('signInBtn');
  signUpBtn = document.getElementById('signUpBtn');
  upgradeBtn = document.getElementById('upgradeBtn');
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
  
  // Password protection elements
  passwordEnabledToggle = document.getElementById('passwordEnabledToggle');
  passwordSettings = document.getElementById('passwordSettings');
  passwordStatus = document.getElementById('passwordStatus');
  passwordStatusText = document.getElementById('passwordStatusText');
  currentPasswordDiv = document.getElementById('currentPasswordDiv');
  currentPasswordInput = document.getElementById('currentPasswordInput');
  newPasswordInput = document.getElementById('newPasswordInput');
  confirmPasswordInput = document.getElementById('confirmPasswordInput');
  updatePasswordBtn = document.getElementById('updatePasswordBtn');
  deletePasswordBtn = document.getElementById('removePasswordBtn');
  
  // Password verification modal elements
  passwordVerifyModal = document.getElementById('passwordVerifyModal');
  verifyPasswordInput = document.getElementById('verifyPasswordInput');
  verifyCancelBtn = document.getElementById('verifyCancelBtn');
  verifyConfirmBtn = document.getElementById('verifyConfirmBtn');
  
  // Create password modal elements
  createPasswordModal = document.getElementById('createPasswordModal');
  createPasswordInput = document.getElementById('createPasswordInput');
  createConfirmPasswordInput = document.getElementById('createConfirmPasswordInput');
  createCancelBtn = document.getElementById('createCancelBtn');
  createConfirmBtn = document.getElementById('createConfirmBtn');
  
  // Delete password modal elements
  deletePasswordModal = document.getElementById('deletePasswordModal');
  deleteHistoryRecords = document.getElementById('deleteHistoryRecords');
  deleteCancelBtn = document.getElementById('deleteCancelBtn');
  deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
  
  
  // History records elements
  refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
  exportHistoryBtn = document.getElementById('exportHistoryBtn');
  clearHistoryBtn = document.getElementById('clearHistoryBtn');
  historyFilter = document.getElementById('historyFilter');
  historySearch = document.getElementById('historySearch');
  historyStats = document.getElementById('historyStats');
  historyList = document.getElementById('historyList');
  console.log('historyList element found:', historyList);
  totalRecords = document.getElementById('totalRecords');
  todayRecords = document.getElementById('todayRecords');
  weekRecords = document.getElementById('weekRecords');
  storageUsed = document.getElementById('storageUsed');
  autoRecordToggle = document.getElementById('autoRecordToggle');
  maxRecordsInput = document.getElementById('maxRecordsInput');
  retentionDaysInput = document.getElementById('retentionDaysInput');
  reloadDomainsBtn = document.getElementById('reloadDomainsBtn');
  
  // Advanced features elements
  shadowHistoryToggle = document.getElementById('shadowHistoryToggle');
  analyticsToggle = document.getElementById('analyticsToggle');
  prioritySupportToggle = document.getElementById('prioritySupportToggle');
  apiAccessToggle = document.getElementById('apiAccessToggle');
  upgradeToProBtn = document.getElementById('upgradeToProBtn');
  shadowHistoryStatus = document.getElementById('shadowHistoryStatus');
  shadowHistoryCount = document.getElementById('shadowHistoryCount');
  analyticsStatus = document.getElementById('analyticsStatus');
  analyticsCount = document.getElementById('analyticsCount');
  prioritySupportStatus = document.getElementById('prioritySupportStatus');
  prioritySupportTime = document.getElementById('prioritySupportTime');
  apiAccessStatus = document.getElementById('apiAccessStatus');
  apiKeyDisplay = document.getElementById('apiKeyDisplay');
  
  console.log('DOM elements found:');
  console.log('presetDomainsList:', presetDomainsList);
  console.log('customDomainsList:', customDomainsList);
  console.log('newDomainInput:', newDomainInput);
  console.log('addDomainBtn:', addDomainBtn);
  console.log('passwordEnabledToggle:', passwordEnabledToggle);
  console.log('refreshHistoryBtn:', refreshHistoryBtn);
  console.log('shadowHistoryToggle:', shadowHistoryToggle);
  
  // 检查关键元素是否存在
  if (!presetDomainsList) {
    console.error('presetDomainsList not found!');
  }
  if (!customDomainsList) {
    console.error('customDomainsList not found!');
  }
  if (!passwordEnabledToggle) {
    console.error('passwordEnabledToggle not found!');
  }
  if (!refreshHistoryBtn) {
    console.error('refreshHistoryBtn not found!');
  }
  if (!shadowHistoryToggle) {
    console.error('shadowHistoryToggle not found!');
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
  
  // 设置历史记录按钮的事件委托
  setupHistoryButtonDelegation();
  
  // 设置调试按钮的事件监听器
  setupDebugButtonListeners();
  
  // 初始化许可证管理
  initializeLicenseManagement();
  
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

// 设置历史记录按钮的事件委托
function setupHistoryButtonDelegation() {
  console.log('Setting up history button delegation...');
  
  // 使用事件委托处理历史记录按钮点击
  document.addEventListener('click', function(event) {
    // Copy按钮
    if (event.target.classList.contains('copy-history-btn')) {
      event.preventDefault();
      const recordId = event.target.getAttribute('data-record-id');
      console.log('Copy button clicked for record:', recordId);
      copyHistoryRecord(recordId);
    }
    
    // View按钮
    if (event.target.classList.contains('view-history-btn')) {
      event.preventDefault();
      const recordId = event.target.getAttribute('data-record-id');
      console.log('View button clicked for record:', recordId);
      viewHistoryRecord(recordId);
    }
    
    // Delete按钮
    if (event.target.classList.contains('delete-history-btn')) {
      event.preventDefault();
      const recordId = event.target.getAttribute('data-record-id');
      console.log('Delete button clicked for record:', recordId);
      deleteHistoryRecord(recordId);
    }
  });
  
  console.log('History button delegation setup complete');
}

// 设置调试按钮的事件监听器
function setupDebugButtonListeners() {
  console.log('Setting up debug button listeners...');
  
  // 获取调试按钮
  const logPresetDomainsBtn = document.getElementById('logPresetDomainsBtn');
  const reloadDataBtn = document.getElementById('reloadDataBtn');
  const testAddDomainBtn = document.getElementById('testAddDomainBtn');
  const testRemoveDomainBtn = document.getElementById('testRemoveDomainBtn');
  const forceRefreshDomainsBtn = document.getElementById('forceRefreshDomainsBtn');
  const logCustomDomainsBtn = document.getElementById('logCustomDomainsBtn');
  const refreshListsBtn = document.getElementById('refreshListsBtn');
  
  // 添加事件监听器
  if (logPresetDomainsBtn) {
    logPresetDomainsBtn.addEventListener('click', () => {
      console.log('Preset domains:', window.optionsDebug?.presetDomains);
    });
  }
  
  if (reloadDataBtn) {
    reloadDataBtn.addEventListener('click', () => {
      window.optionsDebug?.loadData();
    });
  }
  
  if (testAddDomainBtn) {
    testAddDomainBtn.addEventListener('click', () => {
      window.optionsDebug?.testAddDomain();
    });
  }
  
  if (testRemoveDomainBtn) {
    testRemoveDomainBtn.addEventListener('click', () => {
      window.optionsDebug?.testRemoveDomain();
    });
  }
  
  if (forceRefreshDomainsBtn) {
    forceRefreshDomainsBtn.addEventListener('click', () => {
      forceRefreshDomains();
    });
  }
  
  if (logCustomDomainsBtn) {
    logCustomDomainsBtn.addEventListener('click', () => {
      console.log('Custom domains:', window.optionsDebug?.config?.userDomains);
    });
  }
  
  if (refreshListsBtn) {
    refreshListsBtn.addEventListener('click', () => {
      window.optionsDebug?.updateDomainLists();
    });
  }
  
  console.log('Debug button listeners setup complete');
}

// Setup event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // User management
  if (signInBtn) signInBtn.addEventListener('click', showSignInModal);
  if (signUpBtn) signUpBtn.addEventListener('click', showSignUpModal);
  if (upgradeBtn) upgradeBtn.addEventListener('click', showUpgradeModal);
  
  
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
  if (deletePasswordBtn) deletePasswordBtn.addEventListener('click', removePassword);
  
  // Password verification modal
  if (verifyCancelBtn) verifyCancelBtn.addEventListener('click', () => hidePasswordVerifyModal(true));
  if (verifyConfirmBtn) verifyConfirmBtn.addEventListener('click', confirmPasswordVerification);
  if (verifyPasswordInput) {
    verifyPasswordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmPasswordVerification();
      }
    });
  }
  
  // 点击模态框背景关闭
  if (passwordVerifyModal) {
    passwordVerifyModal.addEventListener('click', (e) => {
      if (e.target === passwordVerifyModal) {
        hidePasswordVerifyModal(true);
      }
    });
  }
  
  // Create password modal
  if (createCancelBtn) createCancelBtn.addEventListener('click', hideCreatePasswordModal);
  if (createConfirmBtn) createConfirmBtn.addEventListener('click', confirmCreatePassword);
  if (createPasswordInput) {
    createPasswordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmCreatePassword();
      }
    });
  }
  if (createConfirmPasswordInput) {
    createConfirmPasswordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmCreatePassword();
      }
    });
  }
  
  // 点击模态框背景关闭
  if (createPasswordModal) {
    createPasswordModal.addEventListener('click', (e) => {
      if (e.target === createPasswordModal) {
        hideCreatePasswordModal();
      }
    });
  }
  
  // Delete password modal
  if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', hideDeletePasswordModal);
  if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmDeletePassword);
  
  // 点击模态框背景关闭
  if (deletePasswordModal) {
    deletePasswordModal.addEventListener('click', (e) => {
      if (e.target === deletePasswordModal) {
        hideDeletePasswordModal();
      }
    });
  }
  
  // History records
  if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', refreshHistoryRecords);
  if (exportHistoryBtn) exportHistoryBtn.addEventListener('click', exportHistoryRecords);
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistoryRecords);
  if (historyFilter) historyFilter.addEventListener('change', filterHistoryRecords);
  if (historySearch) historySearch.addEventListener('input', searchHistoryRecords);
  if (autoRecordToggle) autoRecordToggle.addEventListener('change', updateHistorySettings);
  if (maxRecordsInput) maxRecordsInput.addEventListener('change', updateHistorySettings);
  if (retentionDaysInput) retentionDaysInput.addEventListener('change', updateHistorySettings);
  
  // Advanced features
  if (shadowHistoryToggle) shadowHistoryToggle.addEventListener('change', toggleShadowHistory);
  if (analyticsToggle) analyticsToggle.addEventListener('change', toggleAnalytics);
  if (prioritySupportToggle) prioritySupportToggle.addEventListener('change', togglePrioritySupport);
  if (apiAccessToggle) apiAccessToggle.addEventListener('change', toggleApiAccess);
  if (upgradeToProBtn) upgradeToProBtn.addEventListener('click', upgradeToPro);
  
  console.log('Event listeners setup complete');
}

// Update UI based on configuration
function updateUI() {
  console.log('Updating UI...');
  
  
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
  
  // Update history records UI
  updateHistoryUI();
  
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
    
    // No general settings to update anymore
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
async function updatePasswordUI() {
  if (!passwordEnabledToggle) return;
  
  try {
    // 检查是否已有密码和密码保护状态
    const stored = await chrome.storage.local.get(['passwordHash', 'passwordProtectionEnabled']);
    const hasPassword = !!stored.passwordHash;
    const isProtectionEnabled = stored.passwordProtectionEnabled === true;
    
    // 更新复选框状态
    passwordEnabledToggle.checked = isProtectionEnabled;
    
    // 更新密码状态显示
    if (passwordStatus && passwordStatusText) {
      if (hasPassword && isProtectionEnabled) {
        passwordStatus.style.display = 'block';
        passwordStatus.style.background = '#d4edda';
        passwordStatus.style.border = '1px solid #c3e6cb';
        passwordStatusText.textContent = '✅ Password is set and protection is enabled';
        passwordStatusText.style.color = '#155724';
      } else if (hasPassword && !isProtectionEnabled) {
        passwordStatus.style.display = 'block';
        passwordStatus.style.background = '#fff3cd';
        passwordStatus.style.border = '1px solid #ffeaa7';
        passwordStatusText.textContent = '⚠️ Password is set but protection is disabled';
        passwordStatusText.style.color = '#856404';
      } else {
        // 无密码状态（无论保护是否启用，都显示无密码状态）
        passwordStatus.style.display = 'block';
        passwordStatus.style.background = '#e2e3e5';
        passwordStatus.style.border = '1px solid #d6d8db';
        passwordStatusText.textContent = 'ℹ️ No password set - password protection is disabled';
        passwordStatusText.style.color = '#6c757d';
      }
    }
    
    // 密码设置区域现在直接显示/隐藏
    if (passwordSettings) {
      passwordSettings.style.display = isProtectionEnabled ? 'block' : 'none';
    }
    
    if (currentPasswordDiv) {
      currentPasswordDiv.style.display = (isProtectionEnabled && hasPassword) ? 'block' : 'none';
    }
    
    // 更新删除密码按钮状态
    if (deletePasswordBtn) {
      if (hasPassword) {
        deletePasswordBtn.disabled = false;
        deletePasswordBtn.style.opacity = '1';
        deletePasswordBtn.style.cursor = 'pointer';
        deletePasswordBtn.title = 'Delete password and all history records';
      } else {
        deletePasswordBtn.disabled = true;
        deletePasswordBtn.style.opacity = '0.5';
        deletePasswordBtn.style.cursor = 'not-allowed';
        deletePasswordBtn.title = 'No password to delete';
      }
    }
    
    // 清空密码输入框
    if (currentPasswordInput) currentPasswordInput.value = '';
    if (newPasswordInput) newPasswordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    
    console.log('Password protection UI updated, has password:', hasPassword, 'protection enabled:', isProtectionEnabled);
  } catch (error) {
    console.error('Failed to update password UI:', error);
  }
}

// 切换密码保护
async function togglePasswordProtection() {
  const enabled = passwordEnabledToggle.checked;
  
  if (enabled) {
    // Check for Pro license first
    try {
      const response = await chrome.runtime.sendMessage({ action: 'license:getState' });
      const license = response || { plan: 'free' };
      
      if (license.plan === 'free') {
        // Revert checkbox state
        passwordEnabledToggle.checked = false;
        
        // Show upgrade modal
        showUpgradeModal('Password Protection is a Pro feature', 'Secure your AutoPurge settings with password protection.');
        return;
      }
    } catch (error) {
      console.error('Failed to check license:', error);
      // On error, assume free plan
      passwordEnabledToggle.checked = false;
      showUpgradeModal('Password Protection is a Pro feature', 'Secure your AutoPurge settings with password protection.');
      return;
    }
    
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
      
      // 保存到 chrome.storage.local
      await chrome.storage.local.set({
        passwordHash: hash,
        passwordSalt: salt,
        passwordProtectionEnabled: true
      });
      
      updatePasswordUI();
      showMessage('Password protection enabled', 'success');
      
    } catch (error) {
      console.error('Failed to enable password protection:', error);
      showError('Failed to enable password protection');
      passwordEnabledToggle.checked = false;
    }
  } else {
    // 禁用密码保护 - 需要密码验证
    await handleDisablePasswordProtection();
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

// 更新历史记录 UI
async function updateHistoryUI() {
  console.log('=== updateHistoryUI START ===');
  console.log('Updating history UI...');
  console.log('historyList element:', historyList);
  
  if (!historyList) {
    console.error('historyList element not found! Trying to get it again...');
    historyList = document.getElementById('historyList');
    console.log('After re-getting, historyList:', historyList);
    if (!historyList) {
      console.error('Still no historyList element found!');
      return;
    }
  }
  
  try {
    // 获取历史记录设置
    const settings = await chrome.storage.local.get(['historySettings']);
    const historySettings = settings.historySettings || { autoRecord: true, maxRecords: 1000, retentionDays: 30 };
    console.log('History settings loaded:', historySettings);
    
    // 更新设置 UI
    if (autoRecordToggle) {
      autoRecordToggle.checked = historySettings.autoRecord;
    }
    if (maxRecordsInput) {
      maxRecordsInput.value = historySettings.maxRecords;
    }
    if (retentionDaysInput) {
      retentionDaysInput.value = historySettings.retentionDays;
    }
    
    // 获取历史记录
    const stored = await chrome.storage.local.get(['historyRecords']);
    historyRecords = stored.historyRecords || [];
    console.log('History records loaded:', historyRecords.length, 'records');
    console.log('History records:', historyRecords);
    
    // 计算统计信息
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const todayCount = historyRecords.filter(record => record.deletedAt >= today).length;
    const weekCount = historyRecords.filter(record => record.deletedAt >= weekAgo).length;
    const totalCount = historyRecords.length;
    
    console.log('Statistics calculated:', { todayCount, weekCount, totalCount });
    
    // 更新统计显示
    if (totalRecords) totalRecords.textContent = totalCount;
    if (todayRecords) todayRecords.textContent = todayCount;
    if (weekRecords) weekRecords.textContent = weekCount;
    
    // 计算存储使用量
    const storageSize = JSON.stringify(historyRecords).length;
    const storageKB = Math.round(storageSize / 1024 * 100) / 100;
    if (storageUsed) storageUsed.textContent = `${storageKB} KB`;
    
    // 更新历史记录列表
    updateHistoryList(historyRecords);
    
    console.log('=== updateHistoryUI SUCCESS ===');
  } catch (error) {
    console.error('=== updateHistoryUI ERROR ===');
    console.error('Failed to update history UI:', error);
  }
}

// 更新历史记录列表
function updateHistoryList(records) {
  if (!historyList) return;
  
  if (records.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: #666;">No records found</p>';
    return;
  }
  
  const html = records.map(record => {
    const date = new Date(record.deletedAt).toLocaleString();
    return `
      <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: bold; color: #333;">${record.title || 'Untitled'}</div>
          <div style="font-size: 12px; color: #666;">${record.url}</div>
          <div style="font-size: 11px; color: #999;">${date}</div>
        </div>
        <div style="font-size: 12px; color: #666;">${record.domain}</div>
      </div>
    `;
  }).join('');
  
  historyList.innerHTML = html;
}

// 刷新历史记录
async function refreshHistoryRecords() {
  console.log('Refreshing history records...');
  await updateHistoryUI();
  showMessage('History records refreshed', 'success');
}

// 导出历史记录
async function exportHistoryRecords() {
  try {
    const stored = await chrome.storage.local.get(['historyRecords']);
    const records = stored.historyRecords || [];
    
    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autopurge-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showMessage('History records exported', 'success');
  } catch (error) {
    console.error('Failed to export history records:', error);
    showMessage('Failed to export history records', 'error');
  }
}

// 清空历史记录
async function clearHistoryRecords() {
  if (confirm('Are you sure you want to clear all history records? This action cannot be undone.')) {
    try {
      await chrome.storage.local.set({ historyRecords: [] });
      await updateHistoryUI();
      showMessage('History records cleared', 'success');
    } catch (error) {
      console.error('Failed to clear history records:', error);
      showMessage('Failed to clear history records', 'error');
    }
  }
}

// 过滤历史记录
function filterHistoryRecords() {
  if (!historyFilter) return;
  
  const filter = historyFilter.value;
  console.log('Filtering history records by:', filter);
  
  // 这里可以添加过滤逻辑
  updateHistoryUI();
}

// 搜索历史记录
function searchHistoryRecords() {
  if (!historySearch) return;
  
  const query = historySearch.value.toLowerCase();
  console.log('Searching history records for:', query);
  
  // 这里可以添加搜索逻辑
  updateHistoryUI();
}

// 更新历史记录设置
async function updateHistorySettings() {
  try {
    const settings = {
      autoRecord: autoRecordToggle ? autoRecordToggle.checked : true,
      maxRecords: maxRecordsInput ? parseInt(maxRecordsInput.value) : 1000,
      retentionDays: retentionDaysInput ? parseInt(retentionDaysInput.value) : 30
    };
    
    await chrome.storage.local.set({ historySettings: settings });
    showMessage('History settings updated', 'success');
  } catch (error) {
    console.error('Failed to update history settings:', error);
    showMessage('Failed to update history settings', 'error');
  }
}

// ==================== 密码保护功能 ====================

// 切换密码保护
async function togglePasswordProtection() {
  if (!passwordEnabledToggle || !passwordSettings) return;
  
  const enabled = passwordEnabledToggle.checked;
  
  try {
    if (enabled) {
      // 启用密码保护 - 检查是否有密码
      const stored = await chrome.storage.local.get(['passwordHash']);
      
      if (stored.passwordHash) {
        // 有密码，直接启用
        await enablePasswordProtection();
      } else {
        // 没有密码，显示创建密码弹窗
        showCreatePasswordModal();
        return;
      }
    } else {
      // 禁用密码保护 - 检查是否已有密码
      const stored = await chrome.storage.local.get(['passwordHash']);
      
      if (stored.passwordHash) {
        // 已有密码，需要验证当前密码才能禁用
        showPasswordVerifyModal();
        return; // 等待用户验证密码
      } else {
        // 没有密码，直接禁用
        await disablePasswordProtection();
      }
    }
  } catch (error) {
    console.error('Failed to toggle password protection:', error);
    showMessage('Failed to update password protection', 'error');
    
    // 恢复复选框状态
    passwordEnabledToggle.checked = !enabled;
  }
}

// 启用密码保护
async function enablePasswordProtection() {
  try {
    // 保存密码保护状态
    await chrome.storage.local.set({ passwordProtectionEnabled: true });
    
    // 更新UI状态
    await updatePasswordUI();
    
    showMessage('Password protection enabled', 'success');
  } catch (error) {
    console.error('Failed to enable password protection:', error);
    showMessage('Failed to enable password protection', 'error');
    throw error;
  }
}

// 禁用密码保护
async function disablePasswordProtection() {
  try {
    // 保存密码保护状态
    await chrome.storage.local.set({ passwordProtectionEnabled: false });
    
    // 更新UI状态
    await updatePasswordUI();
    
    showMessage('Password protection disabled', 'success');
  } catch (error) {
    console.error('Failed to disable password protection:', error);
    showMessage('Failed to disable password protection', 'error');
    throw error;
  }
}

// 显示密码验证弹窗
function showPasswordVerifyModal() {
  if (passwordVerifyModal) {
    passwordVerifyModal.style.display = 'flex';
    if (verifyPasswordInput) {
      verifyPasswordInput.focus();
      verifyPasswordInput.value = '';
    }
  }
}

// 隐藏密码验证弹窗
function hidePasswordVerifyModal(restoreCheckbox = false) {
  if (passwordVerifyModal) {
    passwordVerifyModal.style.display = 'none';
    if (verifyPasswordInput) {
      verifyPasswordInput.value = '';
    }
  }
  
  // 只有在用户取消验证时才恢复复选框状态
  if (restoreCheckbox && passwordEnabledToggle) {
    passwordEnabledToggle.checked = true;
  }
}

// 确认密码验证
async function confirmPasswordVerification() {
  if (!verifyPasswordInput) {
    showMessage('Password input not found', 'error');
    return;
  }
  
  const currentPassword = verifyPasswordInput.value;
  if (!currentPassword) {
    showMessage('Please enter current password', 'error');
    return;
  }
  
  try {
    // 验证当前密码
    const stored = await chrome.storage.local.get(['passwordHash']);
    if (!stored.passwordHash) {
      showMessage('No password found to verify', 'error');
      return;
    }
    
    const currentHash = btoa(currentPassword);
    if (currentHash !== stored.passwordHash) {
      showMessage('Current password is incorrect', 'error');
      return;
    }
    
    // 密码验证成功，禁用密码保护
    await disablePasswordProtection();
    
    // 隐藏弹窗
    hidePasswordVerifyModal();
    
  } catch (error) {
    console.error('Failed to verify password:', error);
    showMessage('Failed to verify password', 'error');
  }
}

// 更新密码
async function updatePassword() {
  if (!newPasswordInput || !confirmPasswordInput) return;
  
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
  
  if (!newPassword || !confirmPassword) {
    showMessage('Please fill in all password fields', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  if (newPassword.length < 8) {
    showMessage('Password must be at least 8 characters long', 'error');
    return;
  }
  
  try {
    // 检查是否已有密码
    const stored = await chrome.storage.local.get(['passwordHash']);
    
    if (stored.passwordHash) {
      // 已有密码，需要验证当前密码
      if (!currentPassword) {
        showMessage('Please enter current password', 'error');
        return;
      }
      
      const currentHash = btoa(currentPassword);
      if (currentHash !== stored.passwordHash) {
        showMessage('Current password is incorrect', 'error');
        return;
      }
    }
    
    // 设置新密码
    const passwordHash = btoa(newPassword);
    await chrome.storage.local.set({ 
      passwordHash: passwordHash,
      passwordProtectionEnabled: true
    });
    
    // 清空输入框
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    if (currentPasswordInput) currentPasswordInput.value = '';
    
    // 更新 UI，现在显示当前密码字段
    if (currentPasswordDiv) {
      currentPasswordDiv.style.display = 'block';
    }
    
    // 更新删除按钮状态
    if (deletePasswordBtn) {
      deletePasswordBtn.disabled = false;
      deletePasswordBtn.style.opacity = '1';
      deletePasswordBtn.style.cursor = 'pointer';
      deletePasswordBtn.title = 'Delete password and all history records';
    }
    
    showMessage('Password updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update password:', error);
    showMessage('Failed to update password', 'error');
  }
}

// 显示创建密码弹窗
function showCreatePasswordModal() {
  if (createPasswordModal) {
    createPasswordModal.style.display = 'flex';
    if (createPasswordInput) {
      createPasswordInput.focus();
      createPasswordInput.value = '';
    }
    if (createConfirmPasswordInput) {
      createConfirmPasswordInput.value = '';
    }
  }
}

// 隐藏创建密码弹窗
function hideCreatePasswordModal() {
  if (createPasswordModal) {
    createPasswordModal.style.display = 'none';
    if (createPasswordInput) {
      createPasswordInput.value = '';
    }
    if (createConfirmPasswordInput) {
      createConfirmPasswordInput.value = '';
    }
  }
  
  // 恢复复选框状态（用户取消了创建密码）
  if (passwordEnabledToggle) {
    passwordEnabledToggle.checked = false;
  }
}

// 确认创建密码
async function confirmCreatePassword() {
  if (!createPasswordInput || !createConfirmPasswordInput) {
    showMessage('Password inputs not found', 'error');
    return;
  }
  
  const password = createPasswordInput.value;
  const confirmPassword = createConfirmPasswordInput.value;
  
  if (!password || !confirmPassword) {
    showMessage('Please fill in all password fields', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  if (password.length < 8) {
    showMessage('Password must be at least 8 characters long', 'error');
    return;
  }
  
  try {
    // 创建密码
    const passwordHash = btoa(password);
    await chrome.storage.local.set({ 
      passwordHash: passwordHash,
      passwordProtectionEnabled: true
    });
    
    // 清空输入框
    createPasswordInput.value = '';
    createConfirmPasswordInput.value = '';
    
    // 隐藏弹窗
    hideCreatePasswordModal();
    
    // 更新UI状态 - 确保复选框被勾选
    if (passwordEnabledToggle) {
      passwordEnabledToggle.checked = true;
    }
    
    // 更新密码UI显示
    await updatePasswordUI();
    
    showMessage('Password created and protection enabled successfully', 'success');
    
  } catch (error) {
    console.error('Failed to create password:', error);
    showMessage('Failed to create password', 'error');
    
    // 如果创建失败，恢复复选框状态
    if (passwordEnabledToggle) {
      passwordEnabledToggle.checked = false;
    }
  }
}

// 删除密码
function removePassword() {
  // 显示删除密码确认弹窗
  showDeletePasswordModal();
}

// 显示删除密码确认弹窗
function showDeletePasswordModal() {
  if (deletePasswordModal) {
    deletePasswordModal.style.display = 'flex';
    // 重置复选框状态
    if (deleteHistoryRecords) {
      deleteHistoryRecords.checked = true;
    }
  }
}

// 隐藏删除密码确认弹窗
function hideDeletePasswordModal() {
  if (deletePasswordModal) {
    deletePasswordModal.style.display = 'none';
  }
}

// 确认删除密码
async function confirmDeletePassword() {
  try {
    // 检查是否要删除历史记录
    const deleteHistory = deleteHistoryRecords ? deleteHistoryRecords.checked : true;
    
    // 删除密码相关数据
    await chrome.storage.local.remove(['passwordHash', 'passwordSalt', 'passwordProtectionEnabled']);
    
    // 根据用户选择决定是否删除历史记录
    if (deleteHistory) {
      await chrome.storage.local.remove(['historyRecords']);
      showMessage('Password and history records deleted successfully', 'success');
    } else {
      showMessage('Password deleted successfully (history records preserved)', 'success');
    }
    
    // 重置UI
    if (passwordEnabledToggle) {
      passwordEnabledToggle.checked = false;
    }
    if (passwordSettings) {
      passwordSettings.style.display = 'none';
    }
    
    // 清空输入框
    if (currentPasswordInput) currentPasswordInput.value = '';
    if (newPasswordInput) newPasswordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    
    // 隐藏弹窗
    hideDeletePasswordModal();
    
    // 更新UI
    await updatePasswordUI();
    
  } catch (error) {
    console.error('Failed to delete password:', error);
    showMessage('Failed to delete password', 'error');
  }
}

// ==================== 高级功能 ====================

// 切换 Shadow History
async function toggleShadowHistory() {
  if (!shadowHistoryToggle || !shadowHistoryStatus) return;
  
  const enabled = shadowHistoryToggle.checked;
  shadowHistoryStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  
  // 这里可以添加实际的 Shadow History 逻辑
  showMessage(`Shadow History ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

// 切换 Analytics
async function toggleAnalytics() {
  if (!analyticsToggle || !analyticsStatus) return;
  
  const enabled = analyticsToggle.checked;
  analyticsStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  
  // 这里可以添加实际的 Analytics 逻辑
  showMessage(`Analytics ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

// 切换 Priority Support
async function togglePrioritySupport() {
  if (!prioritySupportToggle || !prioritySupportStatus || !prioritySupportTime) return;
  
  const enabled = prioritySupportToggle.checked;
  prioritySupportStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  prioritySupportTime.textContent = enabled ? 'Priority' : 'Standard';
  
  // 这里可以添加实际的 Priority Support 逻辑
  showMessage(`Priority Support ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

// 切换 API Access
async function toggleApiAccess() {
  if (!apiAccessToggle || !apiAccessStatus || !apiKeyDisplay) return;
  
  const enabled = apiAccessToggle.checked;
  apiAccessStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  
  if (enabled) {
    // 生成简单的 API Key
    const apiKey = 'ap_' + Math.random().toString(36).substr(2, 16);
    apiKeyDisplay.textContent = apiKey;
  } else {
    apiKeyDisplay.textContent = 'Not Generated';
  }
  
  // 这里可以添加实际的 API Access 逻辑
  showMessage(`API Access ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

// 升级到 Pro
function upgradeToPro() {
  showMessage('Pro upgrade feature coming soon!', 'info');
  // 这里可以添加实际的升级逻辑
}

// ==================== 历史记录功能实现 ====================


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
          <button class="copy-history-btn" data-record-id="${record.id}" style="background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            Copy
          </button>
          <button class="view-history-btn" data-record-id="${record.id}" style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            View
          </button>
          <button class="delete-history-btn" data-record-id="${record.id}" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
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
          <button class="copy-history-btn" data-record-id="${record.id}" style="background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            Copy
          </button>
          <button class="view-history-btn" data-record-id="${record.id}" style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            View
          </button>
          <button class="delete-history-btn" data-record-id="${record.id}" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
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

// 复制历史记录URL
async function copyHistoryRecord(recordId) {
  const record = historyRecords.find(r => r.id === recordId);
  if (!record) {
    console.error('Record not found:', recordId);
    return;
  }
  
  console.log('Copying record URL:', record.url);
  
  try {
    // 使用 Clipboard API 复制URL
    await navigator.clipboard.writeText(record.url);
    console.log('URL copied to clipboard:', record.url);
    
    // 显示成功消息
    showMessage('URL copied to clipboard', 'success');
  } catch (error) {
    console.error('Failed to copy URL:', error);
    
    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea');
      textArea.value = record.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      console.log('URL copied using fallback method:', record.url);
      showMessage('URL copied to clipboard', 'success');
    } catch (fallbackError) {
      console.error('Fallback copy method also failed:', fallbackError);
      showMessage('Failed to copy URL', 'error');
    }
  }
}

// 查看历史记录详情
function viewHistoryRecord(recordId) {
  const record = historyRecords.find(r => r.id === recordId);
  if (!record) {
    console.error('Record not found:', recordId);
    return;
  }
  
  console.log('Opening record in new tab:', record.url);
  
  // 在新标签页中打开URL
  chrome.tabs.create({ url: record.url });
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

// ============ LICENSE MANAGEMENT FUNCTIONALITY ============

// License management DOM elements
let currentPlanBadge = null;
let currentPlanStatus = null;
let licenseInfo = null;
let licenseCode = null;
let manageLicenseBtn = null;
let buyCoinbaseBtn = null;
let buyPaypalBtn = null;
let licenseKeyInput = null;
let activateLicenseBtn = null;
let pasteLicenseBtn = null;
let licenseMessage = null;

// History overlay elements
let historyOverlay = null;
let historyOverlayTitle = null;
let historyOverlayDescription = null;
let historyBuyCoinbase = null;
let historyLicenseInput = null;
let historyActivateLicense = null;

// Initialize license management functionality
function initializeLicenseManagement() {
  console.log('Initializing license management...');
  
  // Get DOM elements
  currentPlanBadge = document.getElementById('current-plan-badge');
  currentPlanStatus = document.getElementById('current-plan-status');
  licenseInfo = document.getElementById('license-info');
  licenseCode = document.getElementById('license-code');
  manageLicenseBtn = document.getElementById('manage-license-btn');
  buyCoinbaseBtn = document.getElementById('buy-coinbase-btn');
  buyPaypalBtn = document.getElementById('buy-paypal-btn');
  licenseKeyInput = document.getElementById('license-key-input');
  activateLicenseBtn = document.getElementById('activate-license-btn');
  pasteLicenseBtn = document.getElementById('paste-license-btn');
  licenseMessage = document.getElementById('license-message');
  
  // Get history overlay elements
  historyOverlay = document.getElementById('historyOverlay');
  historyOverlayTitle = document.getElementById('historyOverlayTitle');
  historyOverlayDescription = document.getElementById('historyOverlayDescription');
  historyBuyCoinbase = document.getElementById('history-buy-coinbase');
  historyLicenseInput = document.getElementById('history-license-input');
  historyActivateLicense = document.getElementById('history-activate-license');
  
  // Set up event listeners
  if (buyCoinbaseBtn) {
    buyCoinbaseBtn.addEventListener('click', handleCoinbasePurchase);
  }
  
  if (buyPaypalBtn) {
    buyPaypalBtn.addEventListener('click', handlePaypalPurchase);
  }
  
  if (activateLicenseBtn) {
    activateLicenseBtn.addEventListener('click', handleLicenseActivation);
  }
  
  if (pasteLicenseBtn) {
    pasteLicenseBtn.addEventListener('click', handlePasteLicense);
  }
  
  if (manageLicenseBtn) {
    manageLicenseBtn.addEventListener('click', handleManageLicense);
  }
  
  // Set up history overlay event listeners
  if (historyBuyCoinbase) {
    historyBuyCoinbase.addEventListener('click', handleCoinbasePurchase);
  }
  
  if (historyActivateLicense) {
    historyActivateLicense.addEventListener('click', handleHistoryLicenseActivation);
  }
  
  // Listen for license changes from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'license:changed') {
      updateLicenseUI();
    }
  });
  
  // Initial UI update
  updateLicenseUI();
}

// Update license UI based on current state
async function updateLicenseUI() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'license:getState' });
    const license = response || { plan: 'free' };
    
    // Update plan badge
    if (currentPlanBadge) {
      currentPlanBadge.className = 'ap-badge';
      currentPlanBadge.textContent = 'Free';
      
      if (license.plan === 'pro') {
        currentPlanBadge.classList.add('ap-badge--pro');
        currentPlanBadge.textContent = 'Pro';
      } else if (license.plan === 'pro_trial') {
        currentPlanBadge.classList.add('ap-badge--trial');
        currentPlanBadge.textContent = 'Trial';
      } else {
        currentPlanBadge.classList.add('ap-badge--free');
      }
    }
    
    // Update plan status
    if (currentPlanStatus) {
      if (license.plan === 'free') {
        currentPlanStatus.textContent = 'Basic features';
      } else {
        const expiry = license.expiresAt ? new Date(license.expiresAt) : null;
        if (expiry) {
          const now = new Date();
          const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
          if (daysLeft > 0) {
            currentPlanStatus.textContent = `Premium features • ${daysLeft} days left`;
          } else {
            currentPlanStatus.textContent = 'Premium features • Expired';
          }
        } else {
          currentPlanStatus.textContent = 'Premium features';
        }
      }
    }
    
    // Update license info
    if (licenseInfo && licenseCode) {
      if (license.licCodeMasked && license.plan !== 'free') {
        licenseInfo.style.display = 'block';
        licenseCode.textContent = license.licCodeMasked;
      } else {
        licenseInfo.style.display = 'none';
      }
    }
    
    // Update manage button
    if (manageLicenseBtn) {
      if (license.plan !== 'free') {
        manageLicenseBtn.style.display = 'inline-block';
      } else {
        manageLicenseBtn.style.display = 'none';
      }
    }
    
    // Update history overlay
    updateHistoryOverlay(license);
    
  } catch (error) {
    console.error('Failed to update license UI:', error);
  }
}

// Handle Coinbase purchase
async function handleCoinbasePurchase() {
  try {
    showLicenseMessage('Opening Coinbase checkout...', 'info');
    
    const response = await chrome.runtime.sendMessage({
      action: 'checkout:create',
      provider: 'coinbase',
      productCode: 'autopurge_pro_001'
    });
    
    if (response && response.ok) {
      if (response.tabError) {
        // Tab creation failed, provide manual link
        showLicenseMessage(
          `Checkout created! If the page didn't open automatically, <a href="${response.hosted_url}" target="_blank">click here to open Coinbase checkout</a>. Complete your purchase and return here to activate your license.`, 
          'warning'
        );
      } else {
        showLicenseMessage('Redirected to Coinbase Commerce. Complete your purchase and return here to activate your license.', 'success');
      }
    } else {
      throw new Error(response?.error || 'Checkout failed');
    }
  } catch (error) {
    console.error('Coinbase purchase failed:', error);
    showLicenseMessage('Failed to open checkout. Please try again.', 'error');
  }
}

// Handle PayPal purchase (disabled for now)
function handlePaypalPurchase() {
  showLicenseMessage('PayPal integration coming soon!', 'info');
}

// Handle license activation
async function handleLicenseActivation() {
  const licenseKey = licenseKeyInput?.value?.trim();
  
  if (!licenseKey) {
    showLicenseMessage('Please enter a license key', 'error');
    return;
  }
  
  try {
    // Show loading state
    if (activateLicenseBtn) {
      activateLicenseBtn.textContent = 'Activating...';
      activateLicenseBtn.disabled = true;
    }
    
    showLicenseMessage('Activating license...', 'info');
    
    const response = await chrome.runtime.sendMessage({
      action: 'license:activate',
      licenseKey: licenseKey
    });
    
    if (response && response.ok) {
      showLicenseMessage('License activated successfully! Welcome to AutoPurge Pro!', 'success');
      licenseKeyInput.value = '';
      updateLicenseUI();
    } else {
      throw new Error(response?.error || 'Activation failed');
    }
    
  } catch (error) {
    console.error('License activation failed:', error);
    showLicenseMessage(error.message, 'error');
  } finally {
    // Reset button state
    if (activateLicenseBtn) {
      activateLicenseBtn.textContent = 'Activate License';
      activateLicenseBtn.disabled = false;
    }
  }
}

// Handle paste license key
async function handlePasteLicense() {
  try {
    const text = await navigator.clipboard.readText();
    if (licenseKeyInput && text.trim()) {
      licenseKeyInput.value = text.trim();
      showLicenseMessage('License key pasted from clipboard', 'success');
    } else {
      showLicenseMessage('No license key found in clipboard', 'error');
    }
  } catch (error) {
    console.error('Failed to paste from clipboard:', error);
    showLicenseMessage('Failed to paste from clipboard. Please paste manually.', 'error');
  }
}

// Handle manage license
async function handleManageLicense() {
  try {
    showLicenseMessage('Loading license information...', 'info');
    
    // Get current license from storage
    const stored = await chrome.storage.local.get(['license']);
    if (!stored.license || !stored.license.licCodeMasked) {
      showLicenseMessage('No license found. Please activate a license first.', 'error');
      return;
    }
    
    // Get full license key from user
    const licenseKey = prompt('Please enter your full license key to manage devices:');
    if (!licenseKey || !licenseKey.trim()) {
      showLicenseMessage('License key is required for device management.', 'error');
      return;
    }
    
    // Get license management data
    const response = await chrome.runtime.sendMessage({
      action: 'license:manage',
      licenseKey: licenseKey.trim()
    });
    
    if (response && response.ok) {
      showLicenseManagementModal(response.data, licenseKey.trim());
    } else {
      throw new Error(response?.error || 'Failed to load license information');
    }
  } catch (error) {
    console.error('License management failed:', error);
    showLicenseMessage('Failed to load license information. Please check your license key.', 'error');
  }
}

// Show license management modal
function showLicenseManagementModal(licenseData, licenseKey) {
  // Remove existing modal if present
  const existingModal = document.getElementById('license-management-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const { license, devices, stats } = licenseData;
  
  // Format dates
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
  };
  
  // Generate device list HTML
  const deviceListHTML = devices.map(device => `
    <div class="device-item ${device.status === 'active' ? 'active' : 'inactive'}">
      <div class="device-info">
        <div class="device-id">
          <strong>Device ID:</strong> ${device.deviceId}
        </div>
        <div class="device-agent">
          <strong>Browser:</strong> ${device.userAgent}
        </div>
        <div class="device-activated">
          <strong>Activated:</strong> ${formatDate(device.activatedAt)}
        </div>
        ${device.status === 'inactive' ? `
          <div class="device-deactivated">
            <strong>Deactivated:</strong> ${formatDate(device.deactivatedAt)}
          </div>
        ` : ''}
      </div>
      ${device.status === 'active' ? `
        <div class="device-actions">
          <button class="btn-danger device-deactivate-btn" data-device-id="${device.deviceId}">
            Deactivate
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  const modalHTML = `
    <div id="license-management-modal" class="upgrade-modal" style="display: flex; z-index: 10000;">
      <div class="upgrade-modal__content" style="max-width: 700px; width: 90vw;">
        <button class="modal-close" id="license-modal-close">&times;</button>
        
        <h3>License Management</h3>
        
        <div class="license-overview">
          <div class="license-detail">
            <strong>License:</strong> ${license.code}
          </div>
          <div class="license-detail">
            <strong>Plan:</strong> ${license.plan.toUpperCase()}
          </div>
          <div class="license-detail">
            <strong>Email:</strong> ${license.email || 'N/A'}
          </div>
          <div class="license-detail">
            <strong>Status:</strong> <span class="status-${license.status}">${license.status.toUpperCase()}</span>
          </div>
          <div class="license-detail">
            <strong>Expires:</strong> ${formatDate(license.expiresAt)}
          </div>
        </div>
        
        <div class="device-stats">
          <div class="stat-item">
            <span class="stat-number">${stats.activeDevices}</span>
            <span class="stat-label">Active Devices</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${stats.availableSlots}</span>
            <span class="stat-label">Available Slots</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${license.maxDevices}</span>
            <span class="stat-label">Total Slots</span>
          </div>
        </div>
        
        <h4>Device List</h4>
        <div class="device-list">
          ${deviceListHTML || '<p>No devices found.</p>'}
        </div>
        
        <div class="modal-actions">
          <button class="btn-secondary" id="license-refresh-btn">Refresh</button>
          <button class="btn-primary" id="license-modal-ok">Close</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to document
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get modal elements
  const modal = document.getElementById('license-management-modal');
  const closeBtn = document.getElementById('license-modal-close');
  const okBtn = document.getElementById('license-modal-ok');
  const refreshBtn = document.getElementById('license-refresh-btn');
  const deactivateBtns = modal.querySelectorAll('.device-deactivate-btn');
  
  // Set up event listeners
  const closeModal = () => {
    modal.remove();
    showLicenseMessage('', 'info'); // Clear message
  };
  
  closeBtn?.addEventListener('click', closeModal);
  okBtn?.addEventListener('click', closeModal);
  
  refreshBtn?.addEventListener('click', async () => {
    modal.remove();
    await handleManageLicense();
  });
  
  // Set up deactivate buttons
  deactivateBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const deviceId = btn.dataset.deviceId;
      if (confirm('Are you sure you want to deactivate this device? This action cannot be undone.')) {
        try {
          btn.textContent = 'Deactivating...';
          btn.disabled = true;
          
          const response = await chrome.runtime.sendMessage({
            action: 'license:deactivateDevice',
            licenseKey: licenseKey,
            deviceId: deviceId
          });
          
          if (response && response.ok) {
            // Refresh the modal
            modal.remove();
            await handleManageLicense();
          } else {
            throw new Error(response?.error || 'Failed to deactivate device');
          }
        } catch (error) {
          console.error('Device deactivation failed:', error);
          btn.textContent = 'Deactivate';
          btn.disabled = false;
          alert('Failed to deactivate device: ' + error.message);
        }
      }
    });
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Handle history license activation
async function handleHistoryLicenseActivation() {
  const licenseKey = historyLicenseInput?.value?.trim();
  
  if (!licenseKey) {
    alert('Please enter a license key');
    return;
  }
  
  try {
    // Show loading state
    if (historyActivateLicense) {
      historyActivateLicense.textContent = 'Activating...';
      historyActivateLicense.disabled = true;
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'license:activate',
      licenseKey: licenseKey
    });
    
    if (response && response.ok) {
      alert('License activated successfully!');
      historyLicenseInput.value = '';
      updateLicenseUI();
    } else {
      throw new Error(response?.error || 'Activation failed');
    }
    
  } catch (error) {
    console.error('History license activation failed:', error);
    alert(error.message);
  } finally {
    // Reset button state
    if (historyActivateLicense) {
      historyActivateLicense.textContent = 'Activate';
      historyActivateLicense.disabled = false;
    }
  }
}

// Update history overlay based on license state
async function updateHistoryOverlay(license) {
  if (!historyOverlay) return;
  
  const historyList = document.getElementById('historyList');
  
  try {
    if (license.plan === 'free') {
      // Show overlay for free users
      if (historyList) {
        historyList.classList.add('ap-blur');
      }
      
      if (historyOverlayTitle) {
        historyOverlayTitle.textContent = 'History Records is a Pro feature';
      }
      
      if (historyOverlayDescription) {
        historyOverlayDescription.textContent = 'Unlock encrypted Shadow Vault to view and restore records.';
      }
      
      historyOverlay.style.display = 'flex';
      
    } else {
      // Check if password/vault is locked for Pro users
      const isVaultUnlocked = await checkVaultStatus();
      
      if (!isVaultUnlocked && (license.plan === 'pro' || license.plan === 'pro_trial')) {
        // Show unlock prompt for Pro users with locked vault
        if (historyList) {
          historyList.classList.add('ap-blur');
        }
        
        if (historyOverlayTitle) {
          historyOverlayTitle.textContent = 'Vault is locked';
        }
        
        if (historyOverlayDescription) {
          historyOverlayDescription.innerHTML = `
            <button class="btn btn-primary" onclick="unlockVault()">
              🔓 Unlock Vault
            </button>
          `;
        }
        
        // Hide Coinbase/License form for locked vault
        const licenseForm = historyOverlay.querySelector('.ap-license-form');
        const coinbaseBtn = historyOverlay.querySelector('.btn-coinbase');
        if (licenseForm) licenseForm.style.display = 'none';
        if (coinbaseBtn) coinbaseBtn.style.display = 'none';
        
        historyOverlay.style.display = 'flex';
        
      } else {
        // Hide overlay for unlocked Pro users
        if (historyList) {
          historyList.classList.remove('ap-blur');
        }
        
        historyOverlay.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Failed to update history overlay:', error);
    
    // On error, assume free plan behavior
    if (historyList) {
      historyList.classList.add('ap-blur');
    }
    historyOverlay.style.display = 'flex';
  }
}

// Check vault/password status
async function checkVaultStatus() {
  try {
    // Check if password protection is enabled and vault is unlocked
    const stored = await chrome.storage.local.get(['passwordProtectionEnabled', 'vaultUnlocked']);
    
    if (!stored.passwordProtectionEnabled) {
      // No password protection, vault is "unlocked"
      return true;
    }
    
    // Check if vault is currently unlocked
    return stored.vaultUnlocked === true;
  } catch (error) {
    console.error('Failed to check vault status:', error);
    return false;
  }
}

// Unlock vault function (placeholder)
function unlockVault() {
  // This would typically show the password modal
  // For now, just show a message
  alert('Vault unlock functionality will be implemented here');
}

// Show license message
function showLicenseMessage(message, type = 'info') {
  if (!licenseMessage) return;
  
  licenseMessage.className = `ap-alert ap-alert--${type}`;
  licenseMessage.textContent = message;
  licenseMessage.style.display = 'block';
  
  // Auto-hide success/info messages after 5 seconds
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      if (licenseMessage) {
        licenseMessage.style.display = 'none';
      }
    }, 5000);
  }
}

// Utility function to normalize timestamps
function toEpochMs(maybeNumberOrISO) {
  if (typeof maybeNumberOrISO === "number") {
    return maybeNumberOrISO < 1e12 ? maybeNumberOrISO * 1000 : maybeNumberOrISO;
  }
  if (typeof maybeNumberOrISO === "string") {
    return Date.parse(maybeNumberOrISO);
  }
  return undefined;
}

// Show upgrade modal for Pro features
function showUpgradeModal(title, description) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.upgrade-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal HTML
  const modalHTML = `
    <div class="upgrade-modal" id="upgrade-modal">
      <div class="upgrade-modal__content">
        <h3>${title}</h3>
        <p>${description}</p>
        
        <div class="upgrade-modal__buttons">
          <button class="btn-coinbase" id="modal-buy-coinbase">
            Buy with Coinbase
          </button>
          
          <div class="upgrade-modal__license-form">
            <input type="text" id="modal-license-input" placeholder="Enter license key" style="font-family: monospace;">
            <button class="btn-license" id="modal-activate-license">
              Activate
            </button>
          </div>
          
          <button class="btn btn-secondary" id="modal-close" style="margin-top: 16px;">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to document
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get modal elements
  const modal = document.getElementById('upgrade-modal');
  const modalBuyCoinbase = document.getElementById('modal-buy-coinbase');
  const modalLicenseInput = document.getElementById('modal-license-input');
  const modalActivateLicense = document.getElementById('modal-activate-license');
  const modalClose = document.getElementById('modal-close');
  
  // Set up event listeners
  if (modalBuyCoinbase) {
    modalBuyCoinbase.addEventListener('click', async () => {
      try {
        modalBuyCoinbase.textContent = 'Opening checkout...';
        modalBuyCoinbase.disabled = true;
        
        const response = await chrome.runtime.sendMessage({
          action: 'checkout:create',
          provider: 'coinbase',
          productCode: 'autopurge_pro_001'
        });
        
        if (response && response.ok) {
          if (response.tabError) {
            // Tab creation failed, provide manual link
            modal.innerHTML = `
              <div class="upgrade-modal__content">
                <h3>Checkout Created!</h3>
                <p>If the Coinbase page didn't open automatically, click the button below:</p>
                <a href="${response.hosted_url}" target="_blank" class="btn-coinbase" style="display: inline-block; text-decoration: none;">
                  Open Coinbase Checkout
                </a>
                <p style="margin-top: 15px;">Complete your purchase and return here to activate your license.</p>
                <button class="modal-close" onclick="this.closest('.upgrade-modal').remove()">Close</button>
              </div>
            `;
          } else {
            modal.remove();
          }
        } else {
          throw new Error('Checkout failed');
        }
      } catch (error) {
        console.error('Coinbase purchase failed:', error);
        modalBuyCoinbase.textContent = 'Buy with Coinbase';
        modalBuyCoinbase.disabled = false;
        alert('Failed to create checkout. Please try again.');
      }
    });
  }
  
  if (modalActivateLicense) {
    modalActivateLicense.addEventListener('click', async () => {
      const licenseKey = modalLicenseInput.value.trim();
      if (!licenseKey) {
        alert('Please enter a license key');
        return;
      }
      
      try {
        modalActivateLicense.textContent = 'Activating...';
        modalActivateLicense.disabled = true;
        
        const response = await chrome.runtime.sendMessage({
          action: 'license:activate',
          licenseKey: licenseKey
        });
        
        if (response && response.ok) {
          alert('License activated successfully!');
          modal.remove();
          updateLicenseUI();
        } else {
          throw new Error(response?.error || 'Activation failed');
        }
      } catch (error) {
        alert(error.message);
      } finally {
        modalActivateLicense.textContent = 'Activate';
        modalActivateLicense.disabled = false;
      }
    });
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.remove();
    });
  }
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close modal with Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

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
      'presetDomainsList', 'customDomainsList', 'passwordEnabledToggle', 
      'refreshHistoryBtn', 'shadowHistoryToggle'
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
    updateHistoryUI();
    console.log('历史记录功能测试完成');
  }
};

console.log('调试函数已加载，可以使用:');
console.log('- window.debugOptions.checkPageStatus() - 检查页面状态');
console.log('- window.debugOptions.forceShowAll() - 强制显示所有内容');
console.log('- window.debugOptions.resetToDefault() - 重置到默认状态');
console.log('- window.debugOptions.testHistoryRecords() - 测试历史记录功能');
