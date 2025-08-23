/**
 * Options page script for AutoPurge Extension
 * Responsibilities:
 * - Load and display current configuration
 * - Manage preset and custom domain lists
 * - Handle user settings changes
 * - Enforce free plan limits
 * - Display usage statistics
 */

// DOM elements
const enabledToggle = document.getElementById('enabledToggle');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const delaySelect = document.getElementById('delaySelect');
const newDomainInput = document.getElementById('newDomain');
const addDomainBtn = document.getElementById('addDomainBtn');
const presetDomainsList = document.getElementById('presetDomainsList');
const customDomainsList = document.getElementById('customDomainsList');
const domainCounter = document.getElementById('domainCounter');
const upgradePrompt = document.getElementById('upgradePrompt');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const deletionsToday = document.getElementById('deletionsToday');
const deletionsTotal = document.getElementById('deletionsTotal');

// Current configuration
let config = {};
let presetDomains = [];

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfiguration();
  await loadPresetDomains();
  setupEventListeners();
  updateUI();
});

// Load current configuration from storage
async function loadConfiguration() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
    config = response || {
      enabled: true,
      plan: "free",
      delaySec: 10,
      userDomains: [],
      freeLimit: 10,
      usage: { deletionsToday: 0, deletionsTotal: 0 }
    };
  } catch (error) {
    console.error('Failed to load configuration:', error);
    config = {
      enabled: true,
      plan: "free",
      delaySec: 10,
      userDomains: [],
      freeLimit: 10,
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
  } catch (error) {
    console.error('Failed to load preset domains:', error);
    presetDomains = [];
  }
}

// Setup event listeners
function setupEventListeners() {
  enabledToggle.addEventListener('change', updateStatus);
  delaySelect.addEventListener('change', saveConfiguration);
  addDomainBtn.addEventListener('click', addCustomDomain);
  newDomainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCustomDomain();
    }
  });
  saveBtn.addEventListener('click', saveConfiguration);
}

// Update UI elements based on current configuration
function updateUI() {
  // Update toggle and status
  enabledToggle.checked = config.enabled;
  updateStatus();
  
  // Update delay select
  delaySelect.value = config.delaySec.toString();
  
  // Update domain lists
  renderPresetDomains();
  renderCustomDomains();
  updateDomainCounter();
  
  // Update statistics
  deletionsToday.textContent = config.usage.deletionsToday || 0;
  deletionsTotal.textContent = config.usage.deletionsTotal || 0;
  
  // Show upgrade prompt if at limit
  checkUpgradePrompt();
}

// Update status indicator
function updateStatus() {
  const enabled = enabledToggle.checked;
  statusIndicator.className = `status ${enabled ? 'enabled' : 'disabled'}`;
  statusText.textContent = enabled ? 'Enabled' : 'Disabled';
  config.enabled = enabled;
}

// Render preset domains list
function renderPresetDomains() {
  presetDomainsList.innerHTML = '';
  
  if (presetDomains.length === 0) {
    presetDomainsList.innerHTML = '<div class="domain-item">No preset domains loaded</div>';
    return;
  }
  
  presetDomains.forEach(domain => {
    const item = document.createElement('div');
    item.className = 'domain-item preset';
    item.innerHTML = `
      <span class="domain-name">${domain}</span>
      <span style="font-size: 11px; color: #999;">PRESET</span>
    `;
    presetDomainsList.appendChild(item);
  });
}

// Render custom domains list
function renderCustomDomains() {
  customDomainsList.innerHTML = '';
  
  if (config.userDomains.length === 0) {
    customDomainsList.innerHTML = '<div class="domain-item">No custom domains added</div>';
    return;
  }
  
  config.userDomains.forEach((domain, index) => {
    const item = document.createElement('div');
    item.className = 'domain-item';
    item.innerHTML = `
      <span class="domain-name">${domain}</span>
      <button class="remove-btn" onclick="removeCustomDomain(${index})" title="Remove domain">×</button>
    `;
    customDomainsList.appendChild(item);
  });
}

