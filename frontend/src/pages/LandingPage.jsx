import React from 'react';

export default function LandingPage({ setCurrentPage }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-gutter py-md bg-surface-container-lowest border-b border-outline-variant">
        <div className="flex items-center gap-sm cursor-pointer" onClick={() => setCurrentPage('landing')}>
          <span className="material-symbols-outlined text-primary text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pulse_alert</span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">TalentPulse AI</span>
        </div>
        <div className="hidden md:flex items-center space-x-lg">
          <button onClick={() => setCurrentPage('dashboard')} className="text-on-surface-variant hover:text-secondary transition-colors font-body-md text-body-md">Dashboard</button>
          <button onClick={() => setCurrentPage('history')} className="text-on-surface-variant hover:text-secondary transition-colors font-body-md text-body-md">History</button>
          <button onClick={() => setCurrentPage('settings')} className="text-on-surface-variant hover:text-secondary transition-colors font-body-md text-body-md">Settings</button>
        </div>
        <div className="flex items-center gap-md">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="hidden lg:flex items-center px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg transition-all duration-200 active:opacity-80"
          >
            Upload Resume
          </button>
          <div 
            onClick={() => setCurrentPage('settings')}
            className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant cursor-pointer hover:border-primary transition-all"
          >
            <img 
              className="w-full h-full object-cover" 
              alt="User profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9VTCZ_RKEVIHIjxRmtNdKYxYVJMY3OXQE295yARwzRNKYIHNsq1uJwaN9lKq3Wly1P7wiN4jD13UJ-PI5MKc_mRxXP1MyNybJHHCkzxtz2YHSJ2Y0D0bYhj2bCHbmoRGSXrvXg5HgO5z00W0jDqM9PGHcottFyBm62xftOpP0wwX61vICklgHbDfNTeGwJCoNLDtKDQvpIMS8xuCyh3TJyUZv3Zl7Hvd8mBwHni9jkReEsB20u28d6uH-V7pRiM-MeGQ6rHgsS3UP"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-3xl pb-3xl px-gutter overflow-hidden">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center relative z-10">
            <div className="space-y-lg">
              <div className="inline-flex items-center gap-sm bg-secondary-container text-on-secondary-container px-md py-xs rounded-full">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">AI-Powered Optimization</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-primary leading-tight">
                Beat the Bots. <br />
                <span className="text-secondary">Land the Interview.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Over 75% of resumes are rejected by ATS systems before a human ever sees them. Our AI identifies matching gaps and optimizes your resume for high-performance ranking.
              </p>
              <div className="flex flex-col sm:flex-row gap-md pt-sm">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-xl py-lg bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-sm shadow-lg hover:translate-y-[-2px] transition-transform active:translate-y-[0px]"
                >
                  Analyze My Resume
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button 
                  onClick={() => setCurrentPage('history')}
                  className="px-xl py-lg border-2 border-outline-variant text-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors"
                >
                  View Sample Report
                </button>
              </div>
              <div className="flex items-center gap-lg pt-xl opacity-80">
                <div className="flex -space-x-sm">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYsFVS5-13YCBPs9tRktqOjQaCmACovTG7CKTcnjTXl0inJmeAGwEVQqc0_0DoQ0O47GmMMzcguVceakG2c87uCNawWCkQ8Rht-F4qdIvYdVBnQ4WJVIc1i7uIXTzPMs0wWVS-ITP3cq27ombf3X7sJghN-zNFyfyqZMCGMwbNsqi1kQR_CNX19u58Rodh7emDuEna2hn882w6Ak7vWXzDYG4cSuCmRoO5EfynbsM6pr0K1bYKG-rT-EUR0kLzFT2xu9GAjUNqZG0-" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxdKhMcG4C-el5wGT75A4kgUunZGHJRKrnjIpCfj0vckblcuPZgAEv4CMb_u_T3BPIkGBGiTc-bVXoNRhVCGn9aa_B_rdL2kD_79w_3D8MZDwKULbj_RYeA8-V_diV3qTKERcZ1POQF2Gy4hQTsOxna4YrxWUxquXC9LcGLylg9c5PEVByxz0RarSlGTilORWOgaT2IIrUy8eim2mZqgQzVM9Dr1YmND-Hj2lhbQU3SiYv_4BRxx6dQKBVuIupWCXKFRRjCHSRRSOL" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR1txnB3aJMcHMDNkhLR6xFvFVdg1HCY5jF639fvawtx1lTzC4wF0TiF_9WxdiLwTGeBzf7-i60whZ3sQWH3KXsatvg3tX50isBkQKOCDC7JA4AtuJhi_QRIvz_tHQqJpHVDJwkUwoTRh4NuGCkmZEe3hLWJu0OWmfEGZz15arceA2jCGp-hLqeLpL2PFaVNJCqYDORdLf-5jtdBFUUDyibW3TcFjH1ryYwGveM0KDpqjDjR8dyHyRJvJSMm_1Zt_jihw5FUBDgur-" />
                  </div>
                </div>
                <p className="font-label-md text-label-md text-on-surface">
                  <span className="font-bold">Trusted by 10,000+</span> Job Seekers
                </p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute -inset-10 bg-secondary-container/5 rounded-full blur-3xl"></div>
              <div className="relative glass-card rounded-3xl p-lg border-outline-variant shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-dim"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">resume_analysis_report.pdf</span>
                </div>
                <div className="grid grid-cols-12 gap-md">
                  {/* Circular Score */}
                  <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-center space-y-sm">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                        <circle className="text-secondary-container" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="54.6" strokeWidth="8"></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-label-md text-label-md text-on-surface-variant">ATS Score</span>
                        <span className="font-label-sm text-headline-md font-bold text-primary">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-xs px-sm py-xs bg-tertiary-fixed/20 text-on-tertiary-container rounded-full">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span className="text-[10px] font-bold uppercase">Pass Ready</span>
                    </div>
                  </div>
                  {/* Analysis Items */}
                  <div className="col-span-12 sm:col-span-8 space-y-md">
                    <div className="space-y-xs">
                      <div className="flex justify-between font-label-sm text-label-sm">
                        <span>Skill Matching</span>
                        <span className="text-secondary-container">92%</span>
                      </div>
                      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-container w-[92%]"></div>
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <div className="flex justify-between font-label-sm text-label-sm">
                        <span>Formatting Check</span>
                        <span className="text-secondary-container">78%</span>
                      </div>
                      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-container w-[78%]"></div>
                      </div>
                    </div>
                    <div className="pt-sm space-y-sm">
                      <p className="font-label-sm text-label-sm text-on-surface font-bold">Matched Keywords</p>
                      <div className="flex flex-wrap gap-xs">
                        <span className="px-sm py-xs bg-surface-container-high text-on-surface-variant rounded-full text-[11px] font-medium border border-outline-variant">Project Management</span>
                        <span className="px-sm py-xs bg-surface-container-high text-on-surface-variant rounded-full text-[11px] font-medium border border-outline-variant">Python</span>
                        <span className="px-sm py-xs bg-surface-container-high text-on-surface-variant rounded-full text-[11px] font-medium border border-outline-variant">Agile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 px-md py-sm glass-card border-secondary/20 rounded-xl shadow-lg flex items-center gap-sm animate-bounce">
                <span className="material-symbols-outlined text-secondary-container">psychology</span>
                <span className="font-label-sm text-label-sm">AI Optimizing...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-3xl px-gutter bg-surface-container-low">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-2xl">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-md">Precision Intelligence for Your Career</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                Stop guessing what recruiters want. Our platform uses the same parsing technology as major enterprise ATS software to give you the ultimate edge.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* Feature 1 */}
              <div className="md:col-span-2 p-xl bg-surface-container-lowest rounded-3xl border border-outline-variant hover:border-secondary transition-all group overflow-hidden relative">
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <span className="material-symbols-outlined text-secondary-container text-headline-lg mb-md">account_tree</span>
                    <h3 className="font-headline-md text-headline-md text-primary mb-sm">AI Contextual Parsing</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                      Our NLP engines go beyond simple keyword matching. We analyze the context of your achievements to ensure the AI understands your true seniority and impact.
                    </p>
                  </div>
                  <div className="mt-xl flex items-center gap-md">
                    <div className="flex-1 h-[1px] bg-outline-variant"></div>
                    <span className="font-label-sm text-label-sm text-secondary-container">99.8% Extraction Accuracy</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[200px]">schema</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-xl bg-surface-container-lowest rounded-3xl border border-outline-variant hover:border-secondary transition-all flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary-container text-headline-lg mb-md">target</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Skill Gap Analysis</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Instantly see which skills are missing for specific job descriptions and get recommendations on how to add them naturally.
                  </p>
                </div>
                <div className="mt-lg pt-lg border-t border-outline-variant space-y-sm">
                  <div className="flex items-center gap-sm text-on-tertiary-container">
                    <span className="material-symbols-outlined text-label-md">check_circle</span>
                    <span className="font-label-sm">Cloud Computing</span>
                  </div>
                  <div className="flex items-center gap-sm text-on-surface-variant opacity-60">
                    <span className="material-symbols-outlined text-label-md">circle</span>
                    <span className="font-label-sm">Kubernetes</span>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-xl bg-surface-container-lowest rounded-3xl border border-outline-variant hover:border-secondary transition-all">
                <span className="material-symbols-outlined text-secondary-container text-headline-lg mb-md">format_paint</span>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Formatting Check</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tables, columns, and custom fonts can break parsers. We verify your document structure is 100% readable.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-2 p-xl bg-primary-container text-on-primary-fixed rounded-3xl border border-outline transition-all relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-xl items-center relative z-10">
                  <div className="flex-1">
                    <span className="material-symbols-outlined text-secondary-fixed text-headline-lg mb-md">bolt</span>
                    <h3 className="font-headline-md text-headline-md text-white mb-sm">Instant Intelligence Reports</h3>
                    <p className="font-body-sm text-body-sm text-on-primary-container">
                      Get a comprehensive breakdown of your resume's performance across 50+ ATS parameters in under 10 seconds.
                    </p>
                  </div>
                  <div className="w-full md:w-1/3 aspect-square bg-surface-container-lowest/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[80px] animate-pulse">analytics</span>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#2170e4,transparent_70%)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-3xl px-gutter relative">
          <div className="max-w-4xl mx-auto glass-card p-2xl rounded-3xl border border-outline-variant text-center relative overflow-hidden">
            <div className="relative z-10 space-y-lg">
              <h2 className="font-headline-lg text-headline-lg text-primary">Ready to pass the first hurdle?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Join 10,000+ candidates who used TalentPulse AI to land roles at top-tier tech companies. Your dream job is waiting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-md pt-md">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-xl py-lg bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  Get Started Free
                </button>
                <p className="text-label-sm font-label-sm text-on-surface-variant italic">No credit card required</p>
              </div>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant px-gutter py-2xl">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-xl">
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pulse_alert</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">TalentPulse AI</span>
            </div>
            <p className="max-w-xs font-body-sm text-body-sm text-on-surface-variant">
              Empowering job seekers with enterprise-grade recruitment intelligence and AI-driven resume optimization.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-xl">
            <div className="space-y-md">
              <p className="font-label-md text-label-md font-bold uppercase text-primary">Product</p>
              <ul className="space-y-sm font-body-sm text-body-sm text-on-surface-variant">
                <li><button onClick={() => setCurrentPage('dashboard')} className="hover:text-secondary">ATS Checker</button></li>
                <li><button onClick={() => setCurrentPage('settings')} className="hover:text-secondary">API Settings</button></li>
              </ul>
            </div>
            <div className="space-y-md">
              <p className="font-label-md text-label-md font-bold uppercase text-primary">Company</p>
              <ul className="space-y-sm font-body-sm text-body-sm text-on-surface-variant">
                <li><a className="hover:text-secondary" href="#">About Us</a></li>
                <li><a className="hover:text-secondary" href="#">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-md hidden sm:block">
              <p className="font-label-md text-label-md font-bold uppercase text-primary">Support</p>
              <ul className="space-y-sm font-body-sm text-body-sm text-on-surface-variant">
                <li><button onClick={() => setCurrentPage('settings')} className="hover:text-secondary">Setup Guide</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-container-max mx-auto mt-2xl pt-lg border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-label-sm text-label-sm text-on-surface-variant">© 2026 TalentPulse AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">System Status: Optimal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
