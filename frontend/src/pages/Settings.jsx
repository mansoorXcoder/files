import React, { useState, useEffect } from 'react';

export default function Settings({ setCredits }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    alert('API Key cleared successfully!');
  };

  const handleRefillCredits = () => {
    setCredits(50);
    alert('Credits refilled to 50!');
  };

  return (
    <div className="flex-1 min-h-screen bg-background text-on-surface font-body-md">
      <header className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-background">System Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Configure environment preferences and developer options.</p>
      </header>

      <div className="space-y-lg max-w-2xl">
        {/* Gemini API Key Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <span className="material-symbols-outlined">key</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold">Google Gemini API Key</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
            Providing an API Key upgrades the analysis engine. TalentPulse will call the **Gemini 2.5 Flash** model to perform advanced contextual parsing, identify layout gaps, and generate customized bullet point re-writes.
          </p>

          <div className="space-y-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant">API Key</label>
              <div className="relative flex items-center">
                <input 
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-sm pr-12 py-sm bg-surface-container-low border border-outline-variant rounded-lg font-label-sm text-label-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-sm text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-md pt-sm">
              <button 
                onClick={handleSave}
                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all"
              >
                Save API Key
              </button>
              {apiKey && (
                <button 
                  onClick={handleClearKey}
                  className="border border-outline text-error border-error/50 hover:bg-error-container/20 px-lg py-sm rounded-lg font-label-md transition-all"
                >
                  Clear Key
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="mt-sm p-sm bg-tertiary-fixed/30 text-on-tertiary-container rounded-lg border border-tertiary-fixed flex items-center gap-xs font-body-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>API Key saved successfully to localStorage!</span>
              </div>
            )}
          </div>
        </div>

        {/* Developer Sandbox Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <span className="material-symbols-outlined">science</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold">Sandbox Console</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
            Reset, refill, and preview local testing states for local evaluations.
          </p>

          <div className="flex flex-wrap gap-md">
            <button 
              onClick={handleRefillCredits}
              className="border border-outline text-on-surface hover:bg-surface-container-low px-lg py-sm rounded-lg font-label-md transition-all flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              Refill Credits (50)
            </button>
          </div>
        </div>

        {/* ATS Formulation Guideline */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <span className="material-symbols-outlined">calculate</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold">ATS Scoring System Details</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md leading-relaxed">
            The platform calculates resume compliance ratings by applying the formal ATS Parser specification weighting model:
          </p>
          <ul className="space-y-sm font-body-sm text-on-surface-variant pl-md list-disc">
            <li><strong>Hard &amp; Soft Skills Match (35%)</strong> - Assesses core technical competencies overlap.</li>
            <li><strong>Contextual Keyword Match (20%)</strong> - Evaluates search keyword densities.</li>
            <li><strong>Experience Alignment (20%)</strong> - Compares candidate experience duration to the JD requirement.</li>
            <li><strong>Education Integrity (10%)</strong> - Checks for degrees, certificates, and academic institutions.</li>
            <li><strong>Formatting Checks (10%)</strong> - Scans for multi-column flags, parsing errors, contact structures.</li>
            <li><strong>Spelling &amp; Grammar (5%)</strong> - Checks formatting integrity and text error metrics.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
