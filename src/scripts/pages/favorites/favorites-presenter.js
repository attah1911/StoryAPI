import FavoritesModel from './favorites-model.js';
import FavoritesView from './favorites-view.js';

class FavoritesPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.searchTimeout = null;
  }

  async init() {
    await this.loadFavorites();
    this.attachEventListeners();
  }

  async loadFavorites() {
    const favorites = await this.model.getFavorites();
    this.view.renderFavorites(favorites);
  }

  attachEventListeners() {
    const searchInput = document.getElementById('favorites-search');
    const sortSelect = document.getElementById('sort-by');
    const favoritesList = document.getElementById('favorites-list');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.handleSort(e.target.value);
      });
    }

    if (favoritesList) {
      favoritesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-favorite')) {
          const storyId = e.target.dataset.id;
          this.handleRemove(storyId);
        }
      });
    }
  }

  async handleSearch(query) {
    if (!query.trim()) {
      await this.loadFavorites();
      return;
    }

    const results = await this.model.searchFavorites(query);
    this.view.renderFavorites(results);
  }

  async handleSort(value) {
    const [sortBy, order] = value.split('-');
    const sorted = await this.model.sortFavorites(sortBy, order);
    this.view.renderFavorites(sorted);
  }

  async handleRemove(storyId) {
    if (!confirm('Remove this story from favorites?')) {
      return;
    }

    const success = await this.model.removeFavorite(storyId);
    if (success) {
      this.view.showMessage('Removed from favorites', 'success');
      await this.loadFavorites();
    } else {
      this.view.showMessage('Failed to remove from favorites', 'error');
    }
  }

  destroy() {
    const searchInput = document.getElementById('favorites-search');
    const sortSelect = document.getElementById('sort-by');
    
    if (searchInput) {
      searchInput.removeEventListener('input', this.handleSearch);
    }
    if (sortSelect) {
      sortSelect.removeEventListener('change', this.handleSort);
    }
  }
}

export default FavoritesPresenter;

