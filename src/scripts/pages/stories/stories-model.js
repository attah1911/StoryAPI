import BaseModel from '../../base/base-model.js';
import StoryService from '../../services/story-service.js';
import AuthService from '../../services/auth-service.js';

class StoriesModel extends BaseModel {
  constructor() {
    super();
    this.stories = [];
    this.filteredStories = [];
  }

  async fetchData() {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Please login first');
    }

    const stories = await StoryService.getAllStories({ 
      size: 100, 
      location: 1 
    });
    
    this.stories = stories || [];
    this.filteredStories = this.stories;
    
    return {
      stories: this.stories,
      total: this.stories.length,
    };
  }

  getStoriesWithLocation() {
    return this.stories.filter(story => story.lat && story.lon);
  }

  filterStoriesByBounds(bounds) {
    this.filteredStories = this.stories.filter(story => {
      if (!story.lat || !story.lon) return false;
      return bounds.contains([story.lat, story.lon]);
    });
    return this.filteredStories;
  }

  resetFilter() {
    this.filteredStories = this.stories;
    return this.filteredStories;
  }

  getFilteredStories() {
    return this.filteredStories;
  }
}

export default StoriesModel;

