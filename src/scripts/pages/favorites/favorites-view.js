class FavoritesView {
  getTemplate() {
    return `
      <div class="container favorites-container">
        <div class="favorites-header">
          <h1>My Favorites</h1>
          <p>Stories you've bookmarked for later</p>
        </div>

        <div class="favorites-controls">
          <div class="search-box">
            <input 
              type="search" 
              id="favorites-search" 
              placeholder="Search favorites..."
              aria-label="Search favorites"
            />
          </div>
          
          <div class="sort-controls">
            <label for="sort-by">Sort by:</label>
            <select id="sort-by" aria-label="Sort favorites by">
              <option value="savedAt-desc">Recently Saved</option>
              <option value="savedAt-asc">Oldest Saved</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="createdAt-desc">Recently Created</option>
              <option value="createdAt-asc">Oldest Created</option>
            </select>
          </div>
        </div>

        <div id="favorites-list" class="favorites-list">
          <div class="loading">Loading favorites...</div>
        </div>
      </div>
    `;
  }

  renderFavorites(favorites) {
    const container = document.getElementById('favorites-list');
    
    if (!favorites || favorites.length === 0) {
      container.innerHTML = `
        <div class="no-favorites">
          <div class="no-favorites-icon">⭐</div>
          <h3>No Favorites Yet</h3>
          <p>Start adding stories to your favorites to see them here</p>
          <a href="#/stories" class="btn btn-primary">Browse Stories</a>
        </div>
      `;
      return;
    }

    container.innerHTML = favorites.map(story => `
      <div class="favorite-card" data-story-id="${story.id}">
        <div class="favorite-image">
          <img src="${story.photoUrl}" alt="${story.name}'s story" loading="lazy" />
        </div>
        <div class="favorite-content">
          <h3>${story.name}</h3>
          <p class="favorite-description">${story.description}</p>
          <div class="favorite-meta">
            <span class="favorite-date">Created: ${this.formatDate(story.createdAt)}</span>
            <span class="favorite-saved">Saved: ${this.formatDate(story.savedAt)}</span>
          </div>
          <div class="favorite-actions">
            <a href="#/story/${story.id}" class="btn btn-secondary">View Details</a>
            <button class="btn-remove-favorite" data-id="${story.id}" aria-label="Remove from favorites">
              ❌ Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  showMessage(message, type = 'info') {
    const container = document.getElementById('favorites-list');
    const messageClass = type === 'error' ? 'error-message' : 'success-message';
    
    const messageEl = document.createElement('div');
    messageEl.className = messageClass;
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
}

export default FavoritesView;

