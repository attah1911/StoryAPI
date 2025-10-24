import BaseView from '../../base/base-view.js';

class StoryDetailView extends BaseView {
  constructor() {
    super();
    this.story = null;
  }

  setStory(story) {
    this.story = story;
  }

  getTemplate() {
    if (!this.story) {
      return `
        <section class="container">
          <div class="story-detail-loading">
            <p>Loading story...</p>
          </div>
        </section>
      `;
    }

    const { name, description, photoUrl, createdAt, lat, lon } = this.story;
    const formattedDate = this.formatDate(createdAt);
    const hasLocation = lat && lon;

    return `
      <section class="story-detail-page">
        <div class="container">
          <div class="story-detail-header">
            <button id="back-btn" class="btn-back" aria-label="Go back">
              ← Back
            </button>
            <h1>Story Detail</h1>
          </div>

          <div class="story-detail-content">
            <div class="story-detail-main">
              <div class="story-detail-image">
                <img src="${photoUrl}" alt="Story photo by ${name}" />
              </div>

              <div class="story-detail-info">
                <div class="story-author">
                  <div class="author-avatar">${name.charAt(0).toUpperCase()}</div>
                  <div class="author-details">
                    <h2 class="author-name">${name}</h2>
                    <time class="story-date" datetime="${createdAt}">${formattedDate}</time>
                  </div>
                  <button id="favorite-btn" class="btn-favorite" aria-label="Add to favorites" data-story-id="${this.story.id}">
                    <span class="favorite-icon">⭐</span>
                    <span class="favorite-text">Add to Favorites</span>
                  </button>
                </div>

                <div class="story-description">
                  <p>${description}</p>
                </div>

                ${hasLocation ? `
                  <div class="story-location-info">
                    <h3>📍 Location</h3>
                    <p>Latitude: ${lat.toFixed(6)}</p>
                    <p>Longitude: ${lon.toFixed(6)}</p>
                  </div>
                ` : ''}
              </div>
            </div>

            ${hasLocation ? `
              <div class="story-detail-map-container">
                <h3>Location on Map</h3>
                <div id="story-detail-map" class="story-detail-map"></div>
              </div>
            ` : ''}
          </div>
        </div>
      </section>
    `;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  updateFavoriteButton(isFavorite) {
    const btn = document.getElementById('favorite-btn');
    if (btn) {
      const icon = btn.querySelector('.favorite-icon');
      const text = btn.querySelector('.favorite-text');
      
      if (isFavorite) {
        icon.textContent = '⭐';
        text.textContent = 'Remove from Favorites';
        btn.classList.add('is-favorite');
      } else {
        icon.textContent = '☆';
        text.textContent = 'Add to Favorites';
        btn.classList.remove('is-favorite');
      }
    }
  }

  bindEvents() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }
  }
}

export default StoryDetailView;

