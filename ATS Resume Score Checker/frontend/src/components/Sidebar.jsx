import React from 'react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-md space-y-sm bg-surface-container-low dark:bg-primary-container border-r border-outline-variant w-[240px] z-50">
      <div className="flex flex-col mb-lg px-xs py-md">
        <div className="flex items-center gap-sm cursor-pointer" onClick={() => setCurrentPage('landing')}>
          <span className="material-symbols-outlined text-primary text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pulse_alert</span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">TalentPulse AI</span>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 mt-1">Recruitment Intelligence</p>
      </div>

      <nav className="flex-1 space-y-xs overflow-y-auto custom-scrollbar">
        <button
          onClick={() => setCurrentPage('landing')}
          className={`w-full flex items-center gap-sm px-md py-sm transition-all rounded-full font-label-md text-label-md text-left ${
            currentPage === 'landing'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`w-full flex items-center gap-sm px-md py-sm transition-all rounded-full font-label-md text-label-md text-left ${
            currentPage === 'dashboard'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>New Analysis</span>
        </button>

        <button
          onClick={() => setCurrentPage('history')}
          className={`w-full flex items-center gap-sm px-md py-sm transition-all rounded-full font-label-md text-label-md text-left ${
            currentPage === 'history'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">history</span>
          <span>History</span>
        </button>

        <button
          onClick={() => setCurrentPage('settings')}
          className={`w-full flex items-center gap-sm px-md py-sm transition-all rounded-full font-label-md text-label-md text-left ${
            currentPage === 'settings'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </button>
      </nav>

      <div className="pt-md border-t border-outline-variant space-y-xs">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary py-sm rounded-full font-label-md text-label-md hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          <span>New Analysis</span>
        </button>
        <div className="flex items-center gap-md px-md py-sm text-on-surface-variant text-label-sm font-label-sm">
          <span className="material-symbols-outlined">help</span>
          <span>Support</span>
        </div>
      </div>
    </aside>
  );
}
