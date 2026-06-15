/**
 * Core Application Controller
 * Manages UI state, search/filtering, sorting, rendering, pagination, metrics dashboard, and exports.
 */
const APP = {
  // App state
  state: {
    rawRows: [],          // Raw unfiltered rows from sheet
    filteredRows: [],     // Rows after applying search & dropdown filters
    currentPage: 1,
    currentSort: {
      column: null,
      direction: 'asc'    // 'asc' or 'desc'
    },
    activeFilters: {},    // { Column: SelectedValue }
    searchQuery: '',
    theme: 'light',
    lastUpdated: null,
    columns: [],          // List of detected column headers
  },

  /**
   * Initialize Application
   */
  async init() {
    this.setupTheme();
    this.setupEventListeners();
    await this.loadData(false);
  },

  /**
   * Theme configuration and retrieval from localStorage
   */
  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  },

  /**
   * Sets theme attribute on the document element
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  /**
   * Toggles between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    this.showToast(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
  },

  /**
   * Load data from API / Local Cache
   * @param {boolean} forceRefresh - Ignore cache and pull from sheet
   */
  async loadData(forceRefresh = false) {
    this.showLoadingState();

    try {
      const result = await window.API.fetchData(forceRefresh);
      this.state.rawRows = result.data;
      this.state.lastUpdated = result.timestamp;
      
      if (this.state.rawRows.length > 0) {
        // Detect columns from first object keys
        this.state.columns = Object.keys(this.state.rawRows[0]);
      } else {
        this.state.columns = [];
      }

      this.updateTimestampDisplay(result.source);
      
      // Reset page and filters
      this.state.currentPage = 1;
      this.state.activeFilters = {};
      this.state.searchQuery = '';
      
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = '';

      // Set initial sort (use first column if none set)
      if (this.state.columns.length > 0 && !this.state.currentSort.column) {
        this.state.currentSort.column = this.state.columns[0];
        this.state.currentSort.direction = 'asc';
      }

      // Build filter dropdowns dynamically
      this.buildFilterDropdowns();
      
      // Initial filtering and draw
      this.applyFiltersAndSort();
      
      // Calculate and animate dashboard statistics
      this.renderDashboard();

      if (forceRefresh) {
        this.showToast('Data refreshed successfully', 'success');
      }
    } catch (error) {
      console.error('Data loading error:', error);
      this.showErrorState(error.message);
    }
  },

  /**
   * Sets up event listeners for inputs, theme, exports, etc.
   */
  setupEventListeners() {
    // Search input event
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.state.currentPage = 1; // reset page on search
        this.applyFiltersAndSort();
      });
    }

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData(true));
    }

    // Export CSV button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToCSV());
    }

    // Reset Filters button
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.state.activeFilters = {};
        this.state.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        // Reset filter selects
        document.querySelectorAll('.filter-select').forEach(select => {
          select.value = '';
        });

        this.state.currentPage = 1;
        this.applyFiltersAndSort();
        this.showToast('Filters cleared', 'info');
      });
    }

    // Scroll to top button logic
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      });
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  },

  /**
   * Scans rows and builds filter dropdown selectors dynamically for columns 
   * that act like categories (have 2 to 12 unique values across all entries).
   */
  buildFilterDropdowns() {
    const filtersContainer = document.getElementById('filters-grid');
    if (!filtersContainer) return;

    filtersContainer.innerHTML = '';
    const rows = this.state.rawRows;
    
    if (rows.length === 0) return;

    // Determine candidate columns (avoid IDs, high cardinality, or empty descriptions)
    const filterCandidates = this.state.columns.filter(col => {
      const uniqueVals = new Set(rows.map(r => r[col]).filter(Boolean));
      // Heuristic: category fields have between 2 and 12 unique values
      return uniqueVals.size >= 2 && uniqueVals.size <= 12;
    });

    if (filterCandidates.length === 0) {
      // Fallback: if no columns match criteria, pick the first column containing 'category' or 'status'
      const fallbackCol = this.state.columns.find(col => 
        col.toLowerCase().includes('category') || col.toLowerCase().includes('status')
      );
      if (fallbackCol) filterCandidates.push(fallbackCol);
    }

    filterCandidates.forEach(col => {
      // Extract unique values and sort them
      const uniqueVals = Array.from(new Set(rows.map(r => r[col]).filter(Boolean))).sort();

      const filterGroup = document.createElement('div');
      filterGroup.className = 'filter-group';

      const label = document.createElement('label');
      label.className = 'filter-label';
      label.textContent = col;
      label.setAttribute('for', `filter-${col}`);

      const select = document.createElement('select');
      select.className = 'filter-select';
      select.id = `filter-${col}`;
      select.innerHTML = `<option value="">All ${col}s</option>`;

      uniqueVals.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        select.appendChild(option);
      });

      // Bind filter selection change
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          this.state.activeFilters[col] = val;
        } else {
          delete this.state.activeFilters[col];
        }
        this.state.currentPage = 1;
        this.applyFiltersAndSort();
      });

      filterGroup.appendChild(label);
      filterGroup.appendChild(select);
      filtersContainer.appendChild(filterGroup);
    });

    // Make sure we show reset button if dropdowns are drawn
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      if (filterCandidates.length > 0) {
        resetBtn.style.display = 'inline-flex';
      } else {
        resetBtn.style.display = 'none';
      }
    }
  },

  /**
   * Applies filters, search queries, and sorting. Triggers view updates.
   */
  applyFiltersAndSort() {
    let results = [...this.state.rawRows];

    // 1. Apply Search Filter (Fuzzy check across all properties)
    if (this.state.searchQuery.trim() !== '') {
      const q = this.state.searchQuery.toLowerCase().trim();
      results = results.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        );
      });
    }

    // 2. Apply Dropdown Column Filters
    for (const [col, value] of Object.entries(this.state.activeFilters)) {
      results = results.filter(row => row[col] === value);
    }

    // 3. Apply Sorting
    const sortCol = this.state.currentSort.column;
    const sortDir = this.state.currentSort.direction;

    if (sortCol) {
      results.sort((a, b) => {
        let valA = a[sortCol];
        let valB = b[sortCol];

        // Convert string number representations to floats if they look numeric
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }

        // String comparison fallback
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.state.filteredRows = results;
    this.renderActiveFilterTags();
    this.renderCards();
    this.renderPagination();
    this.updateResultsCount();
  },

  /**
   * Renders active filter tag badges above search results
   */
  renderActiveFilterTags() {
    const container = document.getElementById('active-tags');
    if (!container) return;

    container.innerHTML = '';
    
    if (Object.keys(this.state.activeFilters).length === 0 && !this.state.searchQuery) return;

    // Search query tag
    if (this.state.searchQuery) {
      const tag = document.createElement('span');
      tag.className = 'filter-tag';
      tag.innerHTML = `Search: "${this.state.searchQuery}" <button id="clear-search-tag">&times;</button>`;
      container.appendChild(tag);

      document.getElementById('clear-search-tag').addEventListener('click', () => {
        this.state.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        this.applyFiltersAndSort();
      });
    }

    // Column filter tags
    for (const [col, val] of Object.entries(this.state.activeFilters)) {
      const tag = document.createElement('span');
      tag.className = 'filter-tag';
      tag.innerHTML = `${col}: ${val} <button data-col="${col}">&times;</button>`;
      container.appendChild(tag);
      
      tag.querySelector('button').addEventListener('click', (e) => {
        const column = e.target.getAttribute('data-col');
        delete this.state.activeFilters[column];
        
        const select = document.getElementById(`filter-${column}`);
        if (select) select.value = '';
        
        this.applyFiltersAndSort();
      });
    }
  },

  /**
   * Highlights matching text inside components to support search query visibility
   * @param {string} text - Raw text to render
   * @param {string} query - Target search text
   */
  highlightText(text, query) {
    if (!text) return '';
    text = String(text);
    if (!query || query.trim() === '') return window.API.sanitize(text);

    const escapedText = window.API.sanitize(text);
    const escapedQuery = window.API.sanitize(query.trim());

    // Escape regex characters
    const regexStr = escapedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${regexStr})`, 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
  },

  /**
   * Dynamic calculations for the Dashboard.
   * Scans columns and renders animated metrics cards.
   */
  renderDashboard() {
    const dashboard = document.getElementById('dashboard-grid');
    if (!dashboard) return;

    const rows = this.state.rawRows;
    if (rows.length === 0) {
      dashboard.innerHTML = '';
      return;
    }

    // Discover numeric columns
    const numericCols = this.state.columns.filter(col => {
      const values = rows.map(r => parseFloat(r[col])).filter(val => !isNaN(val));
      // If > 70% of rows contain actual numbers, call it a numeric column
      return values.length > rows.length * 0.7;
    });

    // Determine target metrics dynamically
    const metrics = [];

    // Metric 1: Total Records (always available)
    metrics.push({
      label: 'Total Records',
      value: rows.length,
      prefix: '',
      suffix: '',
      trend: 'Dynamically Loaded'
    });

    // Metric 2: Price or general numeric average
    const priceCol = numericCols.find(col => col.toLowerCase().includes('price') || col.toLowerCase().includes('cost'));
    if (priceCol) {
      const values = rows.map(r => parseFloat(r[priceCol])).filter(val => !isNaN(val));
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      metrics.push({
        label: `Avg ${priceCol}`,
        value: avg.toFixed(2),
        prefix: '$',
        suffix: '',
        trend: `Max: $${Math.max(...values)}`
      });
    } else if (numericCols.length > 0) {
      // Use first numeric column as fallback
      const col = numericCols[0];
      const values = rows.map(r => parseFloat(r[col])).filter(val => !isNaN(val));
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      metrics.push({
        label: `Avg ${col}`,
        value: avg.toFixed(1),
        prefix: '',
        suffix: '',
        trend: `Min-Max: ${Math.min(...values)}-${Math.max(...values)}`
      });
    }

    // Metric 3: Category / Status distribution
    const categoryCol = this.state.columns.find(col => 
      col.toLowerCase().includes('category') || col.toLowerCase().includes('type') || col.toLowerCase().includes('group')
    );
    if (categoryCol) {
      const uniqueCats = new Set(rows.map(r => r[categoryCol]).filter(Boolean));
      metrics.push({
        label: `Total ${categoryCol}s`,
        value: uniqueCats.size,
        prefix: '',
        suffix: '',
        trend: 'Categorized attributes'
      });
    }

    // Metric 4: Stock / Out-of-Stock count or high-value columns
    const stockCol = numericCols.find(col => col.toLowerCase().includes('stock') || col.toLowerCase().includes('qty') || col.toLowerCase().includes('quantity'));
    if (stockCol) {
      const outOfStockCount = rows.filter(r => parseFloat(r[stockCol]) === 0 || String(r[stockCol]).toLowerCase() === 'out of stock').length;
      metrics.push({
        label: 'Out of Stock',
        value: outOfStockCount,
        prefix: '',
        suffix: '',
        trend: `${rows.length - outOfStockCount} active in stock`
      });
    } else {
      // General dynamic count: unique values of first column
      const firstCol = this.state.columns[0];
      const uniqueVals = new Set(rows.map(r => r[firstCol]).filter(Boolean));
      metrics.push({
        label: `Unique ${firstCol}s`,
        value: uniqueVals.size,
        prefix: '',
        suffix: '',
        trend: 'Primary Key integrity'
      });
    }

    // Render metric cards HTML
    dashboard.innerHTML = metrics.map((m, idx) => `
      <div class="stat-card" style="animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s forwards;">
        <span class="stat-card-label">${m.label}</span>
        <span class="stat-card-value" id="stat-val-${idx}">${m.prefix}0${m.suffix}</span>
        <span class="stat-card-trend" style="color: var(--text-tertiary);">${m.trend}</span>
      </div>
    `).join('');

    // Animate statistics counter
    metrics.forEach((m, idx) => {
      const element = document.getElementById(`stat-val-${idx}`);
      if (!element) return;

      const targetVal = parseFloat(m.value);
      if (isNaN(targetVal)) {
        element.textContent = `${m.prefix}${m.value}${m.suffix}`;
        return;
      }

      this.animateCounter(element, 0, targetVal, m.prefix, m.suffix, 800);
    });
  },

  /**
   * Helper to animate integer or float counting.
   */
  animateCounter(element, start, end, prefix, suffix, duration) {
    let startTimestamp = null;
    const isFloat = end % 1 !== 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * (end - start) + start;
      
      element.textContent = prefix + 
        (isFloat ? currentVal.toFixed(2) : Math.floor(currentVal).toLocaleString()) + 
        suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },

  /**
   * Updates results summary description label
   */
  updateResultsCount() {
    const el = document.getElementById('results-count');
    if (!el) return;
    el.innerHTML = `Showing <span>${this.state.filteredRows.length}</span> of <span>${this.state.rawRows.length}</span> records`;
  },

  /**
   * Renders the cards grid layout with current page results
   */
  renderCards() {
    const grid = document.getElementById('cards-container');
    if (!grid) return;

    const q = this.state.searchQuery;
    const size = window.CONFIG.settings.pageSize;
    const start = (this.state.currentPage - 1) * size;
    const pageRows = this.state.filteredRows.slice(start, start + size);

    if (pageRows.length === 0) {
      this.renderEmptyState(grid);
      return;
    }

    grid.innerHTML = '';
    
    pageRows.forEach((row, rowIndex) => {
      const card = document.createElement('div');
      card.className = 'data-card';
      card.style.animation = `toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${rowIndex * 0.05}s forwards`;

      // Determine typical fields dynamically
      // 1. ID field
      const idCol = this.state.columns.find(col => 
        col.toLowerCase() === 'id' || col.toLowerCase() === 'code' || col.toLowerCase() === 'sku'
      );
      const idVal = idCol ? row[idCol] : '';

      // 2. Name / Title
      const nameCol = this.state.columns.find(col => 
        col.toLowerCase() === 'name' || col.toLowerCase() === 'title' || col.toLowerCase() === 'product' || col.toLowerCase() === 'item'
      ) || this.state.columns[0];
      const nameVal = row[nameCol] ? this.highlightText(row[nameCol], q) : 'Unnamed Row';

      // 3. Category / Subtitle
      const catCol = this.state.columns.find(col => 
        col.toLowerCase().includes('category') || col.toLowerCase().includes('type') || col.toLowerCase().includes('genre')
      );
      const catVal = catCol ? this.highlightText(row[catCol], q) : '';

      // 4. Status / Badge
      const statusCol = this.state.columns.find(col => 
        col.toLowerCase() === 'status' || col.toLowerCase() === 'availability' || col.toLowerCase() === 'state'
      );
      const statusVal = statusCol ? row[statusCol] : '';
      let badgeClass = 'badge-default';
      if (statusVal) {
        const lowerStatus = statusVal.toLowerCase();
        if (lowerStatus.includes('in stock') || lowerStatus.includes('active') || lowerStatus.includes('complete') || lowerStatus.includes('yes') || lowerStatus.includes('ok')) {
          badgeClass = 'badge-success';
        } else if (lowerStatus.includes('low stock') || lowerStatus.includes('pending') || lowerStatus.includes('warning')) {
          badgeClass = 'badge-warning';
        } else if (lowerStatus.includes('out of stock') || lowerStatus.includes('inactive') || lowerStatus.includes('cancel') || lowerStatus.includes('no')) {
          badgeClass = 'badge-danger';
        }
      }

      // 5. Description / Body
      const descCol = this.state.columns.find(col => 
        col.toLowerCase().includes('desc') || col.toLowerCase().includes('note') || col.toLowerCase().includes('about')
      );
      const descVal = descCol ? this.highlightText(row[descCol], q) : '';

      // 6. Attributes List (Everything else, excluding the main layouts)
      const excludeCols = [idCol, nameCol, catCol, statusCol, descCol].filter(Boolean);
      const attributePairs = this.state.columns
        .filter(col => !excludeCols.includes(col))
        .map(col => {
          const highlightedVal = this.highlightText(row[col], q);
          return `
            <div class="attribute-pair">
              <span class="attr-label">${col}</span>
              <span class="attr-value">${highlightedVal || '-'}</span>
            </div>
          `;
        }).join('');

      // Unique row key
      const rowJSON = encodeURIComponent(JSON.stringify(row));

      // Build card HTML
      card.innerHTML = `
        <div>
          <div class="card-header">
            <div class="card-title-area">
              ${catVal ? `<span class="card-category">${catVal}</span>` : ''}
              <h3 class="card-title">${nameVal}</h3>
              ${idVal ? `<span style="font-size: 0.75rem; color: var(--text-tertiary);">ID: ${this.highlightText(idVal, q)}</span>` : ''}
            </div>
            ${statusVal ? `<span class="card-badge ${badgeClass}">${statusVal}</span>` : ''}
          </div>
          
          ${descVal ? `<div class="card-body">${descVal}</div>` : ''}
          
          ${attributePairs ? `<div class="card-attributes">${attributePairs}</div>` : ''}
        </div>

        <div class="card-footer">
          <span class="card-date">${row['Last Updated'] ? `Updated: ${row['Last Updated']}` : ''}</span>
          <div class="card-actions">
            <button class="btn card-icon-btn copy-row-btn" data-row-data="${rowJSON}" title="Copy record data">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m14.25 9.75v-10.5c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125z" />
              </svg>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Bind event listeners for row copying
    grid.querySelectorAll('.copy-row-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.currentTarget;
        const rawData = btnEl.getAttribute('data-row-data');
        if (rawData) {
          const rowObj = JSON.parse(decodeURIComponent(rawData));
          this.copyRowData(rowObj);
        }
      });
    });
  },

  /**
   * Renders standard pagination buttons
   */
  renderPagination() {
    const controls = document.getElementById('page-controls');
    if (!controls) return;

    controls.innerHTML = '';
    const size = window.CONFIG.settings.pageSize;
    const totalPages = Math.ceil(this.state.filteredRows.length / size);

    if (totalPages <= 1) {
      controls.innerHTML = '';
      return;
    }

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn page-btn';
    prevBtn.disabled = this.state.currentPage === 1;
    prevBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 14px; height: 14px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    `;
    prevBtn.addEventListener('click', () => {
      this.state.currentPage--;
      this.applyFiltersAndSort();
      window.scrollTo({ top: document.getElementById('cards-container').offsetTop - 120, behavior: 'smooth' });
    });
    controls.appendChild(prevBtn);

    // Page numbers
    // Always show first, last, current, and page padding
    const range = [];
    const delta = 1; // Number of pages to show around current page
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.state.currentPage - delta && i <= this.state.currentPage + delta)) {
        range.push(i);
      }
    }

    let l;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          const dot = document.createElement('span');
          dot.textContent = l + 1;
          dot.className = 'btn page-btn';
          dot.style.pointerEvents = 'none';
          dot.style.opacity = '0.7';
          controls.appendChild(dot);
        } else if (i - l > 2) {
          const dot = document.createElement('span');
          dot.textContent = '...';
          dot.style.padding = '0 0.5rem';
          dot.style.color = 'var(--text-tertiary)';
          controls.appendChild(dot);
        }
      }
      
      const pBtn = document.createElement('button');
      pBtn.className = `btn page-btn ${i === this.state.currentPage ? 'active' : ''}`;
      pBtn.textContent = i;
      pBtn.addEventListener('click', () => {
        this.state.currentPage = i;
        this.applyFiltersAndSort();
        window.scrollTo({ top: document.getElementById('cards-container').offsetTop - 120, behavior: 'smooth' });
      });
      controls.appendChild(pBtn);
      l = i;
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn page-btn';
    nextBtn.disabled = this.state.currentPage === totalPages;
    nextBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 14px; height: 14px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    `;
    nextBtn.addEventListener('click', () => {
      this.state.currentPage++;
      this.applyFiltersAndSort();
      window.scrollTo({ top: document.getElementById('cards-container').offsetTop - 120, behavior: 'smooth' });
    });
    controls.appendChild(nextBtn);
  },

  /**
   * Compiles the filtered list and starts a browser download file prompt
   */
  exportToCSV() {
    const rows = this.state.filteredRows;
    if (rows.length === 0) {
      this.showToast('No data available to export', 'error');
      return;
    }

    const headers = this.state.columns;
    
    // Convert array of objects to standard CSV content
    const csvContent = [
      headers.join(','), // headers row
      ...rows.map(row => 
        headers.map(field => {
          const val = row[field] === undefined ? '' : String(row[field]);
          // Escape quotes and wrap values in quotes to prevent structural issues
          const cleanVal = val.replace(/"/g, '""');
          return `"${cleanVal}"`;
        }).join(',')
      )
    ].join('\r\n');

    // Create BLOB and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `datasphere_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast(`Exported ${rows.length} rows to CSV`, 'success');
  },

  /**
   * Copy card row details to clipboard as formatted text
   * @param {Object} row - Data object
   */
  async copyRowData(row) {
    // Format nicely as key-value pairs
    let formattedText = '=== RECORD DATA ===\n';
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'Last Updated') {
        formattedText += `${key}: ${value}\n`;
      }
    }

    try {
      await navigator.clipboard.writeText(formattedText);
      this.showToast('Copied record to clipboard!', 'success');
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = formattedText;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.showToast('Copied record to clipboard!', 'success');
      } catch (e) {
        console.error('Copy fallback failed', e);
        this.showToast('Failed to copy to clipboard', 'error');
      }
      document.body.removeChild(textarea);
    }
  },

  /**
   * Spawns a floating toast feedback banner
   * @param {string} msg - Message
   * @param {string} type - 'success', 'error', 'info'
   */
  showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = '';
    if (type === 'success') {
      icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="var(--color-success)" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    } else if (type === 'error') {
      icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="var(--color-danger)" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    } else {
      icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="var(--accent-color)" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.04.04m-2.138 1.548h.008v.008h-.008v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    }

    toast.innerHTML = `${icon} <span>${msg}</span>`;
    container.appendChild(toast);

    // Remove from DOM after animations complete (3s total)
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  /**
   * Displays shimmer skeleton items inside the grid
   */
  showLoadingState() {
    const grid = document.getElementById('cards-container');
    if (!grid) return;

    grid.innerHTML = Array(window.CONFIG.settings.pageSize).fill(0).map(() => `
      <div class="data-card skeleton-card">
        <div>
          <div class="card-header">
            <div class="card-title-area" style="width: 100%;">
              <div class="skeleton-text skeleton-badge" style="width: 25%;"></div>
              <div class="skeleton-text skeleton-title" style="margin-top: 5px;"></div>
            </div>
            <div class="skeleton-text skeleton-badge"></div>
          </div>
          <div class="skeleton-text skeleton-para"></div>
          <div class="card-attributes" style="border:none;">
            <div class="attribute-pair"><div class="skeleton-text" style="width: 40%; height: 10px;"></div><div class="skeleton-text" style="width: 60%; margin-top: 4px;"></div></div>
            <div class="attribute-pair"><div class="skeleton-text" style="width: 50%; height: 10px;"></div><div class="skeleton-text" style="width: 40%; margin-top: 4px;"></div></div>
          </div>
        </div>
        <div class="card-footer">
          <div class="skeleton-text" style="width: 30%; height: 12px;"></div>
          <div class="skeleton-text" style="width: 35px; height: 32px; border-radius: var(--radius-sm);"></div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Renders the Empty search state
   * @param {HTMLElement} container - Grid element
   */
  renderEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="empty-title">No matching records</h3>
        <p class="empty-desc">We couldn't find anything matching your search query or column filters. Try clearing some selections or editing your search keyword.</p>
      </div>
    `;
  },

  /**
   * Displays failure card with configuration instructions
   * @param {string} msg - Technical error message
   */
  showErrorState(msg) {
    const grid = document.getElementById('cards-container');
    if (!grid) return;

    grid.innerHTML = `
      <div class="error-state">
        <div class="error-header">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 24px; height: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
          <h3 class="error-title">Data Loading Failed</h3>
        </div>
        <p class="error-message">
          An error occurred while attempting to retrieve data from your Google Sheet:<br>
          <strong style="color: var(--color-danger);">${msg}</strong>
        </p>
        <p class="error-message" style="font-size: 0.85rem; border-top: 1px solid var(--border-color); padding-top: 1rem; color: var(--text-secondary);">
          <strong>Troubleshooting checklist:</strong><br>
          1. Did you "Publish to the web" the Google Sheet as a CSV?<br>
          2. Is your Sheet ID correct in <code>js/config.js</code>?<br>
          3. If using API mode, did you set a valid API key and verify its permissions?<br>
          4. Check internet connectivity.
        </p>
        <div class="error-actions">
          <button class="btn btn-primary" id="error-retry-btn">Retry Fetch</button>
          <button class="btn" id="error-mock-btn">Load Demo Data</button>
        </div>
      </div>
    `;

    document.getElementById('error-retry-btn').addEventListener('click', () => this.loadData(true));
    document.getElementById('error-mock-btn').addEventListener('click', () => {
      // Force load cached mock data fallback
      const sanitizedMock = window.API.sanitizeData(window.CONFIG.mockData);
      this.state.rawRows = sanitizedMock;
      this.state.columns = Object.keys(sanitizedMock[0]);
      this.state.currentPage = 1;
      this.state.activeFilters = {};
      this.state.searchQuery = '';
      this.buildFilterDropdowns();
      this.applyFiltersAndSort();
      this.renderDashboard();
      this.updateTimestampDisplay('mock');
      this.showToast('Loaded local demonstration data', 'info');
    });
  },

  /**
   * Displays the time elapsed since data was loaded
   * @param {string} source - 'cache', 'network', or 'mock'
   */
  updateTimestampDisplay(source) {
    const tsEl = document.getElementById('last-updated-time');
    if (!tsEl) return;

    if (!this.state.lastUpdated) {
      tsEl.textContent = 'Never';
      return;
    }

    const timeStr = new Date(this.state.lastUpdated).toLocaleTimeString();
    let sourceLabel = '';
    
    if (source === 'cache') {
      sourceLabel = ' (cached)';
    } else if (source === 'mock') {
      sourceLabel = ' (demo data)';
    } else if (source === 'cache-fallback') {
      sourceLabel = ' (offline cache)';
    }

    tsEl.textContent = `${timeStr}${sourceLabel}`;
  }
};

// Export APP to global window context
window.APP = APP;

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
  window.APP.init();
});
