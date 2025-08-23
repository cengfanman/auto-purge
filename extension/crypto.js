/**
 * Crypto utilities for AutoPurge Pro
 * Responsibilities:
 * - PBKDF2 key derivation from PIN
 * - AES-GCM encryption/decryption
 * - Secure key management in memory
 */

class CryptoManager {
  constructor() {
    this.masterKey = null;
    this.salt = null;
    this.isUnlocked = false;
    this.unlockTimeout = null;
  }

  /**
   * Generate a random salt for PBKDF2
   * @returns {ArrayBuffer} Random salt
   */
  async generateSalt() {
    return await crypto.subtle.generateKey(
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
  }

  /**
   * Derive encryption key from PIN using PBKDF2
   * @param {string} pin - User's PIN
   * @param {ArrayBuffer} salt - Random salt
   * @returns {CryptoKey} Derived AES-GCM key
   */
  async deriveKey(pin, salt) {
    const encoder = new TextEncoder();
    const pinBuffer = encoder.encode(pin);
    
    // Use PBKDF2 with 100,000 iterations for security
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   * @param {string} plaintext - Data to encrypt
   * @param {CryptoKey} key - Encryption key
   * @returns {Object} {iv, cipherText} - Encrypted data
   */
  async encrypt(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const cipherText = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );

    return {
      iv: Array.from(iv),
      cipherText: Array.from(new Uint8Array(cipherText))
    };
  }

  /**
   * Decrypt data using AES-GCM
   * @param {Array} iv - Initialization vector
   * @param {Array} cipherText - Encrypted data
   * @param {CryptoKey} key - Decryption key
   * @returns {string} Decrypted plaintext
   */
  async decrypt(iv, cipherText, key) {
    const ivBuffer = new Uint8Array(iv);
    const cipherBuffer = new Uint8Array(cipherText);

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      cipherBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  }

  /**
   * Unlock crypto manager with PIN
   * @param {string} pin - User's PIN
   * @param {ArrayBuffer} salt - Stored salt
   * @returns {boolean} Success status
   */
  async unlock(pin, salt) {
    try {
      this.masterKey = await this.deriveKey(pin, salt);
      this.salt = salt;
      this.isUnlocked = true;
      
      // Auto-lock after 30 minutes of inactivity
      this.unlockTimeout = setTimeout(() => {
        this.lock();
      }, 30 * 60 * 1000);
      
      return true;
    } catch (error) {
      console.error('Failed to unlock crypto manager:', error);
      return false;
    }
  }

  /**
   * Lock crypto manager and clear sensitive data
   */
  lock() {
    this.masterKey = null;
    this.salt = null;
    this.isUnlocked = false;
    
    if (this.unlockTimeout) {
      clearTimeout(this.unlockTimeout);
      this.unlockTimeout = null;
    }
  }

  /**
   * Check if crypto manager is unlocked
   * @returns {boolean} Unlock status
   */
  isUnlocked() {
    return this.isUnlocked;
  }

  /**
   * Get current master key (for encryption operations)
   * @returns {CryptoKey|null} Master key or null if locked
   */
  getMasterKey() {
    return this.masterKey;
  }

  /**
   * Extend unlock session
   */
  extendSession() {
    if (this.unlockTimeout) {
      clearTimeout(this.unlockTimeout);
      this.unlockTimeout = setTimeout(() => {
        this.lock();
      }, 30 * 60 * 1000);
    }
  }

  /**
   * Generate a new salt and re-encrypt all data
   * @param {string} newPin - New PIN
   * @param {Array} records - Array of encrypted records to re-encrypt
   * @returns {Promise<Array>} Re-encrypted records
   */
  async rekey(newPin, records) {
    if (!this.isUnlocked) {
      throw new Error('Crypto manager must be unlocked for rekeying');
    }

    const newSalt = await this.generateSalt();
    const newKey = await this.deriveKey(newPin, newSalt);
    const reEncryptedRecords = [];

    for (const record of records) {
      try {
        // Decrypt with old key
        const plaintext = await this.decrypt(record.iv, record.cipherText, this.masterKey);
        
        // Re-encrypt with new key
        const { iv: newIv, cipherText: newCipherText } = await this.encrypt(plaintext, newKey);
        
        reEncryptedRecords.push({
          ...record,
          iv: newIv,
          cipherText: newCipherText
        });
      } catch (error) {
        console.error('Failed to re-encrypt record:', error);
        // Keep original record if re-encryption fails
        reEncryptedRecords.push(record);
      }
    }

    return reEncryptedRecords;
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CryptoManager = CryptoManager;
}
