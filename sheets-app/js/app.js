/**
 * app.js — DataSheet Core Application
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture:
 *   State   → single source of truth
 *   Fetch   → Google Sheets (CSV or API) with localStorage cache
 *   Render  → card grid or table, driven by filtered/sorted/paginated state
 *   Events  → delegated where possible, keyboard-accessible
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ─── Utility helpers ──────────────────────────────────────────────────────── */

/** Sanitise a string for safe innerHTML insertion (prevents XSS). */
const sanitize = (str) => {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
};

/** Escape special chars for use inside a RegExp. */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Debounce a function. */
const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/** Format a Date nicely. */
const fmtDate = (d) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
  ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });

/* ─── State ────────────────────────────────────────────────────────────────── */

const state = {
  rawRows:       [],   // all rows fetched from sheet
  filteredRows:  [],   // after search + column-filters
  columns:       [],   // header names (strings)
  currentPage:   1,
  sortCol:       '',
  sortAsc:       true,
  query:         '',
  viewMode:      'card',           // 'card' | 'table'
  colFilters:    {},               // { colName: activeValue | '' }
  theme:         localStorage.getItem('ds-theme') || 'light',
  lastUpdated:   null,
  loading:       true,
  error:         null,
};

/* ─── DOM refs ─────────────────────────────────────────────────────────────── */

const $  = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  skeleton:   $('skeleton-loader'),
  errorState: $('error-state'),
  emptyState: $('empty-state'),
  cardGrid:   $('card-grid'),
  tableWrap:  $('table-wrapper'),
  tableHead:  $('table-head'),
  tableBody:  $('table-body'),
  pagination: $('pagination'),
  prevPage:   $('prev-page'),
  nextPage:   $('next-page'),
  pageInfo:   $('page-info'),
  searchInput:$('search-input'),
  sortSelect: $('sort-select'),
  sortDir:    $('sort-dir'),
  filterChips:$('filter-chips'),
  statsSection:$('stats-section'),
  totalCount: $('total-count'),
  lastUpdated:$('last-updated'),
  refreshBtn: $('refresh-btn'),
  exportBtn:  $('export-btn'),
  themeToggle:$('theme-toggle'),
  retryBtn:   $('retry-btn'),
  clearSearch:$('clear-search-btn'),
  offlineBanner:$('offline-banner'),
  toastContainer:$('toast-container'),
  viewCard:   $('view-card'),
  viewTable:  $('view-table'),
  copyModal:  $('copy-modal'),
  modalClose: $('modal-close'),
  modalPre:   $('modal-pre'),
  modalCopy:  $('modal-copy-btn'),
  modalBackdrop:$('modal-backdrop'),
  statsPill:  $('stats-pill'),
};

/* ─── Theme ────────────────────────────────────────────────────────────────── */

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ds-theme', theme);
  document.getElementById('theme-color-meta').content =
    theme === 'dark' ? '#0a0a0a' : '#ffffff';
}

/* ─── Toast notifications ──────────────────────────────────────────────────── */

function showToast(msg, type = 'info', duration = 3000) {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.setAttribute('role', 'status');
  t.textContent = msg;
  els.toastContainer.appendChild(t);
  // Trigger animation
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, duration);
}

/* ─── Data fetching ────────────────────────────────────────────────────────── */

const CACHE_KEY  = 'ds-cache-data';
const CACHE_TIME = 'ds-cache-time';

/** Parse CSV text → array of row objects keyed by header name. */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { columns: [], rows: [] };

  // Simple robust CSV parser (handles quoted commas)
  const parseLine = (line) => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"' && !inQ) { inQ = true; continue; }
      if (c === '"' && inQ)  { inQ = false; continue; }
      if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    cols.push(cur.trim());
    return cols;
  };

  const headers = parseLine(lines[0]).filter(h => h);
  const hidden = (CONFIG.HIDDEN_COLUMNS || []).map(c => c.toLowerCase());
  const visibleHeaders = headers.filter(h => !hidden.includes(h.toLowerCase()));

  const rows = lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = parseLine(line);
      const row = {};
      visibleHeaders.forEach((h, i) => {
        row[h] = vals[headers.indexOf(h)] ?? '';
      });
      return row;
    })
    .filter(r => Object.values(r).some(v => v !== ''));

  return { columns: visibleHeaders, rows };
}

