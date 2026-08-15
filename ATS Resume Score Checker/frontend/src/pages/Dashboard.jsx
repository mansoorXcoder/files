import React, { useState, useRef } from 'react';

export default function Dashboard({ setCurrentPage, setReportId, credits, setCredits }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdTab, setJdTab] = useState('paste'); // 'paste' | 'file'
  
  const [targetJob, setTargetJob] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resumeInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleResumeDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleJdDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setJdFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleResumeSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleJdFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const startAnalysis = async () => {
    if (!resumeFile) {
      setErrorMsg('Please upload a resume file first.');
      return;
    }
    if (jdTab === 'paste' && !jdText.trim()) {
      setErrorMsg('Please enter a job description.');
      return;
    }
    if (jdTab === 'file' && !jdFile) {
      setErrorMsg('Please upload a job description file.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setProgress(10);
    setStatusText('Reading document structures...');

    // Simulate progress bar movement while calling API
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const next = prev + 5;
        if (next < 35) setStatusText('Reading document structures...');
        else if (next < 65) setStatusText('Extracting semantic entities...');
        else if (next < 85) setStatusText('Running match algorithms...');
        else setStatusText('Finalizing report...');
        return next;
      });
    }, 250);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      if (jdTab === 'paste') {
        formData.append('jdText', jdText);
      } else {
        formData.append('jdFile', jdFile);
      }
      formData.append('targetJob', targetJob || 'Software Engineer');
      formData.append('targetCompany', targetCompany || 'TalentPulse Client');
      
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      if (apiKey) {
        formData.append('apiKey', apiKey);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze resume.');
      }

      setProgress(100);
      setStatusText('Analysis Complete!');
      const data = await response.json();

      setCredits(prev => Math.max(0, prev - 1));

      setTimeout(() => {
        setReportId(data.id);
        setCurrentPage('report');
      }, 600);

    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      setErrorMsg(err.message || 'An error occurred during analysis.');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background text-on-surface">
      <header className="mb-xl flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">New Analysis</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Optimize your candidate profile against specific job requirements.</p>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-label-sm text-label-sm bg-surface-container-high px-sm py-xs rounded-lg border border-outline-variant">Credits: {credits}</span>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
            <img 
              className="w-full h-full object-cover" 
              alt="Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyvnZhCs5ESKCnxF8fH_iivM_R4w-o_y3_Xkoz-e1UM0RQ88kye2L0XOirS0GL12kTFPOXi43_0ELqi_NBDy87hLCWOztTztrjWgceneOm1HZ7VVQSaXY40U8BN4R6iKA-JgPXKayFQzaGMhT6E5gQdpkF5iHG9FjqvNGTrJ2_CwCDkxy3TkdJ67utwRyp0iZUvJPEByqETWD-cO1AoeTwHSWIhKJvfgcKIVKHxzT_GdiPdj0qTNZ4QwgzuO0Nl59otYLObf4UJlYz"
            />
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="mb-md p-md bg-error-container text-on-error-container rounded-xl border border-error flex items-center gap-sm font-body-sm">
          <span className="material-symbols-outlined">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant">Target Job Role</label>
          <input 
            type="text" 
            placeholder="e.g. Senior DevOps Engineer"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            disabled={loading}
            className="p-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant">Target Company</label>
          <input 
            type="text" 
            placeholder="e.g. Figma, Inc."
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            disabled={loading}
            className="p-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg mb-xl">
        {/* Left Side: Resume Upload */}
        <div className="md:col-span-5 flex flex-col gap-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-sm text-headline-sm">Resume Upload</h3>
              <span className="material-symbols-outlined text-secondary">description</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">Upload the candidate's latest resume to begin the extraction process.</p>
            
            {!resumeFile ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleResumeDrop}
                onClick={() => resumeInputRef.current?.click()}
                className="upload-zone border-2 border-dashed border-outline-variant rounded-xl flex-1 flex flex-col items-center justify-center p-xl cursor-pointer min-h-[220px]"
              >
                <div className="bg-surface-container-high w-16 h-16 rounded-full flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                </div>
                <span className="font-label-md text-label-md text-primary font-bold">Drag &amp; Drop Resume</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-xs">PDF or DOCX (Max 10MB)</span>
                <button className="mt-lg border border-outline text-on-surface px-lg py-sm rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Browse Files
                </button>
                <input 
                  type="file" 
                  ref={resumeInputRef} 
                  onChange={handleResumeSelect} 
                  accept=".pdf,.docx" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="mt-md p-md bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-md">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md font-bold truncate">{resumeFile.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Selected</p>
                </div>
                <button 
                  onClick={() => setResumeFile(null)}
                  disabled={loading}
                  className="text-error hover:bg-error-container p-xs rounded transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Job Description */}
        <div className="md:col-span-7 flex flex-col gap-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-sm text-headline-sm">Job Description</h3>
              <span className="material-symbols-outlined text-secondary">work</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">Paste the job requirements or upload the JD file to compare skills.</p>
            <div className="flex-1 flex flex-col gap-md">
              <div className="flex gap-sm border-b border-outline-variant pb-xs mb-sm">
                <button 
                  onClick={() => setJdTab('paste')}
                  className={`px-md py-xs font-label-md text-label-md border-b-2 transition-all ${
                    jdTab === 'paste' ? 'border-secondary text-secondary font-bold' : 'border-transparent text-on-surface-variant'
                  }`}
                >
                  Paste Text
                </button>
                <button 
                  onClick={() => setJdTab('file')}
                  className={`px-md py-xs font-label-md text-label-md border-b-2 transition-all ${
                    jdTab === 'file' ? 'border-secondary text-secondary font-bold' : 'border-transparent text-on-surface-variant'
                  }`}
                >
                  Upload File
                </button>
              </div>
              
              {jdTab === 'paste' ? (
                <div className="flex-1">
                  <textarea 
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    disabled={loading}
                    className="w-full h-full min-h-[220px] p-md bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none placeholder-on-surface-variant/50 custom-scrollbar" 
                    placeholder="Paste the full job description here, including responsibilities, requirements, and preferred qualifications..."
                  />
                </div>
              ) : (
                <div className="flex-1">
                  {!jdFile ? (
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleJdDrop}
                      onClick={() => jdFileInputRef.current?.click()}
                      className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-xl cursor-pointer hover:bg-surface-container-high transition-all min-h-[220px]"
                    >
                      <span className="material-symbols-outlined text-primary text-3xl mb-md">post_add</span>
                      <span className="font-label-md text-label-md font-bold">Upload Job Description</span>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">PDF, Word, or Text file</p>
                      <input 
                        type="file" 
                        ref={jdFileInputRef} 
                        onChange={handleJdFileSelect} 
                        accept=".pdf,.docx,.txt" 
                        className="hidden" 
                      />
                    </div>
                  ) : (
                    <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-md">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-md font-bold truncate">{jdFile.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{(jdFile.size / 1024).toFixed(1)} KB • Selected</p>
                      </div>
                      <button 
                        onClick={() => setJdFile(null)}
                        disabled={loading}
                        className="text-error hover:bg-error-container p-xs rounded transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Zone */}
      <div className="bg-primary-container text-on-primary-container rounded-xl p-xl flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden mb-lg shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="z-10 text-center md:text-left">
          <h4 className="font-headline-md text-headline-md text-white">Ready for AI Optimization?</h4>
          <p className="font-body-md text-body-md opacity-80 mt-xs max-w-xl">TalentPulse will analyze keyword density, hard skill matches, and soft skill alignment using state of the art benchmarks.</p>
        </div>
        <div className="z-10 flex flex-col items-center gap-sm min-w-[240px]">
          <button 
            onClick={startAnalysis}
            disabled={loading}
            className="bg-secondary-container text-white px-3xl py-md rounded-full font-headline-sm text-headline-sm font-bold shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-sm"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">rocket_launch</span>
                <span>Start AI Analysis</span>
              </>
            )}
          </button>
          {loading && (
            <div className="w-full max-w-xs h-2 bg-white/20 rounded-full mt-md overflow-hidden">
              <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {loading && (
            <p className="font-label-sm text-label-sm mt-xs text-white text-center animate-pulse">{statusText}</p>
          )}
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="bg-surface-container-high/50 border border-outline-variant rounded-xl p-md flex items-start gap-md">
          <div className="bg-secondary/10 p-sm rounded-lg text-secondary">
            <span className="material-symbols-outlined">tips_and_updates</span>
          </div>
          <div>
            <h5 className="font-label-md text-label-md font-bold mb-xs">Pro Tip: Formatting</h5>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Ensure the PDF isn't a scanned image. Use machine-readable text for 99.9% accuracy.</p>
          </div>
        </div>
        <div className="bg-surface-container-high/50 border border-outline-variant rounded-xl p-md flex items-start gap-md">
          <div className="bg-on-tertiary-container/10 p-sm rounded-lg text-on-tertiary-container">
            <span className="material-symbols-outlined">security</span>
          </div>
          <div>
            <h5 className="font-label-md text-label-md font-bold mb-xs">Privacy Assured</h5>
            <p className="font-body-sm text-body-sm text-on-surface-variant">All uploaded files are parsed in-memory and automatically deleted after analysis is complete.</p>
          </div>
        </div>
        <div className="bg-surface-container-high/50 border border-outline-variant rounded-xl p-md flex items-start gap-md">
          <div className="bg-error/10 p-sm rounded-lg text-error">
            <span className="material-symbols-outlined">speed</span>
          </div>
          <div>
            <h5 className="font-label-md text-label-md font-bold mb-xs">Real-time Score</h5>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Get your initial ATS score in under 10 seconds after starting the analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
