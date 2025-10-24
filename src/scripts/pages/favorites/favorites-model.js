import IndexedDB from '../../utils/indexed-db.js';

class FavoritesModel {
  constructor() {
    this.favorites = [];
  }

  async getFavorites() {
    try {
      this.favorites = await IndexedDB.getAllFavorites();
      return this.favorites;
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  async searchFavorites(query) {
    try {
      return await IndexedDB.searchFavorites(query);
    } catch (error) {
      console.error('Failed to search favorites:', error);
      return [];
    }
  }

  async sortFavorites(sortBy, order) {
    try {
      return await IndexedDB.sortFavorites(sortBy, order);
    } catch (error) {
      console.error('Failed to sort favorites:', error);
      return [];
    }
  }

  async removeFavorite(storyId) {
    try {
      await IndexedDB.removeFavorite(storyId);
      this.favorites = this.favorites.filter(f => f.id !== storyId);
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }
}

export default FavoritesModel;

