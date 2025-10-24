import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import AuthService from './services/auth-service.js';
import NavigationState from './utils/navigation-state.js';
import SyncService from './services/sync-service.js';

function updateAuthLink() {
  const authLink = document.getElementById('auth-link');
  const registerNavItem = document.getElementById('register-nav-item');
  const favoritesNavItem = document.getElementById('favorites-nav-item');
  
  if (authLink) {
    if (AuthService.isAuthenticated()) {
      authLink.textContent = 'Logout';
      authLink.href = '#/logout';
      authLink.addEventListener('click', (e) => {
        if (authLink.textContent === 'Logout') {
          e.preventDefault();
          AuthService.logout();
          window.location.hash = '#/';
          setTimeout(updateAuthLink, 100);
        }
      });
      
      if (registerNavItem) {
        registerNavItem.style.display = 'none';
      }
      if (favoritesNavItem) {
        favoritesNavItem.style.display = 'block';
      }
    } else {
      authLink.textContent = 'Login';
      authLink.href = '#/login';
      
      if (registerNavItem) {
        registerNavItem.style.display = 'block';
      }
      if (favoritesNavItem) {
        favoritesNavItem.style.display = 'none';
      }
    }
  }
}

function setupSkipLink() {
  const skipLink = document.getElementById('skip-link');
  const mainContent = document.getElementById('main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.addEventListener('blur', () => {
        mainContent.removeAttribute('tabindex');
      }, { once: true });
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.querySelector('#main-content');
  
  const app = new App({
    content: mainContent,
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  setupSkipLink();
  updateAuthLink();
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    const skipTransition = NavigationState.getRedirecting();
    NavigationState.resetRedirecting();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    await app.renderPage(skipTransition);
    updateAuthLink();
  });
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const url = new URL(event.data.url);
        window.location.hash = url.hash || '#/stories';
      }
    });
  }

  window.addEventListener('online', async () => {
    console.log('App is online');
    showSyncNotification('Back online! Syncing...', 'info');
    
    if (AuthService.isAuthenticated()) {
      const result = await SyncService.syncOfflineStories();
      if (result.success && result.results.synced > 0) {
        showSyncNotification(`✓ ${result.results.synced} stories synced successfully!`, 'success');
      }
    }
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    showSyncNotification('You are offline. Stories will be saved locally.', 'warning');
  });

  async function checkUnsyncedStories() {
    if (!AuthService.isAuthenticated()) return;
    
    const hasUnsynced = await SyncService.hasUnsyncedData();
    if (hasUnsynced && navigator.onLine) {
      const count = await SyncService.getUnsyncedCount();
      showSyncNotification(`You have ${count} unsynced story(ies). Syncing...`, 'info');
      
      const result = await SyncService.syncOfflineStories();
      if (result.success && result.results.synced > 0) {
        showSyncNotification(`✓ ${result.results.synced} stories synced!`, 'success');
      }
    }
  }

  setTimeout(checkUnsyncedStories, 2000);
});

function showSyncNotification(message, type = 'info') {
  const existing = document.querySelector('.sync-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'sync-notification';
  notification.textContent = message;
  
  let bgColor = '#3b82f6';
  if (type === 'success') bgColor = '#10b981';
  if (type === 'warning') bgColor = '#f59e0b';
  if (type === 'error') bgColor = '#ef4444';
  
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
