import StoryDetailPresenter from './story-detail-presenter.js';
import AuthService from '../../services/auth-service.js';
import NavigationState from '../../utils/navigation-state.js';

export default class StoryDetailPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    if (!AuthService.isAuthenticated()) {
      NavigationState.setRedirecting(true);
      
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 0);
      return '<div class="container"><p style="text-align: center; padding: 40px;">Redirecting to login...</p></div>';
    }

    const hash = window.location.hash;
    const storyId = hash.split('/').pop();
    
    if (!storyId || storyId === '#story') {
      return '<div class="container"><p style="text-align: center; padding: 40px;">Invalid story ID</p></div>';
    }

    this.presenter = new StoryDetailPresenter(storyId);
    return await this.presenter.render();
  }

  async afterRender() {
    if (!AuthService.isAuthenticated()) {
      return;
    }

    if (this.presenter) {
      return await this.presenter.afterRender();
    }
  }
}

