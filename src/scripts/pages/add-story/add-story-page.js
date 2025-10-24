import AddStoryPresenter from './add-story-presenter.js';
import AuthService from '../../services/auth-service.js';
import NavigationState from '../../utils/navigation-state.js';

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter();
  }

  async render() {
    if (!AuthService.isAuthenticated()) {
      NavigationState.setRedirecting(true);
      
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 0);
      return '<div class="container"><p style="text-align: center; padding: 40px;">Redirecting to login...</p></div>';
    }
    
    return await this.presenter.render();
  }

  async afterRender() {
    if (!AuthService.isAuthenticated()) {
      return;
    }
    
    return await this.presenter.afterRender();
  }
}

