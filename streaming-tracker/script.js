/**
 * BingeForge - Premium Streaming Tracker Frontend Controller
 * ----------------------------------------------------------------------
 * Manages fetching library data, filtering, searching, dynamic rendering,
 * and user preference state (dark/light theme).
 */

// Configuration Constants
const CONFIG = {
  GOOGLE_FORM_URL: "https://forms.gle/95vf1Vdt8HuENiLU9", // User's customized Google Form link
  DATA_SOURCE_URL: "data/library.json",        // Modular path to library JSON database
  FALLBACK_COVERS: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop", // Cinema projector
    "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400&auto=format&fit=crop", // Movie reel
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop"  // Cinematic lights
  ]
};

// Application State
let libraryData = [];
let activeFilters = {
  search: "",
  status: "all",
  type: "all"
};

// DOM Elements
const DOM = {
  grid: document.getElementById("library-grid"),
  emptyState: document.getElementById("empty-state"),
  searchInput: document.getElementById("search-input"),
  searchClear: document.getElementById("search-clear"),
  resetFiltersBtn: document.getElementById("reset-filters-btn"),
  statusFilters: document.getElementById("status-filters"),
  typeFilters: document.getElementById("type-filters"),
  statTotal: document.getElementById("stat-total"),
  statFiltered: document.getElementById("stat-filtered"),
  themeToggle: document.getElementById("theme-toggle"),
  heroViewBtn: document.getElementById("hero-view-btn"),
  headerAddBtn: document.getElementById("header-add-btn"),
  heroAddBtn: document.getElementById("hero-add-btn")
};

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Setup Google Form link dynamically
  if (DOM.headerAddBtn) DOM.headerAddBtn.href = CONFIG.GOOGLE_FORM_URL;
  if (DOM.heroAddBtn) DOM.heroAddBtn.href = CONFIG.GOOGLE_FORM_URL;

  // Load User Theme Preference
  initTheme();

  // Load Library Data
  loadLibraryData();

  // Bind UI Events
  bindEvents();
});

// ==========================================================================
// THEME SWITCHING (PERSISTENT & SYSTEM-AWARE)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("bingeforge-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  
  if (savedTheme === "light" || (!savedTheme && prefersLight)) {
    document.body.classList.add("light-theme");
    updateThemeIcon(true);
  } else {
    document.body.classList.remove("light-theme");
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("bingeforge-theme", isLight ? "light" : "dark");
  updateThemeIcon(isLight);
}

function updateThemeIcon(isLight) {
  if (DOM.themeToggle) {
    const iconSpan = DOM.themeToggle.querySelector(".material-symbols-outlined");
    if (iconSpan) {
      iconSpan.textContent = isLight ? "light_mode" : "dark_mode";
    }
  }
}

// ==========================================================================
// DATA LOADING
// ==========================================================================
async function loadLibraryData() {
  try {
    const response = await fetch(CONFIG.DATA_SOURCE_URL);
    if (!response.ok) {
      throw new Error(`Failed to load data. Status: ${response.status}`);
    }
    libraryData = await response.json();
    
    // Update total stats
    if (DOM.statTotal) DOM.statTotal.textContent = libraryData.length;
    
    // Initial Render
    filterAndRender();
  } catch (error) {
    console.error("Error fetching library data:", error);
    renderErrorMessage();
  }
}

