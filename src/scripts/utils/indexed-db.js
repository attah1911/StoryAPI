const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_FAVORITES = 'favorites';
const STORE_OFFLINE_STORIES = 'offline-stories';

class IndexedDBHelper {
  constructor() {
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
          const favStore = db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
          favStore.createIndex('name', 'name', { unique: false });
          favStore.createIndex('createdAt', 'createdAt', { unique: false });
          favStore.createIndex('savedAt', 'savedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_OFFLINE_STORIES)) {
          const offlineStore = db.createObjectStore(STORE_OFFLINE_STORIES, { keyPath: 'tempId', autoIncrement: true });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          offlineStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.openDB();
    }
  }

  async addFavorite(story) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_FAVORITES], 'readwrite');
      const store = transaction.objectStore(STORE_FAVORITES);
      const favoriteStory = {
        ...story,
        savedAt: new Date().toISOString()
      };
      const request = store.add(favoriteStory);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to add favorite'));
    });
  }

  async removeFavorite(storyId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_FAVORITES], 'readwrite');
      const store = transaction.objectStore(STORE_FAVORITES);
      const request = store.delete(storyId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove favorite'));
    });
  }

  async getAllFavorites() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_FAVORITES], 'readonly');
      const store = transaction.objectStore(STORE_FAVORITES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get favorites'));
    });
  }

  async getFavorite(storyId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_FAVORITES], 'readonly');
      const store = transaction.objectStore(STORE_FAVORITES);
      const request = store.get(storyId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get favorite'));
    });
  }

  async isFavorite(storyId) {
    const favorite = await this.getFavorite(storyId);
    return !!favorite;
  }

  async searchFavorites(query) {
    const favorites = await this.getAllFavorites();
    const lowerQuery = query.toLowerCase();
    return favorites.filter(story => 
      story.name.toLowerCase().includes(lowerQuery) ||
      story.description.toLowerCase().includes(lowerQuery)
    );
  }

  async sortFavorites(sortBy = 'savedAt', order = 'desc') {
    const favorites = await this.getAllFavorites();
    return favorites.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  async addOfflineStory(storyData) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_OFFLINE_STORIES], 'readwrite');
      const store = transaction.objectStore(STORE_OFFLINE_STORIES);
      const offlineStory = {
        ...storyData,
        synced: false,
        createdAt: new Date().toISOString()
      };
      const request = store.add(offlineStory);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to add offline story'));
    });
  }

  async getUnsyncedStories() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_OFFLINE_STORIES], 'readonly');
      const store = transaction.objectStore(STORE_OFFLINE_STORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        const allStories = request.result;
        const unsyncedStories = allStories.filter(story => story.synced === false);
        resolve(unsyncedStories);
      };
      request.onerror = () => reject(new Error('Failed to get unsynced stories'));
    });
  }

  async markStorySynced(tempId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_OFFLINE_STORIES], 'readwrite');
      const store = transaction.objectStore(STORE_OFFLINE_STORIES);
      const getRequest = store.get(tempId);

      getRequest.onsuccess = () => {
        const story = getRequest.result;
        if (story) {
          story.synced = true;
          const updateRequest = store.put(story);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('Failed to mark story as synced'));
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(new Error('Failed to get story'));
    });
  }

  async deleteOfflineStory(tempId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_OFFLINE_STORIES], 'readwrite');
      const store = transaction.objectStore(STORE_OFFLINE_STORIES);
      const request = store.delete(tempId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete offline story'));
    });
  }
}

export default new IndexedDBHelper();

