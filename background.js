// Écouteur pour les événements de navigation
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Vérifier si le blocage est activé
  chrome.storage.local.get(['isBlockingEnabled', 'blockedSites'], function(data) {
    if (!data.isBlockingEnabled) return;
    
    const url = new URL(details.url);
    const domain = url.hostname.replace(/^www\./, '');
    
    // Corriger la vérification pour qu'elle soit exacte
    if (data.blockedSites && data.blockedSites.some(site => domain === site || domain.endsWith('.' + site))) {
      // Rediriger vers la page de blocage
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });
    }
  });
});

// Initialiser le stockage si nécessaire
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get([
    'blockedSites', 
    'isBlockingEnabled', 
    'isDarkMode', 
    'studyModeActive', 
    'studyModeEndTime',
    'permanentBlockingState'
  ], function(data) {
    if (!data.blockedSites) {
      chrome.storage.local.set({ blockedSites: [] });
    }
    if (data.isBlockingEnabled === undefined) {
      chrome.storage.local.set({ isBlockingEnabled: false });
    }
    if (data.isDarkMode === undefined) {
      chrome.storage.local.set({ isDarkMode: false });
    }
    if (data.permanentBlockingState === undefined) {
      chrome.storage.local.set({ permanentBlockingState: false });
    }
    if (data.studyModeActive === undefined) {
      chrome.storage.local.set({ studyModeActive: false });
    }
  });
});

// Vérifier périodiquement si le mode révision doit se terminer
setInterval(function() {
  chrome.storage.local.get(['studyModeActive', 'studyModeEndTime', 'permanentBlockingState'], function(data) {
    if (data.studyModeActive && data.studyModeEndTime) {
      const now = Date.now();
      if (now >= data.studyModeEndTime) {
        // Le temps est écoulé, restaurer l'état permanent du blocage
        chrome.storage.local.set({
          studyModeActive: false,
          studyModeEndTime: null,
          isBlockingEnabled: data.permanentBlockingState || false
        });
      }
    }
  });
}, 5000); // Vérifier toutes les 5 secondes