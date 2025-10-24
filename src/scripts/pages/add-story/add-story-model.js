import BaseModel from '../../base/base-model.js';
import StoryService from '../../services/story-service.js';

class AddStoryModel extends BaseModel {
  async createStory({ description, photo, lat, lon }) {
    return await StoryService.createStory({ description, photo, lat, lon });
  }

  validateStory({ description, photo, lat, lon }) {
    const errors = [];

    if (!description || description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (description && description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (!photo) {
      errors.push('Photo is required');
    }

    if (photo && photo.size > 1024 * 1024) {
      errors.push('Photo size must be less than 1MB');
    }

    if (photo && !photo.type.startsWith('image/')) {
      errors.push('File must be an image');
    }

    if (!lat || !lon) {
      errors.push('Location is required. Click on the map to select a location');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async fetchData() {
    return {};
  }
}

export default AddStoryModel;

