/**
 * Application Configuration
 * Customise this file to link your Google Sheet and change default settings.
 */
const CONFIG = {
  // Data Source Settings
  dataSource: {
    // Mode: 'csv' (Recommended: published as CSV) or 'api' (Google Sheets API v4)
    mode: 'csv',

    // If mode is 'csv', paste your "Publish to the web" CSV Link here.
    // Example: https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?output=csv
    // If empty, the app will automatically try to build the CSV URL using your sheetId below.
    csvUrl: '',

    // Google Sheet ID (Found in the Google Sheet URL between /d/ and /edit)
    sheetId: '12S0h-E9d0k2gYQnL9C9vP-Q-0B_HnUeT54zD3W2Bwko', // Placeholder/Example Sheet ID

    // If using 'api' mode:
    apiKey: '', // DO NOT commit sensitive keys to public repositories!
    range: 'Sheet1!A1:Z100', // Range of data to fetch (API mode only)
    
    // Fallback tab name for CSV mode if needed
    gid: '0'
  },

  // App Behavior Settings
  settings: {
    title: 'DataSphere Dashboard',
    description: 'Real-time analytics and inventory directory powered by Google Sheets.',
    pageSize: 8,              // Number of cards to display per page
    cacheTTL: 300,            // Cache time-to-live in seconds (5 minutes)
    enablePWA: true,          // Enable service worker caching and installability
  },

  // Mock Data: Used as an immediate visual fallback if the Google Sheet cannot be fetched,
  // or before you link your own Google Sheet.
  mockData: [
    {
      "ID": "PROD-001",
      "Name": "Quantum Soundbar Pro",
      "Category": "Audio",
      "Price": 249.99,
      "Stock": 45,
      "Rating": 4.8,
      "Status": "In Stock",
      "Description": "Next-generation spatial audio soundbar with Dolby Atmos and smart assistant integration.",
      "Last Updated": "2026-06-01"
    },
    {
      "ID": "PROD-002",
      "Name": "Apex Curved Monitor 34\"",
      "Category": "Computers",
      "Price": 599.99,
      "Stock": 12,
      "Rating": 4.6,
      "Status": "Low Stock",
      "Description": "Ultra-wide QHD display with 144Hz refresh rate, HDR400, and ergonomic stand.",
      "Last Updated": "2026-06-03"
    },
    {
      "ID": "PROD-003",
      "Name": "Lumix Ambient Smart Light",
      "Category": "Smart Home",
      "Price": 45.50,
      "Stock": 120,
      "Rating": 4.2,
      "Status": "In Stock",
      "Description": "RGB color-sync ambient lighting with mobile app control and scheduling.",
      "Last Updated": "2026-05-28"
    },
    {
      "ID": "PROD-004",
      "Name": "Zenith Noise Cancelling Headphones",
      "Category": "Audio",
      "Price": 189.00,
      "Stock": 8,
      "Rating": 4.9,
      "Status": "Low Stock",
      "Description": "Active noise cancelling over-ear headphones with 40-hour battery life and quick charge.",
      "Last Updated": "2026-06-04"
    },
    {
      "ID": "PROD-005",
      "Name": "Vector Mechanical Keyboard",
      "Category": "Computers",
      "Price": 129.99,
      "Stock": 0,
      "Rating": 4.7,
      "Status": "Out of Stock",
      "Description": "Hot-swappable tactile switches with aluminum frame and custom dynamic RGB backlighting.",
      "Last Updated": "2026-05-15"
    },
    {
      "ID": "PROD-006",
      "Name": "Aura Smart Thermostat",
      "Category": "Smart Home",
      "Price": 179.99,
      "Stock": 35,
      "Rating": 4.5,
      "Status": "In Stock",
      "Description": "Energy-saving learning thermostat with occupancy sensors and heating automation.",
      "Last Updated": "2026-06-02"
    },
    {
      "ID": "PROD-007",
      "Name": "Helios Portable Solar Charger",
      "Category": "Outdoors",
      "Price": 89.00,
      "Stock": 60,
      "Rating": 4.4,
      "Status": "In Stock",
      "Description": "High-efficiency solar cells with dual USB ports and rugged IP65 water-resistant casing.",
      "Last Updated": "2026-05-20"
    },
    {
      "ID": "PROD-008",
      "Name": "Titan Solid State Drive 2TB",
      "Category": "Computers",
      "Price": 149.50,
      "Stock": 80,
      "Rating": 4.8,
      "Status": "In Stock",
      "Description": "NVMe M.2 SSD with write speeds up to 5000MB/s and thermal throttling protection.",
      "Last Updated": "2026-06-04"
    },
    {
      "ID": "PROD-009",
      "Name": "Omni Fit Smartwatch",
      "Category": "Wearables",
      "Price": 215.00,
      "Stock": 15,
      "Rating": 4.3,
      "Status": "In Stock",
      "Description": "Heart rate monitor, GPS, sleep tracking, and custom watch faces with 7-day battery life.",
      "Last Updated": "2026-06-05"
    },
    {
      "ID": "PROD-010",
      "Name": "GigaRouter WiFi 6E",
      "Category": "Computers",
      "Price": 199.99,
      "Stock": 0,
      "Rating": 4.1,
      "Status": "Out of Stock",
      "Description": "Tri-band wireless router covering up to 3000 sq ft, designed for low latency gaming.",
      "Last Updated": "2026-05-29"
    }
  ]
};

// Export CONFIG to global window context so it can be accessed in other scripts
window.CONFIG = CONFIG;
