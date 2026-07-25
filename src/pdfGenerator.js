const PDFDocument = require('pdfkit');

function generatePdfReport(reportData, outStream) {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(outStream);

    // Color Palette
    const primaryColor = '#0F172A'; // Deep Navy
    const secondaryColor = '#3B82F6'; // Electric Blue
    const greenColor = '#10B981'; // Success Emerald
    const redColor = '#EF4444'; // Error Ruby
    const grayColor = '#64748B'; // Slate Gray
    const lightGray = '#F1F5F9'; // Slate 100
    const lightBlue = '#EFF6FF'; // Blue 50

    // Header
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(24)
       .text('TalentPulse AI', 50, 50);
       
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(grayColor)
       .text('ATS RESUME OPTIMIZATION REPORT', 50, 80);

    doc.moveTo(50, 95).lineTo(550, 95).strokeColor('#E2E8F0').stroke();

    // ATS Score Circle
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(16)
       .text('Overall ATS Score', 50, 120);

    const score = reportData.score;
    let scoreColor = grayColor;
    if (score >= 80) scoreColor = greenColor;
    else if (score >= 50) scoreColor = secondaryColor;
    else scoreColor = redColor;

    // Draw score circle background
    doc.circle(130, 200, 50)
       .fill(lightGray);

    doc.circle(130, 200, 50)
       .lineWidth(6)
       .strokeColor(scoreColor)
       .stroke();

    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(28)
       .text(`${score}`, 110, 185, { width: 40, align: 'center' });

    doc.fontSize(8)
       .fillColor(grayColor)
       .text('OUT OF 100', 110, 215, { width: 40, align: 'center' });

    // Section Scores
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Section Breakdown', 220, 120);

    const sections = [
        { label: 'Skill Match (35%)', val: reportData.sectionScores.skills, max: 35 },
        { label: 'Keywords (20%)', val: reportData.sectionScores.keywords, max: 20 },
        { label: 'Experience (20%)', val: reportData.sectionScores.experience, max: 20 },
        { label: 'Education (10%)', val: reportData.sectionScores.education, max: 10 },
        { label: 'Formatting (10%)', val: reportData.sectionScores.formatting, max: 10 },
        { label: 'Grammar (5%)', val: reportData.sectionScores.grammar, max: 5 }
    ];

    let startY = 145;
    sections.forEach(sec => {
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(9)
           .text(sec.label, 220, startY);

        doc.fillColor(grayColor)
           .font('Helvetica')
           .text(`${sec.val}/${sec.max}`, 480, startY, { align: 'right', width: 70 });

        // Bar Chart
        doc.rect(220, startY + 12, 330, 8)
           .fill(lightGray);

        const fillWidth = (sec.val / sec.max) * 330;
        doc.rect(220, startY + 12, fillWidth, 8)
           .fill(secondaryColor);

        startY += 30;
    });

    doc.moveTo(50, 340).lineTo(550, 340).strokeColor('#E2E8F0').stroke();

    // Skill Gap Analysis
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Skill Gap Analysis', 50, 360);

    doc.fontSize(10)
       .fillColor(greenColor)
       .font('Helvetica-Bold')
       .text('Matched Skills', 50, 385);

    let matchX = 50;
    let matchY = 405;
    reportData.skillsAnalysis.matched.forEach((skill, idx) => {
        if (matchX > 250) {
            matchX = 50;
            matchY += 20;
        }
        doc.rect(matchX, matchY, 80, 16).fill('#ECFDF5');
        doc.fillColor('#065F46')
           .font('Helvetica')
           .fontSize(8)
           .text(skill, matchX + 5, matchY + 4, { width: 70, align: 'center' });
        matchX += 90;
    });

    doc.fontSize(10)
       .fillColor(redColor)
       .font('Helvetica-Bold')
       .text('Missing Critical Skills', 300, 385);

    let missX = 300;
    let missY = 405;
    reportData.skillsAnalysis.missing.forEach((skill, idx) => {
        if (missX > 500) {
            missX = 300;
            missY += 20;
        }
        doc.rect(missX, missY, 80, 16).fill('#FEF2F2');
        doc.fillColor('#991B1B')
           .font('Helvetica')
           .fontSize(8)
           .text(skill, missX + 5, missY + 4, { width: 70, align: 'center' });
        missX += 90;
    });

    doc.moveTo(50, 480).lineTo(550, 480).strokeColor('#E2E8F0').stroke();

    // AI Suggestions
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('AI-Driven Recommendations', 50, 500);

    let sugY = 525;
    reportData.aiSuggestions.forEach((sug, idx) => {
        doc.rect(50, sugY, 35, 18).fill('#EFF6FF');
        doc.fillColor('#1E40AF')
           .font('Helvetica-Bold')
           .fontSize(9)
           .text(sug.priority, 50, sugY + 4, { width: 35, align: 'center' });

        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(10)
           .text(sug.title, 95, sugY);

        doc.fillColor(grayColor)
           .font('Helvetica')
           .fontSize(9)
           .text(sug.description, 95, sugY + 14, { width: 450 });

        sugY += 45;
    });

    // Document Integrity Check
    if (sugY > 680) {
        doc.addPage();
        sugY = 50;
    }

    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Document Integrity Check', 50, sugY + 20);

    const integrityItems = [
        { label: 'Standard Font Usage', status: reportData.integrityCheck.fontUsage },
        { label: 'Section Headers Detected', status: reportData.integrityCheck.sectionHeaders },
        { label: 'Two-Column Layout Check', status: reportData.integrityCheck.layoutCheck },
        { label: 'Contact Info Present', status: reportData.integrityCheck.contactInfo },
        { label: 'Spelling & Grammar', status: reportData.integrityCheck.spellingGrammar }
    ];

    let integrityY = sugY + 45;
    integrityItems.forEach(item => {
        doc.fillColor(primaryColor)
           .font('Helvetica')
           .fontSize(10)
           .text(item.label, 50, integrityY);

        let statusColor = greenColor;
        if (item.status !== 'Passed') {
            statusColor = item.status.includes('Issues') || item.status.includes('Missing') ? redColor : secondaryColor;
        }

        doc.fillColor(statusColor)
           .font('Helvetica-Bold')
           .text(item.status, 400, integrityY, { align: 'right', width: 150 });

        integrityY += 20;
    });

    // Footer
    doc.fontSize(8)
       .fillColor(grayColor)
       .text('Generated by TalentPulse AI - Private & Confidential', 50, 750, { align: 'center', width: 500 });

    doc.end();
}

module.exports = {
    generatePdfReport
};
