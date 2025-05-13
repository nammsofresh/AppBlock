document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments DOM
    const els = {
      sitesListDiv: document.getElementById('sitesList'),
      newSiteInput: document.getElementById('newSite'),
      addSiteButton: document.getElementById('addSite'),
      blockingToggle: document.getElementById('blockingToggle'),
      toggleStatus: document.getElementById('toggleStatus'),
      themeToggle: document.getElementById('themeToggle'),
      themeIcon: document.getElementById('themeToggle').querySelector('.theme-icon'),
      studyDurationInput: document.getElementById('studyDuration'),
      startStudyModeButton: document.getElementById('startStudyMode'),
      cancelStudyModeButton: document.getElementById('cancelStudyMode'),
      timerDisplay: document.getElementById('timerDisplay'),
      timeRemainingSpan: document.getElementById('timeRemaining'),
      progressBar: document.getElementById('progressBar')
    };
  
    // Chargement initial des données et configuration des événements
    ['blockedSites', 'blockingState', 'themeState', 'studyModeState'].forEach(load);
    els.addSiteButton.addEventListener('click', addSite);
    els.newSiteInput.addEventListener('keypress', e => e.key === 'Enter' && addSite());
    els.blockingToggle.addEventListener('change', toggleBlocking);
    els.themeToggle.addEventListener('click', toggleTheme);
    els.startStudyModeButton.addEventListener('click', startStudyMode);
    els.cancelStudyModeButton.addEventListener('click', cancelStudyMode);
  
    // Fonctions pour le mode nuit, le mode étude et la gestion des sites
    function toggleTheme() {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      els.themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
      chrome.storage.local.set({ isDarkMode });
    }
  
    function startStudyMode() {
      const duration = parseInt(els.studyDurationInput.value);
      if (isNaN(duration) || duration < 1) return alert('Veuillez entrer une durée valide');
      
      const endTime = Date.now() + (duration * 60 * 1000);
      chrome.storage.local.set({ 
        studyModeActive: true, studyModeEndTime: endTime,
        studyModeDuration: duration, isBlockingEnabled: true
      }, () => {
        els.blockingToggle.checked = true;
        els.toggleStatus.textContent = 'Activé';
        updateTimerDisplay();
        els.startStudyModeButton.disabled = true;
        els.timerDisplay.classList.remove('hidden');
      });
    }
  
    function cancelStudyMode() {
      chrome.storage.local.get('permanentBlockingState', data => {
        const wasEnabled = data.permanentBlockingState || false;
        chrome.storage.local.set({ 
          studyModeActive: false, studyModeEndTime: null, isBlockingEnabled: wasEnabled
        }, () => {
          els.blockingToggle.checked = wasEnabled;
          els.toggleStatus.textContent = wasEnabled ? 'Activé' : 'Désactivé';
          els.timerDisplay.classList.add('hidden');
          els.startStudyModeButton.disabled = false;
        });
      });
    }
  
    function updateTimerDisplay() {
      chrome.storage.local.get(['studyModeEndTime', 'studyModeDuration', 'studyModeActive'], data => {
        if (!data.studyModeActive) return;
        const now = Date.now();
        const timeLeft = Math.max(0, data.studyModeEndTime - now);
        
        if (timeLeft <= 0) return cancelStudyMode();
        
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
        els.timeRemainingSpan.textContent = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
        els.progressBar.style.width = `${(timeLeft / (data.studyModeDuration * 60 * 1000)) * 100}%`;
        setTimeout(updateTimerDisplay, 1000);
      });
    }
  
    function toggleBlocking() {
      chrome.storage.local.get('studyModeActive', data => {
        if (data.studyModeActive) {
          els.blockingToggle.checked = true;
          return alert('Le blocage ne peut pas être désactivé pendant le mode révision');
        }
        chrome.storage.local.set({ 
          isBlockingEnabled: els.blockingToggle.checked,
          permanentBlockingState: els.blockingToggle.checked
        });
        els.toggleStatus.textContent = els.blockingToggle.checked ? 'Activé' : 'Désactivé';
      });
    }
  
    function addSite() {
      const site = els.newSiteInput.value.trim().replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0];
      if (!site) return;
      chrome.storage.local.get('blockedSites', data => {
        const blockedSites = data.blockedSites || [];
        if (!blockedSites.includes(site)) {
          blockedSites.push(site);
          chrome.storage.local.set({ blockedSites }, () => {
            els.newSiteInput.value = '';
            load('blockedSites');
          });
        }
      });
    }
  
    function load(what) {
      const loaders = {
        blockedSites: () => chrome.storage.local.get('blockedSites', data => {
          const sites = data.blockedSites || [];
          els.sitesListDiv.innerHTML = '';
          
          if (sites.length === 0) {
            els.sitesListDiv.innerHTML = '<div class="empty-message">Aucun site bloqué</div>';
            return;
          }
          
          sites.forEach(site => {
            const div = document.createElement('div');
            div.className = 'site-item';
            div.innerHTML = `<span class="site-name">${site}</span><button class="delete-btn">X</button>`;
            div.querySelector('.delete-btn').addEventListener('click', () => {
              const newSites = sites.filter(s => s !== site);
              chrome.storage.local.set({ blockedSites: newSites }, () => load('blockedSites'));
            });
            els.sitesListDiv.appendChild(div);
          });
        }),
        blockingState: () => chrome.storage.local.get(['isBlockingEnabled', 'studyModeActive'], data => {
          els.blockingToggle.checked = data.isBlockingEnabled || false;
          els.toggleStatus.textContent = els.blockingToggle.checked ? 'Activé' : 'Désactivé';
          els.blockingToggle.disabled = data.studyModeActive || false;
        }),
        themeState: () => chrome.storage.local.get('isDarkMode', data => {
          if (data.isDarkMode) document.body.classList.add('dark-mode');
          els.themeIcon.textContent = data.isDarkMode ? '☀️' : '🌙';
        }),
        studyModeState: () => chrome.storage.local.get(['studyModeActive', 'studyModeDuration'], data => {
          els.studyDurationInput.value = data.studyModeDuration || 30;
          if (data.studyModeActive) {
            els.timerDisplay.classList.remove('hidden');
            els.startStudyModeButton.disabled = true;
            updateTimerDisplay();
          } else {
            els.timerDisplay.classList.add('hidden');
            els.startStudyModeButton.disabled = false;
          }
        })
      };
      loaders[what]();
    }
  });