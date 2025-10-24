import BaseModel from '../../base/base-model.js';
import StoryService from '../../services/story-service.js';
import AuthService from '../../services/auth-service.js';

class HomeModel extends BaseModel {
  constructor() {
    super();
    this.data = null;
  }

  async fetchData() {
    const isAuthenticated = AuthService.isAuthenticated();
    
    if (!isAuthenticated) {
      this.data = {
        title: 'Welcome to Story App',
        description: 'Share your stories with Dicoding community',
        isAuthenticated: false,
        stats: null,
      };
      
      return this.data;
    }

    try {
      const stories = await StoryService.getAllStories({ page: 1, size: 100, location: 0 });
      
      const uniqueUsers = new Set(stories.map(story => story.name)).size;
      
      this.data = {
        title: 'Welcome to Story App',
        description: 'Share your stories with Dicoding community',
        isAuthenticated: true,
        stats: {
          totalStories: stories.length,
          activeUsers: uniqueUsers,
        },
      };
      
      return this.data;
    } catch (error) {
      this.data = {
        title: 'Welcome to Story App',
        description: 'Share your stories with Dicoding community',
        isAuthenticated: true,
        stats: {
          totalStories: 0,
          activeUsers: 0,
        },
      };
      
      return this.data;
    }
  }

  getData() {
    return this.data;
  }
}

export default HomeModel;