/** Parse Sheets API v4 JSON response. */
function parseAPIResponse(json) {
  const values = json.values || [];
  if (values.length < 2) return { columns: [], rows: [] };

  const headers = values[0].map(h => String(h).trim()).filter(h => h);
  const hidden = (CONFIG.HIDDEN_COLUMNS || []).map(c => c.toLowerCase());
  const visibleHeaders = headers.filter(h => !hidden.includes(h.toLowerCase()));

  const rows = values.slice(1).map(vals => {
    const row = {};
    visibleHeaders.forEach(h => {
      const i = headers.indexOf(h);
      row[h] = vals[i] != null ? String(vals[i]).trim() : '';
    });
    return row;
  }).filter(r => Object.values(r).some(v => v !== ''));

  return { columns: visibleHeaders, rows };
}

async function fetchFromSheet() {
  if (CONFIG.MODE === 'api') {
    const range = encodeURIComponent(`${CONFIG.SHEET_NAME}!${CONFIG.SHEET_RANGE}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheets API error: ${res.status} ${res.statusText}`);
    const json = await res.json();
    return parseAPIResponse(json);
  } else {
    // Default: published CSV
    const url = CONFIG.PUBLISHED_CSV_URL + '&_=' + Date.now(); // cache-bust
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not fetch CSV: ${res.status} ${res.statusText}`);
    const text = await res.text();
    return parseCSV(text);
  }
}

async function loadData(forceRefresh = false) {
  state.loading = true;
  state.error   = null;
  renderShell();

  // Try cache first (unless forced refresh)
  if (!forceRefresh) {
    const cachedTime = localStorage.getItem(CACHE_TIME);
    if (cachedTime && Date.now() - Number(cachedTime) < CONFIG.CACHE_TTL_MS) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (cached.columns && cached.rows) {
          applyData(cached.columns, cached.rows, false);
          return;
        }
      } catch (_) { /* corrupt cache, ignore */ }
    }
  }

  // Network fetch
  try {
    const { columns, rows } = await fetchFromSheet();
    if (!columns.length) throw new Error('No data found in sheet. Is it published correctly?');

    // Store in cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({ columns, rows }));
    localStorage.setItem(CACHE_TIME, String(Date.now()));

    applyData(columns, rows, true);
  } catch (err) {
    // Try stale cache as fallback
    try {
      const stale = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      if (stale.columns && stale.rows) {
        showToast('Showing cached data — fetch failed: ' + err.message, 'warn', 6000);
        applyData(stale.columns, stale.rows, false);
        return;
      }
    } catch (_) {}

    state.loading = false;
    state.error   = err.message;
    renderShell();
  }
}

function applyData(columns, rows, fresh) {
  state.rawRows     = rows;
  state.columns     = columns;
  state.loading     = false;
  state.error       = null;
  state.lastUpdated = fresh ? new Date() : state.lastUpdated;

  // Initialise column filters
  state.colFilters = {};
  columns.forEach(c => { state.colFilters[c] = ''; });

  // Sort select options
  els.sortSelect.innerHTML = '<option value="">Sort by…</option>' +
    columns.map(c => `<option value="${sanitize(c)}">${sanitize(c)}</option>`).join('');

  buildFilterChips();
  buildStats();
  applyFilters();
  if (fresh) showToast('Data refreshed ✓', 'success', 2000);
}

/* ─── Filtering, sorting, pagination ──────────────────────────────────────── */

function applyFilters() {
  const q = state.query.toLowerCase().trim();
  const qRe = q ? new RegExp(escapeRegExp(q), 'gi') : null;

  state.filteredRows = state.rawRows.filter(row => {
    // Column filters
    for (const [col, val] of Object.entries(state.colFilters)) {
      if (val && row[col] !== val) return false;
    }
    // Search query
    if (!qRe) return true;
    return Object.values(row).some(v => qRe.test(String(v)));
  });

  // Sort
  if (state.sortCol) {
    state.filteredRows.sort((a, b) => {
      const va = a[state.sortCol] ?? '';
      const vb = b[state.sortCol] ?? '';
      const na = parseFloat(va), nb = parseFloat(vb);
      const numeric = !isNaN(na) && !isNaN(nb);
      const cmp = numeric ? na - nb : String(va).localeCompare(String(vb));
      return state.sortAsc ? cmp : -cmp;
    });
  }

  state.currentPage = 1;
  els.totalCount.textContent = state.filteredRows.length;
  renderContent();
}

function currentPageRows() {
  const { currentPage } = state;
  const ppp = CONFIG.RECORDS_PER_PAGE;
  const start = (currentPage - 1) * ppp;
  return state.filteredRows.slice(start, start + ppp);
}

function totalPages() {
  return Math.max(1, Math.ceil(state.filteredRows.length / CONFIG.RECORDS_PER_PAGE));
}

/* ─── Stats dashboard ──────────────────────────────────────────────────────── */

function autoDetectNumeric(columns, rows) {
  if (CONFIG.NUMERIC_COLUMNS && CONFIG.NUMERIC_COLUMNS.length) return CONFIG.NUMERIC_COLUMNS;
  return columns.filter(col => {
    const sample = rows.slice(0, 20).map(r => r[col]).filter(v => v !== '');
    return sample.length > 0 && sample.every(v => !isNaN(parseFloat(v)));
  });
}

function buildStats() {
  const { columns, rawRows } = state;
  const numCols = autoDetectNumeric(columns, rawRows);

  const stats = [];

  // Always show total count
  stats.push({ label: 'Total Records', value: rawRows.length, icon: '◈' });

  // Numeric stats
  numCols.slice(0, 3).forEach(col => {
    const vals = rawRows.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    if (!vals.length) return;
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / vals.length;
    const max = Math.max(...vals);
    stats.push({
      label: 'Total ' + col,
      value: sum % 1 === 0 ? sum.toLocaleString() : sum.toFixed(2),
      icon: '∑',
    });
    stats.push({
      label: 'Avg ' + col,
      value: avg % 1 === 0 ? avg.toLocaleString() : avg.toFixed(2),
      icon: '≈',
    });
  });

  els.statsSection.innerHTML = stats.slice(0, 4).map((s, i) => `
    <div class="stat-card" style="animation-delay:${i * 60}ms">
      <span class="stat-icon" aria-hidden="true">${sanitize(s.icon)}</span>
      <span class="stat-value">${sanitize(String(s.value))}</span>
      <span class="stat-label">${sanitize(s.label)}</span>
    </div>
  `).join('');
}

/* ─── Column filter chips ──────────────────────────────────────────────────── */

function buildFilterChips() {
  const { columns, rawRows } = state;
  // Choose up to 4 low-cardinality columns for chips
  const chipCols = columns.filter(col => {
    const unique = new Set(rawRows.map(r => r[col]).filter(v => v));
    return unique.size >= 2 && unique.size <= 15;
  }).slice(0, 4);

  if (!chipCols.length) { els.filterChips.innerHTML = ''; return; }

  els.filterChips.innerHTML = chipCols.map(col => {
    const values = [...new Set(state.rawRows.map(r => r[col]).filter(v => v))].sort();
    return `
      <div class="chip-group">
        <span class="chip-label">${sanitize(col)}</span>
        <select class="chip-select" data-col="${sanitize(col)}" aria-label="Filter by ${sanitize(col)}">
          <option value="">All</option>
          ${values.map(v => `<option value="${sanitize(v)}">${sanitize(v)}</option>`).join('')}
        </select>
      </div>
    `;
  }).join('');

  els.filterChips.querySelectorAll('.chip-select').forEach(sel => {
    sel.addEventListener('change', () => {
      state.colFilters[sel.dataset.col] = sel.value;
      applyFilters();
    });
  });
}

/* ─── Rendering ────────────────────────────────────────────────────────────── */

/** Show/hide sections depending on loading/error/empty state. */
function renderShell() {
  const { loading, error, filteredRows } = state;

  els.skeleton.classList.toggle   ('hidden', !loading);
  els.errorState.classList.toggle ('hidden', !error);

  const noData = !loading && !error && !filteredRows.length;
  els.emptyState.classList.toggle ('hidden', !noData);

  const hasData = !loading && !error && filteredRows.length > 0;
  const isCard  = state.viewMode === 'card';
  els.cardGrid.classList.toggle   ('hidden', !(hasData && isCard));
  els.tableWrap.classList.toggle  ('hidden', !(hasData && !isCard));
  els.pagination.classList.toggle ('hidden', !hasData || totalPages() <= 1);

  if (error) $('error-msg').textContent = error;
  if (state.lastUpdated)
    els.lastUpdated.textContent = 'Updated ' + fmtDate(state.lastUpdated);
}

/** Highlight search query inside a string. */
function highlight(str, q) {
  if (!q) return sanitize(str);
  const safe = sanitize(str);
  const re = new RegExp(`(${escapeRegExp(sanitize(q))})`, 'gi');
  return safe.replace(re, '<mark class="hl">$1</mark>');
}

function getPrimary(row) {
  const col = CONFIG.PRIMARY_COLUMN || state.columns[0];
  return row[col] ?? '';
}

function getBadgeCols() {
  if (CONFIG.BADGE_COLUMNS && CONFIG.BADGE_COLUMNS.length) return CONFIG.BADGE_COLUMNS;
  // Auto: pick columns with ≤ 10 unique values
  return state.columns.filter(col => {
    const u = new Set(state.rawRows.map(r => r[col]).filter(v => v));
    return u.size >= 2 && u.size <= 10;
  }).slice(0, 2);
}

function renderContent() {
  renderShell();
  if (state.loading || state.error || !state.filteredRows.length) return;

  if (state.viewMode === 'card') renderCards();
  else renderTable();

  renderPagination();
}

function renderCards() {
  const rows = currentPageRows();
  const q    = state.query;
  const badgeCols = getBadgeCols();

  els.cardGrid.innerHTML = rows.map((row, i) => {
    const title = getPrimary(row);
    const rest  = state.columns.filter(c => c !== (CONFIG.PRIMARY_COLUMN || state.columns[0]));

    const badgeHTML = badgeCols
      .filter(c => row[c])
      .map(c => `<span class="badge">${highlight(row[c], q)}</span>`)
      .join('');

    const fieldsHTML = rest.slice(0, 5).map(c => `
      <div class="card-field">
        <span class="field-key">${sanitize(c)}</span>
        <span class="field-val">${highlight(row[c] || '—', q)}</span>
      </div>
    `).join('');

    return `
      <article class="data-card" role="listitem" style="animation-delay:${i * 30}ms"
               data-row-index="${state.rawRows.indexOf(row)}">
        <div class="card-header">
          <h3 class="card-title">${highlight(title, q)}</h3>
          <button class="card-copy-btn" title="Copy row data" aria-label="Copy row data"
                  data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'>⧉</button>
        </div>
        ${badgeHTML ? `<div class="card-badges">${badgeHTML}</div>` : ''}
        <div class="card-body">${fieldsHTML}</div>
      </article>
    `;
  }).join('');
}

function renderTable() {
  const rows = currentPageRows();
  const q    = state.query;
  const cols = state.columns;

  // Sticky header
  els.tableHead.innerHTML = `<tr>
    ${cols.map(c => `
      <th scope="col" class="th-sortable ${state.sortCol === c ? 'sorted' : ''}"
          data-col="${sanitize(c)}" tabindex="0" role="columnheader"
          aria-sort="${state.sortCol === c ? (state.sortAsc ? 'ascending' : 'descending') : 'none'}">
        ${sanitize(c)}
        <span class="sort-indicator" aria-hidden="true">${state.sortCol === c ? (state.sortAsc ? '↑' : '↓') : ''}</span>
      </th>
    `).join('')}
    <th scope="col">Copy</th>
  </tr>`;

  els.tableBody.innerHTML = rows.map(row => `
    <tr class="table-row">
      ${cols.map(c => `<td data-label="${sanitize(c)}">${highlight(row[c] || '—', q)}</td>`).join('')}
      <td>
        <button class="card-copy-btn table-copy" title="Copy row" aria-label="Copy row"
                data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'>⧉</button>
      </td>
    </tr>
  `).join('');

  // Sort by column header click
  els.tableHead.querySelectorAll('.th-sortable').forEach(th => {
    th.addEventListener('click',  () => handleSortByCol(th.dataset.col));
    th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleSortByCol(th.dataset.col); });
  });
}

function handleSortByCol(col) {
  if (state.sortCol === col) {
    state.sortAsc = !state.sortAsc;
  } else {
    state.sortCol = col;
    state.sortAsc = true;
  }
  els.sortSelect.value = col;
  applyFilters();
}

function renderPagination() {
  const tp = totalPages();
  els.pageInfo.textContent = `Page ${state.currentPage} of ${tp}`;
  els.prevPage.disabled = state.currentPage <= 1;
  els.nextPage.disabled = state.currentPage >= tp;
}

/* ─── Copy modal ───────────────────────────────────────────────────────────── */

function openModal(rowData) {
  els.modalPre.textContent = JSON.stringify(rowData, null, 2);
  els.copyModal.classList.remove('hidden');
  els.modalClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  els.copyModal.classList.add('hidden');
  document.body.style.overflow = '';
}

function copyModalJSON() {
  navigator.clipboard.writeText(els.modalPre.textContent)
    .then(() => showToast('Copied to clipboard!', 'success'))
    .catch(() => showToast('Copy failed', 'error'));
}

/* ─── Export CSV ───────────────────────────────────────────────────────────── */

function exportCSV() {
  if (!state.filteredRows.length) { showToast('Nothing to export', 'warn'); return; }

  const cols = state.columns;
  const header = cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
  const body = state.filteredRows.map(row =>
    cols.map(c => {
      const v = String(row[c] ?? '').replace(/"/g, '""');
      return `"${v}"`;
    }).join(',')
  ).join('\n');

  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'datasheet-export.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported ✓', 'success');
}

/* ─── Event wiring ─────────────────────────────────────────────────────────── */

// Keyboard shortcut: "/" to focus search
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== els.searchInput) {
    e.preventDefault();
    els.searchInput.focus();
  }
  if (e.key === 'Escape') closeModal();
});

// Search (debounced)
els.searchInput.addEventListener('input', debounce(e => {
  state.query = e.target.value;
  state.currentPage = 1;
  applyFilters();
}, 200));

// Sort select
els.sortSelect.addEventListener('change', () => {
  state.sortCol = els.sortSelect.value;
  applyFilters();
});

// Sort direction toggle
els.sortDir.addEventListener('click', () => {
  state.sortAsc = !state.sortAsc;
  els.sortDir.setAttribute('aria-pressed', String(!state.sortAsc));
  els.sortDir.style.transform = state.sortAsc ? 'rotate(0deg)' : 'rotate(180deg)';
  applyFilters();
});

// View toggle
els.viewCard.addEventListener('click', () => {
  state.viewMode = 'card';
  els.viewCard.classList.add('active');  els.viewCard.setAttribute('aria-pressed','true');
  els.viewTable.classList.remove('active'); els.viewTable.setAttribute('aria-pressed','false');
  renderContent();
});
els.viewTable.addEventListener('click', () => {
  state.viewMode = 'table';
  els.viewTable.classList.add('active'); els.viewTable.setAttribute('aria-pressed','true');
  els.viewCard.classList.remove('active'); els.viewCard.setAttribute('aria-pressed','false');
  renderContent();
});

// Refresh
const refreshWithSpin = () => {
  els.refreshBtn.classList.add('spinning');
  loadData(true).finally(() => {
    setTimeout(() => els.refreshBtn.classList.remove('spinning'), 600);
  });
};
els.refreshBtn.addEventListener('click', refreshWithSpin);
els.retryBtn.addEventListener('click', () => loadData(true));

// Export
els.exportBtn.addEventListener('click', exportCSV);

// Clear search
els.clearSearch.addEventListener('click', () => {
  els.searchInput.value = '';
  state.query = '';
  applyFilters();
});

// Theme toggle
applyTheme(state.theme);
els.themeToggle.addEventListener('click', () => {
  applyTheme(state.theme === 'light' ? 'dark' : 'light');
});

// Pagination
els.prevPage.addEventListener('click', () => {
  if (state.currentPage > 1) { state.currentPage--; renderContent(); window.scrollTo(0,0); }
});
els.nextPage.addEventListener('click', () => {
  if (state.currentPage < totalPages()) { state.currentPage++; renderContent(); window.scrollTo(0,0); }
});

// Delegated: copy row buttons
document.addEventListener('click', e => {
  const btn = e.target.closest('.card-copy-btn');
  if (!btn) return;
  try { openModal(JSON.parse(btn.dataset.row)); } catch (_) {}
});

// Modal controls
els.modalClose.addEventListener('click', closeModal);
els.modalBackdrop.addEventListener('click', closeModal);
els.modalCopy.addEventListener('click', copyModalJSON);

// Online/offline detection
window.addEventListener('offline', () => els.offlineBanner.classList.remove('hidden'));
window.addEventListener('online',  () => { els.offlineBanner.classList.add('hidden'); loadData(true); });

/* ─── Init ─────────────────────────────────────────────────────────────────── */
loadData();
