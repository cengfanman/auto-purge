/**
 * License Manager for AutoPurge Extension
 * Handles license activation, verification, and management
 */

class LicenseManager {
  constructor() {
    this.apiBaseUrl = 'https://api.autopurge.shop'; // 线上生产服务器
    this.licenseCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.verificationTimer = null;
    this.deviceFingerprint = null;
  }

  /**
   * Initialize license manager
   */
  async initialize() {
    console.log('LicenseManager initializing...');

    // Generate or retrieve device fingerprint
    await this.initializeDeviceFingerprint();

    // Start periodic license verification
    await this.startLicenseVerification();

    console.log('LicenseManager initialized successfully');
  }

  /**
   * Generate unique device fingerprint
   */
  async initializeDeviceFingerprint() {
    try {
      let stored = await chrome.storage.local.get(['deviceFingerprint']);

      if (stored.deviceFingerprint) {
        this.deviceFingerprint = stored.deviceFingerprint;
        console.log('Device fingerprint loaded:', this.deviceFingerprint);
        return;
      }

      // Generate new fingerprint
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const userAgent = navigator.userAgent;
      const screen = `${screen.width}x${screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const fingerprintData = `${timestamp}-${random}-${userAgent}-${screen}-${timezone}`;
      this.deviceFingerprint = await this.sha256Hash(fingerprintData);

      await chrome.storage.local.set({ deviceFingerprint: this.deviceFingerprint });
      console.log('Device fingerprint generated:', this.deviceFingerprint);
    } catch (error) {
      console.error('Failed to initialize device fingerprint:', error);
      this.deviceFingerprint = 'fallback-' + Date.now();
    }
  }

  /**
   * Generate SHA-256 hash
   */
  async sha256Hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Activate license with license key
   */
  async activateLicense(licenseKey) {
    try {
      console.log('Activating license:', licenseKey);

      const response = await fetch(`${this.apiBaseUrl}/licenses/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          licenseKey: licenseKey,
          deviceFingerprint: this.deviceFingerprint,
          userAgent: navigator.userAgent,
          ip: '127.0.0.1' // Will be replaced by server
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'License activation failed');
      }

      // Store license data
      const licenseData = {
        licenseKey: licenseKey,
        token: result.data.token,
        expiresAt: result.data.expiresAt,
        maxDevices: result.data.maxDevices,
        currentDevices: result.data.currentDevices,
        activatedAt: new Date().toISOString(),
        plan: 'pro' // Activated licenses are pro
      };

      await chrome.storage.local.set({
        licenseData: licenseData,
        plan: 'pro'
      });

      console.log('License activated successfully:', licenseData);

      // Notify other parts of the extension
      chrome.runtime.sendMessage({
        type: 'license:activated',
        data: licenseData
      });

      return licenseData;
    } catch (error) {
      console.error('License activation failed:', error);
      throw error;
    }
  }

  /**
   * Verify current license token
   */
  async verifyLicense() {
    try {
      const stored = await chrome.storage.local.get(['licenseData']);

      if (!stored.licenseData || !stored.licenseData.token) {
        console.log('No license token found');
        return { valid: false, reason: 'no_token' };
      }

      const response = await fetch(`${this.apiBaseUrl}/licenses/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: stored.licenseData.token
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.error('License verification failed:', result.error);
        return { valid: false, reason: 'verification_failed', error: result.error };
      }

      const verificationResult = {
        valid: result.data.valid,
        grace: result.data.grace,
        expiresAt: result.data.expiresAt,
        plan: result.data.plan,
        maxDevices: result.data.maxDevices,
        currentDevices: result.data.currentDevices
      };

      if (result.data.valid) {
        // Update stored license data
        await chrome.storage.local.set({
          licenseData: {
            ...stored.licenseData,
            expiresAt: result.data.expiresAt,
            lastVerified: new Date().toISOString()
          },
          plan: result.data.plan
        });

        console.log('License verification successful:', verificationResult);
      } else {
        console.warn('License is invalid or expired');
        await this.handleInvalidLicense();
      }

      return verificationResult;
    } catch (error) {
      console.error('License verification error:', error);
      return { valid: false, reason: 'network_error', error: error.message };
    }
  }

  /**
   * Handle invalid license
   */
  async handleInvalidLicense() {
    try {
      // Reset to free plan
      await chrome.storage.local.set({
        plan: 'free',
        licenseData: null
      });

      // Notify other parts of the extension
      chrome.runtime.sendMessage({
        type: 'license:invalid'
      });

      console.log('License invalidated, reset to free plan');
    } catch (error) {
      console.error('Error handling invalid license:', error);
    }
  }

  /**
   * Deactivate current license
   */
  async deactivateLicense() {
    try {
      const stored = await chrome.storage.local.get(['licenseData']);

      if (!stored.licenseData || !stored.licenseData.licenseKey) {
        console.log('No license to deactivate');
        return;
      }

      const response = await fetch(`${this.apiBaseUrl}/licenses/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          licenseKey: stored.licenseData.licenseKey,
          deviceId: this.deviceFingerprint
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('License deactivated successfully');
      } else {
        console.warn('License deactivation failed:', result.error);
      }

      // Clear local data regardless of API response
      await chrome.storage.local.set({
        plan: 'free',
        licenseData: null
      });

      // Notify other parts of the extension
      chrome.runtime.sendMessage({
        type: 'license:deactivated'
      });

    } catch (error) {
      console.error('License deactivation error:', error);
      // Clear local data even if API call fails
      await chrome.storage.local.set({
        plan: 'free',
        licenseData: null
      });
    }
  }

  /**
   * Get license management info
   */
  async getLicenseInfo() {
    try {
      const stored = await chrome.storage.local.get(['licenseData']);

      if (!stored.licenseData || !stored.licenseData.licenseKey) {
        return null;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/licenses/manage?licenseKey=${stored.licenseData.licenseKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error('Failed to get license info:', result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Error getting license info:', error);
      return null;
    }
  }

  /**
   * Check if user has pro features
   */
  async hasProFeatures() {
    try {
      const stored = await chrome.storage.local.get(['plan']);
      return stored.plan === 'pro';
    } catch (error) {
      console.error('Error checking pro features:', error);
      return false;
    }
  }

  /**
   * Start periodic license verification
   */
  async startLicenseVerification() {
    // Initial verification
    await this.verifyLicense();

    // Set up periodic verification
    if (this.verificationTimer) {
      clearInterval(this.verificationTimer);
    }

    this.verificationTimer = setInterval(async () => {
      console.log('Performing periodic license verification...');
      await this.verifyLicense();
    }, this.licenseCheckInterval);

    console.log('License verification timer started');
  }

  /**
   * Stop license verification timer
   */
  stopLicenseVerification() {
    if (this.verificationTimer) {
      clearInterval(this.verificationTimer);
      this.verificationTimer = null;
      console.log('License verification timer stopped');
    }
  }

  /**
   * Create checkout URL for purchasing license
   */
  async createCheckout(email) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productCode: 'autopurge_pro_001',
          email: email
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create checkout');
      }

      return result.data.hosted_url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }
}

// Export for use in other modules
export { LicenseManager };