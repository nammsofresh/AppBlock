document.addEventListener('DOMContentLoaded', function() {
    const sitesListDiv = document.getElementById('sitesList');
    const newSiteInput = document.getElementById('newSite');
    const addSiteButton = document.getElementById('addSite');
    const blockingToggle = document.getElementById('blockingToggle');
    const toggleStatus = document.getElementById('toggleStatus');
  
    // Charger les données
    loadBlockedSites();
    loadBlockingState();
  
    // Événements
    addSiteButton.addEventListener('click', addSite);
    newSiteInput.addEventListener('keypress', e => { if (e.key === 'Enter') addSite(); });
    blockingToggle.addEventListener('change', toggleBlocking);
  
    function toggleBlocking() {
      chrome.storage.local.set({ isBlockingEnabled: blockingToggle.checked });
      toggleStatus.textContent = blockingToggle.checked ? 'Activé' : 'Désactivé';
    }