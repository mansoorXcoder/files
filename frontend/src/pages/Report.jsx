import React, { useEffect, useState } from 'react';

export default function Report({ reportId, setCurrentPage }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [shareText, setShareText] = useState('Share Results');

  useEffect(() => {
    if (!reportId) {
      setErrorMsg('No report ID provided.');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report/${reportId}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve the analysis report.');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleShare = () => {
    const url = window.location.origin + `/report/${reportId}`;
    navigator.clipboard.writeText(url);
    setShareText('Link Copied!');
    setTimeout(() => setShareText('Share Results'), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-on-surface">
        <span className="material-symbols-outlined text-4xl animate-spin text-secondary mb-md">sync</span>
        <p className="font-body-md">Retrieving report data...</p>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="flex-1 p-gutter">
        <div className="p-md bg-error-container text-on-error-container rounded-xl border border-error mb-lg">
          <p className="font-bold">Error loading report</p>
          <p className="font-body-sm">{errorMsg || 'Could not find report.'}</p>
        </div>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate score circle variables
  const targetScore = report.score;
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (targetScore / 100) * circumference;

  return (
    <div className="flex-1 min-h-screen bg-background text-on-surface font-body-md">
      {/* Hero Header Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl mb-xl flex flex-col md:flex-row items-center gap-xl shadow-sm">
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
            <circle 
              className="text-secondary circular-progress" 
              cx="96" 
              cy="96" 
              fill="transparent" 
              r="88" 
              stroke="currentColor" 
              strokeWidth="8"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset }}
            ></circle>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display-lg text-display-lg font-black text-on-surface">{targetScore}</span>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">ATS Score</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-container bg-secondary-container/10 px-sm py-xs rounded-full">
            Analysis Complete
          </span>
          <h1 className="font-headline-lg text-headline-lg mt-sm mb-xs">Resume Analysis Result</h1>
          <p className="text-on-surface-variant font-body-md max-w-lg mb-lg">
            Candidate profile for <strong className="text-on-surface">{report.targetJob}</strong> targeting <strong className="text-on-surface">{report.targetCompany}</strong>. The analysis shows details below.
          </p>
          <div className="flex flex-wrap gap-md justify-center md:justify-start">
            <a 
              href={`/api/report/${report.id}/download`} 
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md flex items-center gap-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">download</span> Download PDF Report
            </a>
            <button 
              onClick={handleShare}
              className="border border-outline text-on-surface px-lg py-sm rounded-lg font-label-md flex items-center gap-sm hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined">share</span> {shareText}
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
        {/* Section Scores */}
        <div className="md:col-span-4 flex flex-col">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg h-full shadow-sm">
            <h3 className="font-headline-sm text-headline-sm mb-lg">Section Scores</h3>
            <div className="space-y-lg">
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-md text-on-surface">Skill Match</span>
                  <span className="font-label-sm text-on-tertiary-container">{Math.round((report.sectionScores.skills / 35) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${(report.sectionScores.skills / 35) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-md text-on-surface">Keyword Match</span>
                  <span className="font-label-sm text-on-tertiary-container">{Math.round((report.sectionScores.keywords / 20) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container" style={{ width: `${(report.sectionScores.keywords / 20) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-md text-on-surface">Experience Level</span>
                  <span className="font-label-sm text-on-tertiary-container">{Math.round((report.sectionScores.experience / 20) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary" style={{ width: `${(report.sectionScores.experience / 20) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-md text-on-surface">Education Match</span>
                  <span className="font-label-sm text-on-tertiary-container">{report.sectionScores.education * 10}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container" style={{ width: `${report.sectionScores.education * 10}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-md text-on-surface">Formatting Score</span>
                  <span className="font-label-sm text-on-tertiary-container">{report.sectionScores.formatting * 10}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${report.sectionScores.formatting * 10}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm mb-lg">Skill Gap Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
            <div>
              <span className="font-label-sm text-on-tertiary-container uppercase tracking-widest text-[10px] block mb-md">Matched Skills</span>
              <div className="flex flex-wrap gap-sm">
                {report.skillsAnalysis.matched.map((skill, idx) => (
                  <span key={idx} className="bg-tertiary-fixed text-on-tertiary-fixed px-sm py-xs rounded-full font-label-sm text-[12px] flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-label-sm text-error uppercase tracking-widest text-[10px] block mb-md">Missing Critical Skills</span>
              <div className="flex flex-wrap gap-sm">
                {report.skillsAnalysis.missing.map((skill, idx) => (
                  <span key={idx} className="bg-surface-container-high border border-dashed border-outline text-on-surface-variant px-sm py-xs rounded-full font-label-sm text-[12px] flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
        {/* AI Suggestions */}
        <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-lg">
            <span className="material-symbols-outlined text-secondary">auto_awesome</span>
            <h3 className="font-headline-sm text-headline-sm">AI-Driven Recommendations</h3>
          </div>
          <ul className="space-y-md">
            {report.aiSuggestions.map((sug, idx) => (
              <li key={idx} className="p-md bg-secondary-fixed text-on-secondary-fixed rounded-xl flex gap-md items-start">
                <span className="font-label-md font-bold px-2 py-1 bg-secondary text-on-secondary rounded text-[10px]">{sug.priority}</span>
                <div>
                  <p className="font-body-md font-semibold mb-xs text-primary">{sug.title}</p>
                  <p className="font-body-sm opacity-80 text-on-surface-variant">{sug.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Formatting & Integrity */}
        <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm mb-lg">Document Integrity</h3>
            <div className="space-y-sm">
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {report.integrityCheck.fontUsage === 'Passed' ? 'check_circle' : 'cancel'}
                  </span>
                  <span className="font-body-md">Standard Font Usage</span>
                </div>
                <span className={`font-label-sm ${report.integrityCheck.fontUsage === 'Passed' ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {report.integrityCheck.fontUsage}
                </span>
              </div>
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {report.integrityCheck.sectionHeaders === 'Passed' ? 'check_circle' : 'cancel'}
                  </span>
                  <span className="font-body-md">Section Headers Detected</span>
                </div>
                <span className={`font-label-sm ${report.integrityCheck.sectionHeaders === 'Passed' ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {report.integrityCheck.sectionHeaders}
                </span>
              </div>
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {report.integrityCheck.layoutCheck === 'Passed' ? 'check_circle' : 'cancel'}
                  </span>
                  <span className="font-body-md">Two-Column Layout Check</span>
                </div>
                <span className={`font-label-sm ${report.integrityCheck.layoutCheck === 'Passed' ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {report.integrityCheck.layoutCheck}
                </span>
              </div>
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {report.integrityCheck.contactInfo === 'Passed' ? 'check_circle' : 'cancel'}
                  </span>
                  <span className="font-body-md">Contact Info Present</span>
                </div>
                <span className={`font-label-sm ${report.integrityCheck.contactInfo === 'Passed' ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {report.integrityCheck.contactInfo}
                </span>
              </div>
              <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {report.integrityCheck.spellingGrammar === 'Passed' ? 'check_circle' : 'cancel'}
                  </span>
                  <span className="font-body-md">Spelling &amp; Grammar</span>
                </div>
                <span className={`font-label-sm ${report.integrityCheck.spellingGrammar === 'Passed' ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {report.integrityCheck.spellingGrammar}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-lg p-md border border-indigo-200 bg-indigo-50 rounded-xl">
            <p className="font-label-sm text-indigo-700 flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">info</span>
              ATS COMPATIBILITY NOTE
            </p>
            <p className="font-body-sm text-indigo-600 mt-xs leading-relaxed">
              Complex two-column layouts can sometimes confuse legacy parse engines. We recommend a simplified linear layout for high-volume applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
