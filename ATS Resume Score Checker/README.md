# ATS Resume Score Checker (TalentPulse AI)

TalentPulse AI is a production-ready, full-stack application designed to parse, evaluate, and optimize resumes against Applicant Tracking System (ATS) standard schemas and job description criteria.

## Features

- **Document Text Parser**: Automatically extracts clean, structural content from `.pdf`, `.docx`, and `.txt` resume files.
- **ATS Compliance Evaluation**: Scores resume matches according to the formal weighting schema:
  - **Skills Match (35%)** - Overlap of core technical qualifications.
  - **Keywords Check (20%)** - Match density of industry terminology.
  - **Experience Alignment (20%)** - Validation of experience duration vs requirement.
  - **Education Check (10%)** - Verification of degrees, certifications, and academic background.
  - **Formatting Score (10%)** - Checks for parsing layouts, multi-column blocks, contact structure.
  - **Spelling & Grammar (5%)** - Basic document error and spelling metric.
- **Optional Google Gemini AI Upgrade**: When a `GEMINI_API_KEY` is added to Settings or a `.env` file, the platform upgrades to use advanced NLP models for semantic matching and tailored bullet-point rewriting.
- **Scan History Tracker**: Stores previous resume evaluations locally. Includes search querying, pagination, and average score statistics.
- **PDF Report Downloads**: Uses `pdfkit` to compile the results and download a print-ready visual evaluation report.

## Tech Stack

- **Backend**: Node.js (v22), Express, Multer (file handling), PDF-Parse, Mammoth, PDFKit.
- **Frontend**: React, Vite, Tailwind CSS, Google Material Symbols.

---

## Installation & Setup

All commands below are formatted for the **Windows Command Prompt (cmd)**.

### 1. Prerequisites
Ensure you have the required runtimes installed:
- **Node.js** (v22.0.0 or higher)
- **npm** (v10.0.0 or higher)

### 2. Install Project Dependencies
Run the following command at the root of the project to install all backend packages:
```cmd
npm install
```

Next, navigate to the frontend directory and install the user interface packages:
```cmd
cd frontend
npm install
```

### 3. Optional: Configure Gemini API Key
Create a `.env` file at the root of the project to enable advanced AI-driven recommendations:
```cmd
echo GEMINI_API_KEY=your_gemini_api_key_here > .env
```
*(Alternatively, you can copy-paste your API key directly in the application's **Settings** tab in the browser, which saves it to browser storage).*

---

## Running the Application

You can run the application in either Production mode or Development mode.

### Production Mode (Recommended)
This runs both the frontend and backend on a single server port (**http://localhost:5000**):

1. Compile the React frontend:
   ```cmd
   cd frontend
   npm run build
   cd ..
   ```
2. Start the Express server:
   ```cmd
   npm start
   ```
3. Open your browser and navigate to: **`http://localhost:5000`**

### Development Mode
Runs the Express backend and the Vite React frontend with Hot Module Replacement (HMR) active:

1. In one command prompt, start the backend API:
   ```cmd
   npm run server
   ```
   *(Server starts on `http://localhost:5000`)*
2. In a second command prompt, start the Vite client:
   ```cmd
   cd frontend
   npm run dev
   ```
   *(Vite serves the client on `http://localhost:5173` and proxies API requests to port `5000`)*
3. Open your browser and navigate to: **`http://localhost:5173`**
