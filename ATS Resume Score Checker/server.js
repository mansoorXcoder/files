const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const routes = require('./src/routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required folders exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
const historyFile = path.join(dataDir, 'history.json');
if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, '[]', 'utf8');
}

// API Routes
app.use('/api', routes);

// Serve Static Files from Frontend in production
const frontendBuildPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
} else {
    // If frontend hasn't been built yet, supply a placeholder landing page message for backend testing
    app.get('/', (req, res) => {
        res.send('TalentPulse AI Backend is running. Please run frontend using vite dev server.');
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`TalentPulse AI server running on http://localhost:${PORT}`);
    console.log(`===================================================`);
});
