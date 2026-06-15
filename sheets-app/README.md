# DataSheet — Live Google Sheets Data Viewer

A production-ready, modern web application that fetches and displays data from a Google Sheet in real time. Hostable on GitHub Pages with zero backend required.

---

## Features

- **Live data** from Google Sheets (CSV or Sheets API v4)
- **Real-time search** across all columns with highlighted results
- **Column filters** — auto-detected low-cardinality columns
- **Sort** by any column (ascending / descending)
- **Card & Table view** toggle
- **Light / Dark mode** with localStorage persistence
- **Export to CSV** — filtered results
- **Copy row data** as JSON
- **Animated stats dashboard**
- **Skeleton loaders** + empty/error states
- **PWA support** — installable, offline fallback
- **Responsive** — mobile + desktop
- **Accessible** — ARIA roles, keyboard navigation (`/` shortcut)
- **XSS-safe** — all data sanitised before render
- **Smart cache** — 5-minute localStorage cache with stale fallback

---

## Project Structure

```
sheets-app/
├── index.html          # Main HTML (single page)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline support)
├── css/
│   └── style.css       # All styles (light + dark, responsive)
├── js/
│   ├── config.js       # ← EDIT THIS — Sheet URL / API key / options
│   └── app.js          # Core application logic
├── icons/
│   ├── icon-192.png    # PWA icon (add your own)
│   └── icon-512.png    # PWA icon (add your own)
└── README.md
```

---

## Quick Start

### Step 1 — Set up your Google Sheet

**Option A — Published CSV (recommended for public sheets, no API key needed)**

1. Open your Google Sheet.
2. Go to **File → Share → Publish to web**.
3. Select **Entire document** and format **Comma-separated values (.csv)**.
4. Click **Publish** and copy the URL (looks like `https://docs.google.com/spreadsheets/d/e/LONG_ID/pub?output=csv`).
5. Open `js/config.js` and:
   - Set `MODE: 'csv'`
   - Paste the URL into `PUBLISHED_CSV_URL`

**Option B — Sheets API v4 (for private sheets or structured JSON)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Sheets API**.
3. Create an **API key** (Credentials → Create Credentials → API key).
4. **Restrict the key**: Application restrictions → HTTP referrers → add your GitHub Pages domain (`https://yourusername.github.io/*`).
5. Open `js/config.js` and:
   - Set `MODE: 'api'`
   - Set `SHEET_ID` (the long ID in your sheet URL)
   - Set `API_KEY`
   - Set `SHEET_NAME` (tab name, e.g. `Sheet1`)

### Step 2 — Configure `js/config.js`

```js
const CONFIG = Object.freeze({
  MODE: 'csv',  // or 'api'
  PUBLISHED_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/YOUR_ID/pub?output=csv',

  // Optional customisation
  RECORDS_PER_PAGE: 12,
  HIDDEN_COLUMNS:   [],          // e.g. ['InternalID', 'Password']
  PRIMARY_COLUMN:   '',          // card title column (auto = first column)
  NUMERIC_COLUMNS:  [],          // for stats dashboard (auto-detected if empty)
  BADGE_COLUMNS:    [],          // chip badges on cards (auto-detected if empty)
});
```

### Step 3 — Test locally

Open `index.html` in a browser (or use a local server):

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## Deploying to GitHub Pages

### Method A — Direct push (simplest)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then in your repo on GitHub:
- Go to **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Click **Save**

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Method B — GitHub Actions (auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
```

---

## Data Updates

The app automatically fetches the latest data from Google Sheets **every time the page loads**.

- A **5-minute cache** prevents unnecessary refetches within the same session.
- Use the **Refresh button** (↺) in the header to force an immediate update.
- If the network fails, the last cached data is shown with a warning toast.
- The **"Updated HH:MM · Mon DD"** timestamp shows when data was last fetched.

---

## Customisation

### Change records per page
```js
RECORDS_PER_PAGE: 24,
```

### Hide columns from display
```js
HIDDEN_COLUMNS: ['Password', 'InternalNotes'],
```

### Choose which column appears as the card title
```js
PRIMARY_COLUMN: 'Product Name',
```

### Force specific numeric columns for stats dashboard
```js
NUMERIC_COLUMNS: ['Price', 'Stock', 'Rating'],
```

### Force specific badge columns on cards
```js
BADGE_COLUMNS: ['Status', 'Category'],
```

---

## Security

| Risk | Mitigation |
|------|-----------|
| XSS via sheet data | All values passed through `sanitize()` (textContent → innerHTML) before render |
| API key exposure | Use published CSV (no key) or restrict API key to your exact domain |
| Sensitive columns | Use `HIDDEN_COLUMNS` to prevent them rendering |
| Stale data shown | Toast warning shown; timestamp visible to user |
| OWASP A03 Injection | No `eval`, no `innerHTML` with raw data, no dynamic `<script>` injection |

**Never commit a real API key to a public repository.**
For GitHub Pages, always prefer `MODE: 'csv'` (no secret needed).

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome / Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Mobile (iOS/Android) | ✅ Full |
| IE 11 | ❌ Not supported |

---

## PWA Icons

Replace the placeholder icons in `/icons/`:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

You can generate them at [maskable.app](https://maskable.app/editor) or [realfavicongenerator.net](https://realfavicongenerator.net/).

---

## License

MIT — free to use, modify, and distribute.
