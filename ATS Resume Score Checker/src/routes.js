const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseDocument } = require('./parser');
const { analyzeResume } = require('./analyzer');
const { generatePdfReport } = require('./pdfGenerator');

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const HISTORY_PATH = path.join(__dirname, '..', 'data', 'history.json');

// Helper to read history
function readHistory() {
    try {
        if (!fs.existsSync(HISTORY_PATH)) {
            return [];
        }
        const data = fs.readFileSync(HISTORY_PATH, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
}

// Helper to write history
function writeHistory(history) {
    try {
        fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing history:', error);
    }
}

// Endpoint: Analyze Resume
router.post('/analyze', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'jdFile', maxCount: 1 }]), async (req, res) => {
    try {
        const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
        const jdFile = req.files && req.files['jdFile'] ? req.files['jdFile'][0] : null;
        let jdText = req.body.jdText || '';
        const apiKey = req.body.apiKey || null;
        const targetJob = req.body.targetJob || 'Software Engineer';
        const targetCompany = req.body.targetCompany || 'TalentPulse AI Partner';

        if (!resumeFile) {
            return res.status(400).json({ error: 'Resume file is required.' });
        }

        // Parse Resume
        const resumeText = await parseDocument(resumeFile);

        // Parse JD file if uploaded, otherwise use jdText
        if (jdFile) {
            jdText = await parseDocument(jdFile);
        }

        if (!jdText.trim()) {
            return res.status(400).json({ error: 'Job description text or file is required.' });
        }

        // Analyze
        const analysisResult = await analyzeResume(resumeText, jdText, apiKey);

        // Save to History
        const history = readHistory();
        const newRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            filename: resumeFile.originalname,
            targetJob,
            targetCompany,
            score: analysisResult.score,
            sectionScores: analysisResult.sectionScores,
            skillsAnalysis: analysisResult.skillsAnalysis,
            aiSuggestions: analysisResult.aiSuggestions,
            integrityCheck: analysisResult.integrityCheck,
            resumeTextSnippet: resumeText.slice(0, 1000), // Save small snippet
            jdTextSnippet: jdText.slice(0, 1000)
        };

        history.unshift(newRecord);
        writeHistory(history);

        res.status(200).json(newRecord);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
    }
});

// Endpoint: Fetch History
router.get('/history', (req, res) => {
    try {
        const history = readHistory();
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve history.' });
    }
});

// Endpoint: Retrieve Specific Report
router.get('/report/:id', (req, res) => {
    try {
        const history = readHistory();
        const record = history.find(r => r.id === req.params.id);
        if (!record) {
            return res.status(404).json({ error: 'Report not found.' });
        }
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve report.' });
    }
});

// Endpoint: Delete Report
router.delete('/report/:id', (req, res) => {
    try {
        let history = readHistory();
        const index = history.findIndex(r => r.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Report not found.' });
        }
        history.splice(index, 1);
        writeHistory(history);
        res.status(200).json({ success: true, message: 'Report deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete report.' });
    }
});

// Endpoint: Download PDF Report
router.get('/report/:id/download', (req, res) => {
    try {
        const history = readHistory();
        const record = history.find(r => r.id === req.params.id);
        if (!record) {
            return res.status(404).send('Report not found.');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ATS_Report_${record.id}.pdf`);

        generatePdfReport(record, res);
    } catch (error) {
        console.error('PDF Download Error:', error);
        res.status(500).send('Failed to generate PDF report.');
    }
});

module.exports = router;