function renderErrorMessage() {
  if (DOM.grid) {
    DOM.grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <span class="material-symbols-outlined empty-icon" style="color: var(--primary-accent);">error</span>
        <h3>Failed to Load Database</h3>
        <p>Ensure data/library.json exists and contains correct formatting.</p>
      </div>
    `;
  }
}

// ==========================================================================
// RENDER ENGINE
// ==========================================================================
function filterAndRender() {
  // Apply Multi-filtering logic
  const filteredData = libraryData.filter(item => {
    // Search Query Match (Title, Language, Notes)
    const matchesSearch = activeFilters.search === "" || 
      item.title.toLowerCase().includes(activeFilters.search) ||
      (item.language && item.language.toLowerCase().includes(activeFilters.search)) ||
      (item.notes && item.notes.toLowerCase().includes(activeFilters.search));

    // Status Match
    const matchesStatus = activeFilters.status === "all" || 
      item.status.toLowerCase() === activeFilters.status.toLowerCase();

    // Type Match
    const matchesType = activeFilters.type === "all" || 
      item.type.toLowerCase() === activeFilters.type.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Update statistics
  if (DOM.statFiltered) DOM.statFiltered.textContent = filteredData.length;

  // Render cards or show empty state
  if (filteredData.length === 0) {
    if (DOM.grid) DOM.grid.style.display = "none";
    if (DOM.emptyState) DOM.emptyState.style.display = "block";
  } else {
    if (DOM.grid) {
      DOM.grid.style.display = "grid";
      DOM.grid.innerHTML = "";
      
      filteredData.forEach(item => {
        DOM.grid.appendChild(createStreamingCard(item));
      });
    }
    if (DOM.emptyState) DOM.emptyState.style.display = "none";
  }
}

function createStreamingCard(item) {
  const card = document.createElement("article");
  card.className = "streaming-card";

  // Poster Image Fallback Handler
  let posterHTML = "";
  if (item.poster && item.poster.trim() !== "" && !item.poster.startsWith("https://via.placeholder.com")) {
    posterHTML = `<img src="${item.poster}" alt="${item.title} Poster" class="poster-img" loading="lazy" onerror="handlePosterError(this, '${item.title}', '${item.type}')">`;
  } else {
    // Elegant fallback UI container
    posterHTML = createPosterFallbackUI(item.title, item.type);
  }

  // Format Notes
  const cleanNotes = item.notes ? item.notes.trim() : "No review notes added yet.";

  card.innerHTML = `
    <div class="poster-container">
      ${posterHTML}
      <div class="card-badges">
        <span class="badge badge-type">${item.type}</span>
        <span class="badge badge-status" data-status="${item.status}">${item.status}</span>
      </div>
      ${item.language ? `<span class="language-tag">${item.language}</span>` : ""}
      
      <div class="card-overlay">
        <div class="overlay-notes-label">Review &amp; Notes</div>
        <div class="overlay-notes-text">${cleanNotes}</div>
      </div>
    </div>
    <div class="card-content">
      <h2 class="card-title" title="${item.title}">${item.title}</h2>
      <p class="card-brief-notes">${cleanNotes}</p>
    </div>
  `;

  return card;
}

function createPosterFallbackUI(title, type) {
  // Grab a random cinematic graphic placeholder from our fallback collection based on character codes
  const fallbackIndex = title.charCodeAt(0) % CONFIG.FALLBACK_COVERS.length;
  const fallbackUrl = CONFIG.FALLBACK_COVERS[fallbackIndex];

  // Return a gorgeous overlay layout containing the title
  return `
    <div class="poster-fallback">
      <span class="material-symbols-outlined fallback-icon">
        ${type.toLowerCase() === 'movie' ? 'movie' : type.toLowerCase() === 'anime' ? 'animation' : 'tv'}
      </span>
      <div class="fallback-title">${title}</div>
    </div>
  `;
}

// Global scope onerror handler to swap out broken remote images gracefully
window.handlePosterError = function(imgElement, title, type) {
  const container = imgElement.parentElement;
  if (container) {
    container.innerHTML = createPosterFallbackUI(title, type) + 
      container.querySelector(".card-badges").outerHTML +
      (container.querySelector(".language-tag") ? container.querySelector(".language-tag").outerHTML : "") +
      container.querySelector(".card-overlay").outerHTML;
  }
};

// ==========================================================================
// INTERACTIVE ACTIONS & FILTER EVENTS
// ==========================================================================
function bindEvents() {
  // Theme button
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener("click", toggleTheme);
  }

  // Hero smooth scroll button
  if (DOM.heroViewBtn) {
    DOM.heroViewBtn.addEventListener("click", () => {
      const librarySection = document.getElementById("library");
      if (librarySection) {
        librarySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Live search input
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener("input", (e) => {
      activeFilters.search = e.target.value.toLowerCase().trim();
      
      // Toggle search clear button
      if (DOM.searchClear) {
        DOM.searchClear.style.display = activeFilters.search.length > 0 ? "block" : "none";
      }
      
      filterAndRender();
    });
  }

  // Search clear click
  if (DOM.searchClear) {
    DOM.searchClear.addEventListener("click", () => {
      if (DOM.searchInput) {
        DOM.searchInput.value = "";
        activeFilters.search = "";
        DOM.searchClear.style.display = "none";
        filterAndRender();
        DOM.searchInput.focus();
      }
    });
  }

  // Status pills click
  if (DOM.statusFilters) {
    DOM.statusFilters.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;

      // Update active styling
      DOM.statusFilters.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      // Update filtering state
      activeFilters.status = pill.getAttribute("data-status");
      filterAndRender();
    });
  }

  // Type pills click
  if (DOM.typeFilters) {
    DOM.typeFilters.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;

      // Update active styling
      DOM.typeFilters.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      // Update filtering state
      activeFilters.type = pill.getAttribute("data-type");
      filterAndRender();
    });
  }

  // Empty State Reset button
  if (DOM.resetFiltersBtn) {
    DOM.resetFiltersBtn.addEventListener("click", resetAllFilters);
  }
}

function resetAllFilters() {
  activeFilters = {
    search: "",
    status: "all",
    type: "all"
  };

  // Reset UI inputs
  if (DOM.searchInput) DOM.searchInput.value = "";
  if (DOM.searchClear) DOM.searchClear.style.display = "none";

  // Reset Pills
  if (DOM.statusFilters) {
    DOM.statusFilters.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    const allPill = DOM.statusFilters.querySelector('[data-status="all"]');
    if (allPill) allPill.classList.add("active");
  }

  if (DOM.typeFilters) {
    DOM.typeFilters.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    const allPill = DOM.typeFilters.querySelector('[data-type="all"]');
    if (allPill) allPill.classList.add("active");
  }

  filterAndRender();
}
