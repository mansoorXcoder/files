# DataSphere Sheets Dashboard

A premium, framework-less, modern web application that displays structured data from a Google Sheet. It works out-of-the-box using built-in mock data, and automatically fetches, caches, and syncs data from a Google Sheet once configured.

Perfect for portfolios, inventory directories, task boards, or live catalog displays, and ready to be hosted for free on **GitHub Pages**.

---

## 🌟 Features

*   **Framework-Free & Light:** Built with standard HTML5, custom CSS3 variables, and Vanilla ES6 JavaScript. No build steps required.
*   **Black & White Toggle (Light/Dark Mode):** Minimalist aesthetics. Saves your preferred color theme in `localStorage` for returning visits.
*   **Dynamic Column Filters:** Automatically scans your Google Sheet columns and draws select-dropdowns for categorical columns.
*   **Fuzzy Search & Highlighting:** Real-time text search across all attributes, with dynamic yellow match highlighting inside card values.
*   **Animated Statistics Dashboard:** Scans spreadsheet columns, automatically extracts numeric columns (like Price, Quantity, Rating), calculates stats (Averages, Max/Min, Out-of-Stock), and displays counters that count up with smooth CSS micro-animations.
*   **Clipboard & CSV Exports:** One-click copy row data as text/JSON, or compile all active/filtered rows to download as a structured CSV file.
*   **Service Worker PWA Capabilities:** Offline mode, local cache fallbacks, custom floating update toasts, and installable as a native app on mobile or desktop devices.
*   **Secure & Robust:** Client-side XSS sanitization checks on all text fields. Local cache TTL limits Sheet API load and prevents request throttle rates.

---

## 📂 Project Structure

```text
├── index.html          # Main HTML web layout containing structure shells and scripts
├── manifest.json       # Progressive Web App metadata for system installation
├── sw.js               # Service Worker for local caching and offline fallbacks
├── offline.html        # Fallback offline web page
├── css/
│   └── styles.css      # Core styles, dark/light themes variables, grids, and skeletons
└── js/
    ├── config.js       # App properties, Sheet IDs, API preferences, and Mock Data
    ├── api.js          # Core fetching utilities, CSV parser, cache layers, and XSS cleaning
    ├── app.js          # Orchestrator managing search, sorting, dashboard, and templates
    └── pwa.js          # Registers PWA capabilities and handles connectivity status events
```

---

## ⚙️ Google Sheets Integration Setup

We offer **two ways** to connect the dashboard to your Google Sheet. **Method A is highly recommended.**

### Method A: Published Google Sheet as CSV (Recommended & Default)
This is the easiest and most secure method because it doesn't expose any API keys, has no Google API quota limits, and is cached via Google's CDN.

1.  Open your Google Sheet.
2.  Click **File** -> **Share** -> **Publish to web**.
3.  In the link tab, select **Entire Document** (or a specific sheet tab name) and select **Comma-separated values (.csv)** instead of Web Page.
4.  Click **Publish** and copy the generated link.
5.  Open `js/config.js` and edit the `dataSource` configuration block:
    ```javascript
    dataSource: {
      mode: 'csv',
      csvUrl: 'PASTE_YOUR_COPIED_PUBLISHED_CSV_LINK_HERE',
      sheetId: '', // leave empty
      apiKey: ''   // leave empty
    }
    ```
    *Alternative:* If you leave `csvUrl` blank, you can just paste your Sheet ID (found in the browser URL between `/d/` and `/edit`) into `sheetId` and the app will automatically construct the published URL.

---

### Method B: Google Sheets API v4 (JSON Mode)
Choose this method if you cannot publish the sheet publicly to the web. However, note that frontend keys can be inspected by visitors.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project, search for the **Google Sheets API**, and click **Enable**.
3.  Go to the **Credentials** tab, click **Create Credentials** -> **API Key**.
4.  **Important Security Step:** Click edit on the new API key, under **API Restrictions**, choose **Restrict key**, and select **Google Sheets API**. Additionally, under **Application restrictions**, set it to **HTTP referrers (websites)** and add your GitHub Pages URL to prevent unauthorized domains from using your key.
5.  Share your Google Sheet: Ensure the sheet is set to **"Anyone with link can view"** (this is necessary since client-side calls cannot pass OAuth credentials securely).
6.  Open `js/config.js` and set:
    ```javascript
    dataSource: {
      mode: 'api',
      csvUrl: '',
      sheetId: 'YOUR_GOOGLE_SHEETS_ID',
      apiKey: 'YOUR_RESTRICTED_GOOGLE_API_KEY',
      range: 'Sheet1!A1:Z100' // edit matching your sheet tab name and cell range
    }
    ```

---

## 🚀 Local Development and Running

Due to browser security policies, **Service Workers (PWAs) and fetch requests will not work if you open `index.html` directly as a file (`file://`)**. You must run it through a local web server.

### Option 1: Using Node.js (npx)
If you have Node.js installed, open a command line inside the project folder and run:
```bash
npx http-server ./
```
Then visit the output address in your browser (usually `http://127.0.0.1:8080`).

### Option 2: Using Python
If you have Python installed, open terminal/command prompt inside the project folder and run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

---

## 🌐 Deploying to GitHub Pages

1.  Create a public repository on GitHub (e.g., `sheets-dashboard`).
2.  Commit and push your project files directly to the `main` branch.
3.  In your GitHub repository, go to **Settings** -> **Pages** (under the Code and automation section).
4.  Under **Build and deployment**, select **Deploy from a branch**.
5.  Choose your branch (`main`) and folder (`/ (root)`), then click **Save**.
6.  Wait a few minutes. GitHub will provide a live link (e.g. `https://yourusername.github.io/sheets-dashboard/`).

---

## 🔒 Security Best Practices

1.  **Exposed Keys:** Never upload configuration files containing unrestricted or admin-access API keys to GitHub.
2.  **Referrer Restriction:** If using API Mode, always enforce HTTP Referrer limits in the Google Cloud Console so the key is rejected if loaded outside your repository's domain.
3.  **Sanitization:** The application uses `API.sanitizeData()` to replace dangerous characters (`<`, `>`, `&`, `"`, `'`) with safe HTML entities before inserting values into the DOM. This protects users from Cross-Site Scripting (XSS) in case spreadsheet editors insert scripts in cells.
4.  **Spreadsheet Sharing:** When using Method A, remember that anyone with the link can view your raw spreadsheet data. Do not store passwords, tokens, or personal identity numbers (PII) on a sheet linked to a public dashboard.
