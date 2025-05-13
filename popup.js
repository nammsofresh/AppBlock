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
  
    function removeSite(site) {
      chrome.storage.local.get('blockedSites', data => {
        const blockedSites = data.blockedSites || [];
        const index = blockedSites.indexOf(site);
        if (index > -1) {
          blockedSites.splice(index, 1);
          chrome.storage.local.set({ blockedSites }, loadBlockedSites);
        }
      });
    }
  
    function loadBlockedSites() {
      chrome.storage.local.get('blockedSites', data => {
        const blockedSites = data.blockedSites || [];
        sitesListDiv.innerHTML = '';
        
        if (blockedSites.length === 0) {
          const emptyMessage = document.createElement('div');
          emptyMessage.className = 'empty-message';
          emptyMessage.textContent = 'Aucun site bloqué';
          sitesListDiv.appendChild(emptyMessage);
          return;
        }
        
        blockedSites.forEach(site => {
          const div = document.createElement('div');
          div.className = 'site-item';
          
          const siteName = document.createElement('span');
          siteName.className = 'site-name';
          siteName.textContent = site;
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = 'X';
          deleteBtn.addEventListener('click', () => removeSite(site));
          
          div.appendChild(siteName);
          div.appendChild(deleteBtn);
          sitesListDiv.appendChild(div);
        });
      });
    }
  
    function loadBlockingState() {
      chrome.storage.local.get('isBlockingEnabled', data => {
        blockingToggle.checked = data.isBlockingEnabled || false;
        toggleStatus.textContent = blockingToggle.checked ? 'Activé' : 'Désactivé';
      });
    }
  });