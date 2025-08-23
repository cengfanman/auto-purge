/**
 * IndexedDB manager for AutoPurge Pro Shadow History
 * Responsibilities:
 * - Database initialization and versioning
 * - Encrypted record storage and retrieval
 * - Database statistics and maintenance
 */

class ShadowHistoryDB {
  constructor() {
    this.dbName = 'AutoPurgeShadowHistory';
    this.version = 1;
    this.db = null;
    this.storeName = 'records';
  }

  /**
   * Initialize the database
   * @returns {Promise<IDBDatabase>} Database instance
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          
          // Create indexes for efficient querying
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('ruleId', 'ruleId', { unique: false });
          store.createIndex('url', 'url', { unique: false });
          
          console.log('IndexedDB store created successfully');
        }
      };
    });
  }

  /**
   * Store an encrypted record
   * @param {Object} record - Record to store
   * @returns {Promise<number>} Record ID
   */
  async storeRecord(record) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const recordWithTimestamp = {
        ...record,
        createdAt: Date.now()
      };

      const request = store.add(recordWithTimestamp);

      request.onsuccess = () => {
        console.log('Record stored successfully, ID:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to store record:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Retrieve all encrypted records
   * @returns {Promise<Array>} Array of encrypted records
   */
  async getAllRecords() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to retrieve records:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get records by date range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Promise<Array>} Filtered records
   */
  async getRecordsByDateRange(startTime, endTime) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('createdAt');
      
      const range = IDBKeyRange.bound(startTime, endTime);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to retrieve records by date range:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get records by rule ID
   * @param {string} ruleId - Rule identifier
   * @returns {Promise<Array>} Filtered records
   */
  async getRecordsByRule(ruleId) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('ruleId');
      
      const request = index.getAll(ruleId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to retrieve records by rule:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a specific record
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRecord(id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Record deleted successfully');
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to delete record:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete multiple records by IDs
   * @param {Array<number>} ids - Array of record IDs
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteRecords(ids) {
    if (!this.db) {
      await this.init();
    }

    let deletedCount = 0;
    
    for (const id of ids) {
      try {
        await this.deleteRecord(id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete record ${id}:`, error);
      }
    }

    return deletedCount;
  }

  /**
   * Clear all records (nuclear option)
   * @returns {Promise<boolean>} Success status
   */
  async clearAllRecords() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All records cleared successfully');
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to clear records:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const countRequest = store.count();
      const getAllRequest = store.getAll();

      let recordCount = 0;
      let totalSize = 0;

      countRequest.onsuccess = () => {
        recordCount = countRequest.result;
      };

      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result || [];
        totalSize = records.reduce((size, record) => {
          // Estimate size: iv + cipherText + metadata
          return size + (record.iv?.length || 0) + (record.cipherText?.length || 0) + 100;
        }, 0);
        
        resolve({
          recordCount,
          totalSizeBytes: totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
        });
      };

      countRequest.onerror = () => {
        console.error('Failed to get record count:', countRequest.error);
        reject(countRequest.error);
      };

      getAllRequest.onerror = () => {
        console.error('Failed to get records for size calculation:', getAllRequest.error);
        reject(getAllRequest.error);
      };
    });
  }

  /**
   * Export records as CSV
   * @param {Array} records - Array of decrypted records
   * @returns {string} CSV content
   */
  exportAsCSV(records) {
    if (!records || records.length === 0) {
      return '';
    }

    const headers = ['URL', 'Title', 'Visited At', 'Rule ID', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const record of records) {
      const row = [
        `"${record.url || ''}"`,
        `"${record.title || ''}"`,
        `"${new Date(record.visitedAt).toISOString()}"`,
        `"${record.ruleId || ''}"`,
        `"${new Date(record.createdAt).toISOString()}"`
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Export records as HTML bookmarks
   * @param {Array} records - Array of decrypted records
   * @returns {string} HTML bookmarks content
   */
  exportAsBookmarks(records) {
    if (!records || records.length === 0) {
      return '';
    }

    let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
    html += '<!-- This is an automatically generated file.\n';
    html += '     It will be read and overwritten.\n';
    html += '     DO NOT EDIT! -->\n';
    html += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
    html += '<TITLE>Bookmarks</TITLE>\n';
    html += '<H1>Bookmarks</H1>\n';
    html += '<DL><p>\n';

    for (const record of records) {
      html += '    <DT><A HREF="' + (record.url || '') + '"';
      if (record.title) {
        html += ' TITLE="' + record.title.replace(/"/g, '&quot;') + '"';
      }
      html += '>' + (record.title || record.url || 'Untitled') + '</A>\n';
    }

    html += '</DL><p>\n';
    return html;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ShadowHistoryDB = ShadowHistoryDB;
}
