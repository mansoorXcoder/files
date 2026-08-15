const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parsePDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text || '';
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file.');
    }
}

async function parseDOCX(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file.');
    }
}

async function parseDocument(file) {
    const mime = file.mimetype;
    const buffer = file.buffer;
    if (mime === 'application/pdf') {
        return await parsePDF(buffer);
    } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime === 'application/msword') {
        return await parseDOCX(buffer);
    } else if (mime === 'text/plain') {
        return buffer.toString('utf8');
    } else {
        throw new Error('Unsupported file type. Only PDF, DOCX and TXT files are supported.');
    }
}

module.exports = {
    parsePDF,
    parseDOCX,
    parseDocument
};
