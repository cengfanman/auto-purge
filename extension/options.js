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

// DOM elements
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const planBadge = document.getElementById('planBadge');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const enabledToggle = document.getElementById('enabledToggle');
const delayInput = document.getElementById('delayInput');
const freeLimitInput = document.getElementById('freeLimitInput');
const shadowHistoryToggle = document.getElementById('shadowHistoryToggle');
const analyticsToggle = document.getElementById('analyticsToggle');
const prioritySupportToggle = document.getElementById('prioritySupportToggle');
const presetDomainsList = document.getElementById('presetDomainsList');
const customDomainsList = document.getElementById('customDomainsList');
const newDomainInput = document.getElementById('newDomainInput');
const addDomainBtn = document.getElementById('addDomainBtn');
const subscribeBtn = document.getElementById('subscribeBtn');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');

// Current configuration
let config = {};
let presetDomains = [];
let user = null;

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Options page initialized');
  setupNavigation(); // Setup navigation first
  await loadData();
  setupEventListeners();
  updateUI();
});

// Load configuration and data
async function loadData() {
  try {
    console.log('Loading options data...');
    
    // Get configuration
    config = await chrome.runtime.sendMessage({ action: 'getConfig' });
    
    if (!config) {
      throw new Error('Failed to load configuration');
    }
    
    // Load preset domains
    await loadPresetDomains();
    
    // Load user data
    await loadUserData();
    
    console.log('Options data loaded:', { config, presetDomains, user });
    
  } catch (error) {
    console.error('Failed to load options data:', error);
    showError('Failed to load extension data');
    
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
}

// Load preset domains
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
  // User management
  signInBtn.addEventListener('click', showSignInModal);
  signUpBtn.addEventListener('click', showSignUpModal);
  upgradeBtn.addEventListener('click', showUpgradeModal);
  
  // Settings toggles
  enabledToggle.addEventListener('change', updateConfig);
  delayInput.addEventListener('change', updateConfig);
  freeLimitInput.addEventListener('change', updateConfig);
  
  // Pro feature toggles
  shadowHistoryToggle.addEventListener('change', updateProFeatures);
  analyticsToggle.addEventListener('change', updateProFeatures);
  prioritySupportToggle.addEventListener('change', updateProFeatures);
  
  // Domain management
  addDomainBtn.addEventListener('click', addCustomDomain);
  newDomainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomDomain();
  });
  
  // Payment
  subscribeBtn.addEventListener('click', processSubscription);
  
  // Save/Reset
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetToDefaults);
  exportBtn.addEventListener('click', exportSettings);
  importBtn.addEventListener('click', importSettings);
  
  // Payment method selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => selectPaymentMethod(method));
  });
}

// Update UI based on configuration
function updateUI() {
  // Update toggles
  enabledToggle.checked = config.enabled;
  delayInput.value = config.delaySec;
  freeLimitInput.value = config.freeLimit;
  
  // Update pro features
  shadowHistoryToggle.checked = config.plan === 'pro' && config.shadowHistory;
  analyticsToggle.checked = config.plan === 'pro' && config.analytics;
  prioritySupportToggle.checked = config.plan === 'pro' && config.prioritySupport;
  
  // Disable pro features if not pro plan
  const proFeatures = [shadowHistoryToggle, analyticsToggle, prioritySupportToggle];
  proFeatures.forEach(toggle => {
    toggle.disabled = config.plan !== 'pro';
  });
  
  // Update user interface
  updateUserInterface();
  
  // Update domain lists
  updateDomainLists();
}

// Update user interface
function updateUserInterface() {
  if (user) {
    userName.textContent = user.name || 'User';
    userEmail.textContent = user.email;
    planBadge.textContent = user.plan || 'Free';
    planBadge.className = `plan-badge ${user.plan === 'pro' ? 'pro' : ''}`;
    
    signInBtn.style.display = 'none';
    signUpBtn.style.display = 'none';
    upgradeBtn.style.display = user.plan !== 'pro' ? 'block' : 'none';
  } else {
    userName.textContent = 'Guest User';
    userEmail.textContent = 'Not signed in';
    planBadge.textContent = 'Free';
    planBadge.className = 'plan-badge';
    
    signInBtn.style.display = 'block';
    signUpBtn.style.display = 'block';
    upgradeBtn.style.display = 'none';
  }
}

// Update domain lists
function updateDomainLists() {
  // Update preset domains
  presetDomainsList.innerHTML = '';
  presetDomains.forEach(domain => {
    const domainItem = createDomainItem(domain, 'preset');
    presetDomainsList.appendChild(domainItem);
  });
  
  // Update custom domains
  customDomainsList.innerHTML = '';
  (config.userDomains || []).forEach(domain => {
    const domainItem = createDomainItem(domain, 'custom');
    customDomainsList.appendChild(domainItem);
  });
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
    
    // Update configuration
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: { userDomains: config.userDomains } 
    });
    
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
  try {
    // Remove domain from config
    config.userDomains = config.userDomains.filter(d => d !== domain);
    
    // Update configuration
    await chrome.runtime.sendMessage({ 
      action: 'updateConfig', 
      config: { userDomains: config.userDomains } 
    });
    
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
  
  // Insert at top of container
  const container = document.querySelector('.options-container');
  container.insertBefore(messageDiv, container.firstChild);
  
  // Remove after delay
  setTimeout(() => {
    messageDiv.remove();
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
  removeCustomDomain
};
