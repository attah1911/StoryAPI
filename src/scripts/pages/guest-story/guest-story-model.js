import BaseModel from '../../base/base-model.js';
import StoryService from '../../services/story-service.js';

class GuestStoryModel extends BaseModel {
  constructor() {
    super();
  }

  async fetchData() {
    return {};
  }

  async createGuestStory({ description, photo, lat, lon }) {
    return await StoryService.createStoryGuest({ description, photo, lat, lon });
  }

  validateStory({ description, photo, lat, lon }) {
    const errors = [];

    if (!description || description.trim().length === 0) {
      errors.push('Story description is required');
    }

    if (description && description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (!photo) {
      errors.push('Photo is required');
    } else if (photo.size > 1024 * 1024) {
      errors.push('Photo size must be less than 1MB');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (photo && !validTypes.includes(photo.type)) {
      errors.push('Photo must be JPG, PNG, or GIF');
    }

    if (!lat || !lon) {
      errors.push('Location is required. Please select a location on the map');
    }

    return errors;
  }
}

export default GuestStoryModel;

