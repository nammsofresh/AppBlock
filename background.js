// Écouteur pour les événements de navigation
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    // Vérifier si le blocage est activé
    chrome.storage.local.get(['isBlockingEnabled', 'blockedSites'], function(data) {
      if (!data.isBlockingEnabled) return;
      
      const url = new URL(details.url);
      const domain = url.hostname.replace(/^www\./, '');
      
      if (data.blockedSites && data.blockedSites.some(site => domain.includes(site))) {
        // Rediriger vers la page de blocage
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('blocked.html')
        });
      }
    });
  });
  
  // Initialiser le stockage si nécessaire
  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(['blockedSites', 'isBlockingEnabled'], function(data) {
      if (!data.blockedSites) {
        chrome.storage.local.set({ blockedSites: [] });
      }
      if (data.isBlockingEnabled === undefined) {
        chrome.storage.local.set({ isBlockingEnabled: false });
      }
    });
  });