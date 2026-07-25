import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [reportId, setReportId] = useState(null);
  const [credits, setCredits] = useState(42);

  // Check URL pathname for report routing if shared
  useEffect(() => {
    const path = window.location.pathname;
    const reportMatch = path.match(/\/report\/([a-zA-Z0-9]+)/);
    if (reportMatch && reportMatch[1]) {
      setReportId(reportMatch[1]);
      setCurrentPage('report');
    }
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setReportId={setReportId} 
            credits={credits} 
            setCredits={setCredits} 
          />
        );
      case 'report':
        return (
          <Report 
            reportId={reportId} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'history':
        return (
          <History 
            setCurrentPage={setCurrentPage} 
            setReportId={setReportId} 
          />
        );
      case 'settings':
        return (
          <Settings 
            setCredits={setCredits} 
          />
        );
      default:
        return <Dashboard setCurrentPage={setCurrentPage} setReportId={setReportId} credits={credits} setCredits={setCredits} />;
    }
  };

  if (currentPage === 'landing') {
    return <LandingPage setCurrentPage={setCurrentPage} />;
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-[240px] px-gutter py-xl bg-surface min-h-screen relative overflow-y-auto custom-scrollbar">
        <div className="max-w-container-max mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
