import BasePresenter from '../../base/base-presenter.js';
import StoriesModel from './stories-model.js';
import StoriesView from './stories-view.js';
import MapManager from '../../utils/map-manager.js';
import NotificationService from '../../services/notification-service.js';
import AuthService from '../../services/auth-service.js';

class StoriesPresenter extends BasePresenter {
  constructor() {
    const model = new StoriesModel();
    const view = new StoriesView();
    
    super(model, view);
    this.mapManager = null;
    this.isFiltered = false;
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    try {
      const data = await this.model.fetchData();
      const storiesWithLocation = this.model.getStoriesWithLocation();

      this.mapManager = new MapManager('map');
      this.mapManager.initMap();

      this.mapManager.onMarkerClick = (story, index) => {
        this.view.highlightStory(index);
      };

      this.mapManager.onMapMove = (bounds) => {
        const filtered = this.model.filterStoriesByBounds(bounds);
        this.view.renderStoriesList(filtered);
        this.isFiltered = true;
        this.view.showResetButton();
      };

      this.mapManager.addMarkers(storiesWithLocation);

      this.view.setStories(storiesWithLocation);
      this.view.renderStoriesList(storiesWithLocation);

      this.view.onStoryClick = (storyId, index) => {
        this.mapManager.highlightMarker(index);
      };

      this.view.onFilterChange = (bounds) => {
        if (bounds === null) {
          const allStories = this.model.resetFilter();
          this.view.renderStoriesList(allStories);
          this.view.hideResetButton();
          this.isFiltered = false;
        }
      };

      await this.setupNotifications();
      this.view.bindEvents();

    } catch (error) {
      console.error('Error loading stories:', error);
      
      if (error.message.includes('Authentication') || error.message.includes('login')) {
        AuthService.logout();
        window.location.hash = '#/login';
      } else {
        const listContainer = document.getElementById('stories-list');
        if (listContainer) {
          listContainer.innerHTML = `
            <div class="error-message">
              <p>Failed to load stories: ${error.message}</p>
              <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
            </div>
          `;
        }
      }
    }
  }

  async setupNotifications() {
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationIcon = document.getElementById('notification-icon');
    const notificationText = document.getElementById('notification-text');

    if (!notificationToggle) return;

    try {
      await NotificationService.init();
      const isSubscribed = await NotificationService.isSubscribed();
      const permission = NotificationService.getPermissionStatus();

      this.updateNotificationButton(isSubscribed, permission, notificationIcon, notificationText);

      notificationToggle.addEventListener('click', async () => {
        notificationToggle.disabled = true;

        try {
          const currentlySubscribed = await NotificationService.isSubscribed();

          if (currentlySubscribed) {
            await NotificationService.unsubscribe();
            this.updateNotificationButton(false, 'default', notificationIcon, notificationText);
            this.showNotificationMessage('Notifications disabled', 'success');
          } else {
            await NotificationService.subscribe();
            this.updateNotificationButton(true, 'granted', notificationIcon, notificationText);
            this.showNotificationMessage('Notifications enabled! You will receive updates about new stories', 'success');
          }
        } catch (error) {
          console.error('Notification error:', error);
          this.showNotificationMessage(`Failed: ${error.message}`, 'error');
        } finally {
          notificationToggle.disabled = false;
        }
      });
    } catch (error) {
      console.error('Failed to setup notifications:', error);
      notificationToggle.style.display = 'none';
    }
  }

  updateNotificationButton(isSubscribed, permission, iconEl, textEl) {
    if (isSubscribed) {
      iconEl.textContent = '🔔';
      textEl.textContent = 'Disable Notifications';
    } else if (permission === 'denied') {
      iconEl.textContent = '🔕';
      textEl.textContent = 'Notifications Blocked';
    } else {
      iconEl.textContent = '🔔';
      textEl.textContent = 'Enable Notifications';
    }
  }

  showNotificationMessage(message, type) {
    const existingMessage = document.querySelector('.notification-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `notification-message notification-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }

  destroy() {
    if (this.mapManager) {
      this.mapManager.destroy();
    }
  }
}

export default StoriesPresenter;

