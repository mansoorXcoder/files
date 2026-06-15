/**
 * config.js — DataSheet Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Edit this file to point to your Google Sheet.
 *
 * TWO INTEGRATION MODES
 * ─────────────────────
 * MODE A — Published CSV (no API key needed, simplest):
 *   1. In Google Sheets → File → Share → Publish to web
 *   2. Choose "Entire document" + "Comma-separated values (.csv)"
 *   3. Copy the URL and paste it as PUBLISHED_CSV_URL below.
 *   4. Set MODE = 'csv'
 *
 * MODE B — Sheets API v4 (supports private sheets, structured JSON):
 *   1. Enable Sheets API in Google Cloud Console
 *   2. Create an API key (restrict it to Sheets API + your domain)
 *   3. Set SHEET_ID (from your sheet URL) and API_KEY below.
 *   4. Set MODE = 'api'
 *
 * SECURITY NOTE
 * ─────────────
 * • Never commit real API keys to a public repo.
 * • For GitHub Pages, use the published-CSV mode (MODE='csv') — it needs
 *   no secret at all.
 * • If you must use the Sheets API on a public site, restrict the key to
 *   your exact GitHub Pages domain in the Cloud Console.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CONFIG = Object.freeze({

  /* ── Which integration to use: 'csv' | 'api' ─────────────────────────── */
  MODE: 'csv',

  /* ── MODE A — Published CSV ─────────────────────────────────────────── */
  // Replace with YOUR published CSV URL from Google Sheets
  PUBLISHED_CSV_URL:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdRPxnCxxDgTcy7RLZU4NGYGav1qgynwYYp1QZR9AQVtpGL_BwBnnmgPH45EF12NJHEgWP9o87UadM/pub?gid=0&single=true&output=csv',

  /* ── MODE B — Sheets API v4 ─────────────────────────────────────────── */
  SHEET_ID:   'PASTE_YOUR_SHEET_ID_HERE',   // from the sheet's URL
  API_KEY:    'PASTE_YOUR_API_KEY_HERE',     // restrict to your domain!
  SHEET_NAME: 'Sheet1',                      // tab name inside the workbook
  SHEET_RANGE: 'A:Z',                        // columns to fetch

  /* ── App settings ───────────────────────────────────────────────────── */
  APP_NAME:           'DataSheet',
  APP_TAGLINE:        'Live Data Explorer',
  RECORDS_PER_PAGE:   12,

  /* How long (ms) to keep data in localStorage before a fresh fetch */
  CACHE_TTL_MS:       5 * 60 * 1000,   // 5 minutes

  /* Columns to EXCLUDE from display (case-insensitive). Leave [] to show all. */
  HIDDEN_COLUMNS:     [],

  /* Column used as the card "title" (leave '' to auto-detect first column) */
  PRIMARY_COLUMN:     '',

  /* Numeric columns for the stats dashboard (leave [] to auto-detect) */
  NUMERIC_COLUMNS:    [],

  /* Columns to show as badges/chips on cards (leave [] to auto-detect) */
  BADGE_COLUMNS:      [],

});
