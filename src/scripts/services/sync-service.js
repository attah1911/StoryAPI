import IndexedDB from '../utils/indexed-db.js';
import StoryService from './story-service.js';
import AuthService from './auth-service.js';

class SyncService {
  constructor() {
    this.isSyncing = false;
  }

  async syncOfflineStories() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return {
        success: false,
        message: 'Sync already in progress'
      };
    }

    if (!AuthService.isAuthenticated()) {
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    if (!navigator.onLine) {
      return {
        success: false,
        message: 'No internet connection'
      };
    }

    this.isSyncing = true;
    const results = {
      total: 0,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      const unsyncedStories = await IndexedDB.getUnsyncedStories();
      results.total = unsyncedStories.length;

      if (unsyncedStories.length === 0) {
        this.isSyncing = false;
        return {
          success: true,
          message: 'No stories to sync',
          results
        };
      }

      for (const story of unsyncedStories) {
        try {
          await StoryService.addStory(story.description, story.photo, story.lat, story.lon);
          await IndexedDB.markStorySynced(story.tempId);
          results.synced++;
        } catch (error) {
          console.error('Failed to sync story:', error);
          results.failed++;
          results.errors.push({
            storyId: story.tempId,
            error: error.message
          });
        }
      }

      this.isSyncing = false;
      return {
        success: true,
        message: `Synced ${results.synced} out of ${results.total} stories`,
        results
      };
    } catch (error) {
      this.isSyncing = false;
      return {
        success: false,
        message: error.message,
        results
      };
    }
  }

  async hasUnsyncedData() {
    const unsyncedStories = await IndexedDB.getUnsyncedStories();
    return unsyncedStories.length > 0;
  }

  async getUnsyncedCount() {
    const unsyncedStories = await IndexedDB.getUnsyncedStories();
    return unsyncedStories.length;
  }
}

export default new SyncService();

