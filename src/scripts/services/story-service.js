import API_CONFIG from '../config/api-config.js';
import AuthService from './auth-service.js';

class StoryService {
  async getAllStories({ page = 1, size = 10, location = 1 } = {}) {
    const token = AuthService.getToken();

    const url = new URL(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES}`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', location);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stories');
    }

    return data.listStory || [];
  }

  async getStoryDetail(id) {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch story detail');
    }

    return data;
  }

  async createStory({ description, photo, lat, lon }) {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined && lat !== null) {
      formData.append('lat', lat);
    }
    if (lon !== undefined && lon !== null) {
      formData.append('lon', lon);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create story');
    }

    return data;
  }

  async createStoryGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined && lat !== null) {
      formData.append('lat', lat);
    }
    if (lon !== undefined && lon !== null) {
      formData.append('lon', lon);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES_GUEST}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create story');
    }

    return data;
  }
}

export default new StoryService();

