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
  
    function addSite() {
      const site = newSiteInput.value.trim().replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0];
      if (!site) return;
  
      chrome.storage.local.get('blockedSites', data => {
        const blockedSites = data.blockedSites || [];
        if (!blockedSites.includes(site)) {
          blockedSites.push(site);
          chrome.storage.local.set({ blockedSites }, () => {
            newSiteInput.value = '';
            loadBlockedSites();
          });
        }
      });
    }