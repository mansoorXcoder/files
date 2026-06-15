/**
 * PWA Service Worker Registration
 * Handles installing the service worker and managing updates.
 */
(function() {
  // Check if PWA is enabled in configurations
  const enablePWA = window.CONFIG && window.CONFIG.settings ? window.CONFIG.settings.enablePWA : true;

  if (enablePWA && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('PWA ServiceWorker registered successfully with scope: ', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; please refresh.
                  console.log('New content is available; please refresh the page.');
                  if (window.APP && window.APP.showToast) {
                    window.APP.showToast('App update available. Reload to update.', 'info');
                  }
                } else {
                  // Content is cached for offline use.
                  console.log('Content is cached for offline use.');
                }
              }
            });
          });
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });

    // Handle offline status events
    window.addEventListener('online', () => {
      console.log('App is online.');
      if (window.APP && window.APP.showToast) {
        window.APP.showToast('You are back online. Reloading latest data...', 'success');
        window.APP.loadData(true);
      }
    });

    window.addEventListener('offline', () => {
      console.log('App is offline.');
      if (window.APP && window.APP.showToast) {
        window.APP.showToast('You are offline. Displaying cached dashboard data.', 'error');
      }
    });
  }
})();
