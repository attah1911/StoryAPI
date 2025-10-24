import FavoritesModel from './favorites-model.js';
import FavoritesView from './favorites-view.js';
import FavoritesPresenter from './favorites-presenter.js';
import AuthService from '../../services/auth-service.js';
import NavigationState from '../../utils/navigation-state.js';

export default class FavoritesPage {
  constructor() {
    this.model = null;
    this.view = null;
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

    this.view = new FavoritesView();
    return this.view.getTemplate();
  }

  async afterRender() {
    if (!AuthService.isAuthenticated()) {
      return;
    }

    this.model = new FavoritesModel();
    this.view = new FavoritesView();
    this.presenter = new FavoritesPresenter(this.model, this.view);

    await this.presenter.init();
  }
}

