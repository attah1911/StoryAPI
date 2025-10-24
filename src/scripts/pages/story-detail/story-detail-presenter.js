import BasePresenter from '../../base/base-presenter.js';
import StoryDetailModel from './story-detail-model.js';
import StoryDetailView from './story-detail-view.js';
import IndexedDB from '../../utils/indexed-db.js';
import AuthService from '../../services/auth-service.js';
import L from 'leaflet';

class StoryDetailPresenter extends BasePresenter {
  constructor(storyId) {
    const model = new StoryDetailModel();
    const view = new StoryDetailView();
    
    super(model, view);
    this.storyId = storyId;
    this.map = null;
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    try {
      const story = await this.model.fetchData(this.storyId);
      this.view.setStory(story);
      
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.innerHTML = this.view.getTemplate();
      }

      if (story.lat && story.lon) {
        this.initMap(story.lat, story.lon, story.name);
      }

      this.view.bindEvents();
      
      if (AuthService.isAuthenticated()) {
        await this.setupFavoriteButton(story);
      } else {
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
          favoriteBtn.style.display = 'none';
        }
      }
    } catch (error) {
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.innerHTML = `
          <section class="container">
            <div class="story-detail-error">
              <h2>Story Not Found</h2>
              <p>${error.message}</p>
              <button onclick="window.history.back()" class="btn btn-primary">Go Back</button>
            </div>
          </section>
        `;
      }
    }
  }

  async setupFavoriteButton(story) {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;

    const isFavorite = await IndexedDB.isFavorite(story.id);
    this.view.updateFavoriteButton(isFavorite);

    favoriteBtn.addEventListener('click', async () => {
      try {
        const currentlyFavorite = await IndexedDB.isFavorite(story.id);
        
        if (currentlyFavorite) {
          await IndexedDB.removeFavorite(story.id);
          this.view.updateFavoriteButton(false);
          this.showMessage('Removed from favorites', 'success');
        } else {
          await IndexedDB.addFavorite(story);
          this.view.updateFavoriteButton(true);
          this.showMessage('Added to favorites', 'success');
        }
      } catch (error) {
        console.error('Favorite error:', error);
        this.showMessage('Failed to update favorites', 'error');
      }
    });
  }

  showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = 'position: fixed; top: 80px; right: 20px; padding: 15px 20px; border-radius: 8px; z-index: 1000; animation: slideInRight 0.3s ease-out;';
    
    if (type === 'error') {
      messageEl.style.background = '#ef4444';
      messageEl.style.color = 'white';
    } else {
      messageEl.style.background = '#10b981';
      messageEl.style.color = 'white';
    }
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  initMap(lat, lon, name) {
    const mapContainer = document.getElementById('story-detail-map');
    if (!mapContainer) return;

    try {
      this.map = L.map('story-detail-map').setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEMxOC42MjcgMCAyNCA1LjM3MyAyNCAxMmMwIDkuNjI3LTEyIDI0LTEyIDI0UzAgMjEuNjI3IDAgMTJDMCA1LjM3MyA1LjM3MyAwIDEyIDB6IiBmaWxsPSIjZmYwMDAwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
          iconSize: [32, 45],
          iconAnchor: [16, 45],
          popupAnchor: [0, -45],
        }),
      })
        .addTo(this.map)
        .bindPopup(`Story by ${name}`)
        .openPopup();

      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export default StoryDetailPresenter;

