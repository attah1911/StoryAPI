import BaseView from '../../base/base-view.js';

class StoriesView extends BaseView {
  constructor() {
    super();
    this.stories = [];
    this.onStoryClick = null;
    this.onFilterChange = null;
  }

  setStories(stories) {
    this.stories = stories;
  }

  getTemplate() {
    return `
      <section class="stories-page">
        <div class="stories-header">
          <div class="container">
            <div class="stories-header-content">
              <div>
                <h1>Explore Stories</h1>
                <p>Discover stories shared by Dicoding community</p>
              </div>
              <div class="stories-actions">
                <button id="notification-toggle" class="btn btn-secondary" aria-label="Toggle notifications">
                  <span id="notification-icon">🔔</span>
                  <span id="notification-text">Enable Notifications</span>
                </button>
                <a href="#/add-story" class="btn btn-primary">
                  ➕ Share Story
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stories-content">
          <div class="stories-sidebar" id="stories-sidebar">
            <div class="sidebar-header">
              <h2>Stories (<span id="story-count">0</span>)</h2>
              <button id="reset-filter" class="btn-reset" style="display: none;">
                Reset Filter
              </button>
            </div>
            <div class="stories-list" id="stories-list">
              <div class="loading">Loading stories...</div>
            </div>
          </div>
          
          <div class="stories-map-container">
            <div id="map" class="map"></div>
          </div>
        </div>
      </section>
    `;
  }

  renderStoriesList(stories) {
    const listContainer = document.getElementById('stories-list');
    const countElement = document.getElementById('story-count');
    
    if (!listContainer) return;

    countElement.textContent = stories.length;

    if (stories.length === 0) {
      listContainer.innerHTML = '<div class="no-stories">No stories found in this area</div>';
      return;
    }

    listContainer.innerHTML = stories.map((story, index) => `
      <article class="story-card" data-story-id="${story.id}" data-index="${index}" role="button" tabindex="0">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="Story photo by ${story.name}" loading="lazy" />
        </div>
        <div class="story-info">
          <h3 class="story-name">${story.name}</h3>
          <p class="story-description">${this.truncateText(story.description, 80)}</p>
          <div class="story-meta">
            <span class="story-date">${this.formatDate(story.createdAt)}</span>
            ${story.lat && story.lon ? '<span class="story-location" aria-label="Story has location">📍 Has location</span>' : ''}
          </div>
          <div class="story-actions">
            <a href="#/story/${story.id}" class="btn-view-detail">View Details →</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  bindEvents() {
    const listContainer = document.getElementById('stories-list');
    const resetButton = document.getElementById('reset-filter');

    if (listContainer) {
      listContainer.addEventListener('click', (e) => {
        const storyCard = e.target.closest('.story-card');
        if (storyCard && this.onStoryClick) {
          const storyId = storyCard.dataset.storyId;
          const index = parseInt(storyCard.dataset.index);
          this.onStoryClick(storyId, index);
        }
      });

      listContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const storyCard = e.target.closest('.story-card');
          if (storyCard && this.onStoryClick) {
            e.preventDefault();
            const storyId = storyCard.dataset.storyId;
            const index = parseInt(storyCard.dataset.index);
            this.onStoryClick(storyId, index);
          }
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (this.onFilterChange) {
          this.onFilterChange(null);
        }
      });
    }
  }

  showResetButton() {
    const resetButton = document.getElementById('reset-filter');
    if (resetButton) {
      resetButton.style.display = 'inline-block';
    }
  }

  hideResetButton() {
    const resetButton = document.getElementById('reset-filter');
    if (resetButton) {
      resetButton.style.display = 'none';
    }
  }

  highlightStory(index) {
    const cards = document.querySelectorAll('.story-card');
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('active');
      }
    });
  }
}

export default StoriesView;

