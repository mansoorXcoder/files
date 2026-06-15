/**
 * API and Data Fetching Services
 * Manages caching, Google Sheets connectivity, CSV parsing, and security sanitization.
 */
const API = {
  // Local storage keys
  CACHE_KEY: 'gs_dashboard_data',
  TIMESTAMP_KEY: 'gs_dashboard_timestamp',

  /**
   * Sanitizes HTML strings to prevent XSS attacks.
   * @param {any} value - Value to sanitize
   * @returns {string} Sanitized string
   */
  sanitize(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') value = String(value);
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Deeply sanitizes an object or array to prevent XSS.
   * @param {any} data - Object or array to sanitize
   * @returns {any} Sanitized data
   */
  sanitizeData(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    } else if (data !== null && typeof data === 'object') {
      const sanitizedObj = {};
      for (const [key, value] of Object.entries(data)) {
        const cleanKey = this.sanitize(key);
        if (typeof value === 'object') {
          sanitizedObj[cleanKey] = this.sanitizeData(value);
        } else {
          sanitizedObj[cleanKey] = this.sanitize(value);
        }
      }
      return sanitizedObj;
    }
    return this.sanitize(data);
  },

  /**
   * Parses RFC-4180 compliant CSV text into an array of objects.
   * Handles commas inside quotes, escaped quotes, and newlines inside fields.
   * @param {string} text - Raw CSV text
   * @returns {Array<Object>} Parsed data
   */
  parseCSV(text) {
    if (!text || text.trim() === '') return [];
    
    const lines = [];
    let currentRow = [''];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        // Handle escaped quotes ("") inside quotes
        if (inQuotes && nextChar === '"') {
          currentRow[currentRow.length - 1] += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        // Skip trailing \n if we just hit \r
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(currentRow);
        currentRow = [''];
      } else {
        currentRow[currentRow.length - 1] += char;
      }
    }

    // Add trailing row if there's remaining data
    if (currentRow.length > 1 || currentRow[0] !== '') {
      lines.push(currentRow);
    }

    if (lines.length === 0) return [];

    // Header extraction
    const headers = lines[0].map(header => header.trim()).filter(Boolean);
    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      // Skip empty or mismatching rows
      if (row.length === 1 && row[0] === '') continue;
      
      const obj = {};
      let hasValues = false;
      
      for (let j = 0; j < headers.length; j++) {
        const val = row[j] !== undefined ? row[j].trim() : '';
        if (val) hasValues = true;
        obj[headers[j]] = val;
      }
      
      if (hasValues) {
        parsedData.push(obj);
      }
    }

    return parsedData;
  },

  /**
   * Parses Google Sheets API v4 response JSON into an array of objects.
   * @param {Object} json - JSON response
   * @returns {Array<Object>} Parsed data
   */
  parseSheetsAPI(json) {
    if (!json || !json.values || json.values.length === 0) return [];

    const headers = json.values[0].map(h => h.trim());
    const parsedData = [];

    for (let i = 1; i < json.values.length; i++) {
      const row = json.values[i];
      const obj = {};
      let hasValues = false;

      for (let j = 0; j < headers.length; j++) {
        const val = row[j] !== undefined ? row[j].trim() : '';
        if (val) hasValues = true;
        obj[headers[j]] = val;
      }

      if (hasValues) {
        parsedData.push(obj);
      }
    }

    return parsedData;
  },

  /**
   * Builds the remote request URL depending on the configured mode.
   * @returns {string} URL string
   */
  buildRequestURL() {
    const { mode, csvUrl, sheetId, apiKey, range, gid } = window.CONFIG.dataSource;

    if (mode === 'csv') {
      if (csvUrl && csvUrl.trim() !== '') {
        return csvUrl.trim();
      }
      if (!sheetId) {
        throw new Error('Google Sheet ID is not configured in CONFIG.dataSource.sheetId');
      }
      return `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=${gid || 0}`;
    } else if (mode === 'api') {
      if (!sheetId || !apiKey) {
        throw new Error('Google Sheet ID or Google API Key is missing in CONFIG.dataSource');
      }
      return `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
    }
    
    throw new Error(`Invalid data source mode: ${mode}`);
  },

  /**
   * Fetches latest data from cache, remote endpoint, or mock fallback.
   * @param {boolean} forceRefresh - If true, ignores the local cache and fetches fresh data.
   * @returns {Promise<{data: Array<Object>, source: string, timestamp: number}>}
   */
  async fetchData(forceRefresh = false) {
    const cacheTTL = window.CONFIG.settings.cacheTTL * 1000; // to ms
    const now = Date.now();

    // Check Local Storage Cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedDataStr = localStorage.getItem(this.CACHE_KEY);
      const cachedTimeStr = localStorage.getItem(this.TIMESTAMP_KEY);

      if (cachedDataStr && cachedTimeStr) {
        const timestamp = parseInt(cachedTimeStr, 10);
        if (now - timestamp < cacheTTL) {
          try {
            const parsed = JSON.parse(cachedDataStr);
            return {
              data: parsed,
              source: 'cache',
              timestamp: timestamp
            };
          } catch (e) {
            console.error('Failed to parse cached JSON, refetching...', e);
          }
        }
      }
    }

    // Attempt Network Fetch
    try {
      const url = this.buildRequestURL();
      
      // Setup timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      let parsedData = [];
      const mode = window.CONFIG.dataSource.mode;

      if (mode === 'csv') {
        const text = await response.text();
        parsedData = this.parseCSV(text);
      } else {
        const json = await response.json();
        parsedData = this.parseSheetsAPI(json);
      }

      if (!parsedData || parsedData.length === 0) {
        throw new Error('Parsed Google Sheet data is empty or invalid.');
      }

      // XSS Sanitization
      const cleanData = this.sanitizeData(parsedData);

      // Save to Cache
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cleanData));
      localStorage.setItem(this.TIMESTAMP_KEY, now.toString());

      return {
        data: cleanData,
        source: 'network',
        timestamp: now
      };

    } catch (error) {
      console.warn('Network fetch failed or timed out. Attempting cache fallback...', error);

      // Network failed: try cache fallback regardless of cache TTL expiration
      const cachedDataStr = localStorage.getItem(this.CACHE_KEY);
      const cachedTimeStr = localStorage.getItem(this.TIMESTAMP_KEY);

      if (cachedDataStr && cachedTimeStr) {
        try {
          return {
            data: JSON.parse(cachedDataStr),
            source: 'cache-fallback',
            timestamp: parseInt(cachedTimeStr, 10)
          };
        } catch (e) {
          console.error('Failed to read expired cache fallback.', e);
        }
      }

      // If everything fails, serve mock configuration data
      console.warn('No cache available. Falling back to default CONFIG.mockData.');
      const sanitizedMock = this.sanitizeData(window.CONFIG.mockData);
      
      return {
        data: sanitizedMock,
        source: 'mock',
        timestamp: now
      };
    }
  },

  /**
   * Helper to clear local storage cache.
   */
  clearCache() {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);
  }
};

// Export API to global window context
window.API = API;
