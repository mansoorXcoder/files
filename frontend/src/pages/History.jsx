import React, { useState, useEffect } from 'react';

export default function History({ setCurrentPage, setReportId }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 5;

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (!response.ok) {
        throw new Error('Failed to retrieve history records.');
      }
      const data = await response.json();
      setHistoryList(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const response = await fetch(`/api/report/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete report.');
      }
      // Refresh list
      fetchHistory();
    } catch (err) {
      alert(err.message);
    }
  };

  const viewReport = (id) => {
    setReportId(id);
    setCurrentPage('report');
  };

  // Filters
  const filteredHistory = historyList.filter(item => {
    const filename = (item.filename || '').toLowerCase();
    const targetJob = (item.targetJob || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return filename.includes(query) || targetJob.includes(query);
  });

  // Pagination
  const indexOfLastItem = currentPageNum * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;

  // Stats calculation
  const totalScans = historyList.length;
  const averageScore = totalScans > 0 
    ? Math.round(historyList.reduce((acc, curr) => acc + curr.score, 0) / totalScans) 
    : 0;
  const readyCount = historyList.filter(item => item.score >= 80).length;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-on-surface">
        <span className="material-symbols-outlined text-4xl animate-spin text-secondary mb-md">sync</span>
        <p className="font-body-md">Retrieving history data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-background text-on-surface font-body-md">
      <div className="max-w-container-max mx-auto space-y-lg">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
          <div className="space-y-xs">
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Analysis History</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Review and manage your previous resume scans and ATS compatibility reports.</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                type="text" 
                placeholder="Search filename or job title..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPageNum(1); // Reset page to 1 on search
                }}
                className="pl-xl pr-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary outline-none w-full md:w-80 transition-all font-body-sm text-body-sm"
              />
            </div>
          </div>
        </header>

        {/* Stats Bento Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
          <div className="glass-card p-lg rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs text-[10px]">Total Scans</p>
              <h3 className="font-headline-md text-headline-md font-bold">{totalScans}</h3>
            </div>
            <div className="w-12 h-12 bg-secondary-container/10 rounded-full flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">description</span>
            </div>
          </div>
          <div className="glass-card p-lg rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs text-[10px]">Average Score</p>
              <h3 className="font-headline-md text-headline-md font-bold">{averageScore}%</h3>
            </div>
            <div className="w-12 h-12 bg-tertiary-fixed-dim/10 rounded-full flex items-center justify-center text-on-tertiary-container">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div className="glass-card p-lg rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs text-[10px]">Ready for App (&gt;=80)</p>
              <h3 className="font-headline-md text-headline-md font-bold">{readyCount}</h3>
            </div>
            <div className="w-12 h-12 bg-error-container/10 rounded-full flex items-center justify-center text-error">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </div>

        {/* History Table Container */}
        <div className="glass-card rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Date of Analysis</th>
                  <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Resume Filename</th>
                  <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Target Job / Company</th>
                  <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">ATS Score</th>
                  <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Status</th>
                  <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => {
                    const parsedDate = new Date(item.date);
                    const formattedDate = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const formattedTime = parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                    // ATS progress values
                    const score = item.score;
                    const circleCircumference = 2 * Math.PI * 20;
                    const circleOffset = circleCircumference - (score / 100) * circleCircumference;

                    let scoreColor = '#76777d'; // gray
                    let statusLabel = 'Critical';
                    if (score >= 80) {
                      scoreColor = '#4edea3'; // emerald
                      statusLabel = 'Optimized';
                    } else if (score >= 50) {
                      scoreColor = '#0058be'; // blue
                      statusLabel = 'Average';
                    }

                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => viewReport(item.id)}
                        className="hover:bg-surface-container-lowest transition-all group cursor-pointer"
                      >
                        <td className="px-lg py-lg">
                          <div className="font-body-md text-body-md text-on-surface font-medium">{formattedDate}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">{formattedTime}</div>
                        </td>
                        <td className="px-lg py-lg">
                          <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-secondary">picture_as_pdf</span>
                            <span className="font-body-md text-body-md font-semibold truncate max-w-[200px]">{item.filename}</span>
                          </div>
                        </td>
                        <td className="px-lg py-lg">
                          <div className="font-body-md text-body-md font-medium text-primary">{item.targetJob}</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">{item.targetCompany}</div>
                        </td>
                        <td className="px-lg py-lg">
                          <div className="flex items-center gap-md">
                            <div className="relative w-12 h-12">
                              <svg className="ats-progress w-12 h-12">
                                <circle cx="24" cy="24" fill="none" r="20" stroke="#e5eeff" strokeWidth="4"></circle>
                                <circle 
                                  cx="24" 
                                  cy="24" 
                                  fill="none" 
                                  r="20" 
                                  stroke={scoreColor} 
                                  strokeDasharray={circleCircumference}
                                  strokeDashoffset={circleOffset}
                                  strokeLinecap="round" 
                                  strokeWidth="4"
                                ></circle>
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm font-bold">{score}</span>
                            </div>
                            <span className="font-label-md text-label-md" style={{ color: scoreColor }}>{statusLabel}</span>
                          </div>
                        </td>
                        <td className="px-lg py-lg">
                          <span className="inline-flex items-center gap-xs px-sm py-xs bg-tertiary-fixed/20 text-on-tertiary-fixed-variant rounded-full font-label-sm text-label-sm">
                            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                            Completed
                          </span>
                        </td>
                        <td className="px-lg py-lg text-right">
                          <div className="flex items-center justify-end gap-xs md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); viewReport(item.id); }}
                              className="p-sm text-secondary hover:bg-secondary/10 rounded-lg transition-colors" 
                              title="View Report"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                            <a 
                              href={`/api/report/${item.id}/download`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" 
                              title="Download Report"
                            >
                              <span className="material-symbols-outlined">download</span>
                            </a>
                            <button 
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-sm text-error hover:bg-error/10 rounded-lg transition-colors" 
                              title="Delete"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-2xl text-on-surface-variant font-body-md">
                      No previous scans found. Upload a resume to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-lg bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} results
            </span>
            <div className="flex items-center gap-xs">
              <button 
                onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
                disabled={currentPageNum === 1}
                className="p-sm rounded-lg border border-outline-variant hover:bg-surface-container-lowest disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPageNum(page)}
                  className={`w-8 h-8 rounded-lg font-label-md text-label-md ${
                    currentPageNum === page 
                      ? 'bg-secondary text-white' 
                      : 'hover:bg-surface-container-highest text-on-surface'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))}
                disabled={currentPageNum === totalPages}
                className="p-sm rounded-lg border border-outline-variant hover:bg-surface-container-lowest disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating AI Tip */}
        {historyList.length > 0 && (
          <div className="glass-card p-lg rounded-2xl flex items-start gap-lg border-secondary/20 shadow-lg mt-xl">
            <div className="p-sm bg-secondary-container rounded-xl text-white animate-pulse">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div className="flex-1 space-y-xs">
              <h4 className="font-headline-sm text-headline-sm text-secondary font-bold">History Insight</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Your ATS analysis history indicates that custom keywords like <span className="font-bold text-on-surface">Docker</span> and <span className="font-bold text-on-surface">Python</span> have appeared in 80% of successful matches. Try adding these to new drafts!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