// Update domain counter
function updateDomainCounter() {
  const count = config.userDomains.length;
  const limit = config.freeLimit;
  domainCounter.textContent = `${count}/${limit}`;
  
  // Disable add button if at limit
  addDomainBtn.disabled = count >= limit;
  newDomainInput.disabled = count >= limit;
}

// Check if upgrade prompt should be shown
function checkUpgradePrompt() {
  const atLimit = config.userDomains.length >= config.freeLimit;
  upgradePrompt.style.display = atLimit ? 'block' : 'none';
}

// Add custom domain
function addCustomDomain() {
  const domain = newDomainInput.value.trim().toLowerCase();
  
  if (!domain) {
    alert('Please enter a domain name');
    return;
  }
  
  // Basic domain validation
  if (!isValidDomain(domain)) {
    alert('Please enter a valid domain name (e.g., example.com)');
    return;
  }
  
  // Check if already exists
  if (config.userDomains.includes(domain) || presetDomains.includes(domain)) {
    alert('This domain is already in the list');
    return;
  }
  
  // Check free plan limit
  if (config.userDomains.length >= config.freeLimit) {
    showUpgradeModal();
    return;
  }
  
  // Add domain
  config.userDomains.push(domain);
  newDomainInput.value = '';
  
  // Update UI
  renderCustomDomains();
  updateDomainCounter();
  checkUpgradePrompt();
  
  // Auto-save
  saveConfiguration();
}

// Remove custom domain
function removeCustomDomain(index) {
  if (confirm('Remove this domain from the list?')) {
    config.userDomains.splice(index, 1);
    renderCustomDomains();
    updateDomainCounter();
    checkUpgradePrompt();
    saveConfiguration();
  }
}

// Validate domain name
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/;
  return domainRegex.test(domain);
}

// Save configuration
async function saveConfiguration() {
  try {
    // Update delay from select
    config.delaySec = parseInt(delaySelect.value);
    
    // Send to background script
    const response = await chrome.runtime.sendMessage({
      action: 'updateConfig',
      config: config
    });
    
    if (response.success) {
      showSaveStatus();
    } else {
      throw new Error('Failed to save configuration');
    }
  } catch (error) {
    console.error('Error saving configuration:', error);
    alert('Failed to save settings. Please try again.');
  }
}

// Show save status message
function showSaveStatus() {
  saveStatus.style.display = 'block';
  setTimeout(() => {
    saveStatus.style.display = 'none';
  }, 2000);
}

// Show upgrade modal
function showUpgradeModal() {
  document.getElementById('upgradeModal').style.display = 'block';
}

// Close upgrade modal
function closeUpgradeModal() {
  document.getElementById('upgradeModal').style.display = 'none';
}

// Start free trial (placeholder)
function startTrial() {
  // This is a placeholder - no actual payment integration
  alert('🎉 Trial started! This is a demo - no actual payment will be charged.\n\nPro features will be available for 7 days.\n\nNote: This is a placeholder implementation. Real payment integration will be added in future versions.');
  
  // In a real implementation, this would:
  // 1. Call payment processor API
  // 2. Update user's plan to 'pro' with trial end date
  // 3. Enable Pro features
  // 4. Send confirmation email
  
  closeUpgradeModal();
}

// Make functions available globally for onclick handlers
window.removeCustomDomain = removeCustomDomain;
window.showUpgradeModal = showUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.startTrial = startTrial;

// Refresh statistics periodically
setInterval(async () => {
  try {
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    if (stats) {
      deletionsToday.textContent = stats.deletionsToday || 0;
      deletionsTotal.textContent = stats.deletionsTotal || 0;
    }
  } catch (error) {
    console.error('Failed to refresh statistics:', error);
  }
}, 5000); // Update every 5 seconds
