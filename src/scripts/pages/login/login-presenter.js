import BasePresenter from '../../base/base-presenter.js';
import LoginModel from './login-model.js';
import LoginView from './login-view.js';
import NavigationState from '../../utils/navigation-state.js';

class LoginPresenter extends BasePresenter {
  constructor() {
    const model = new LoginModel();
    const view = new LoginView();
    
    super(model, view);
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    const isAuth = this.model.isAuthenticated();
    
    if (isAuth) {
      NavigationState.setRedirecting(true);
      window.location.hash = '#/stories';
      return;
    }

    this.view.onLogin = async (credentials) => {
      try {
        await this.model.login(credentials);
        this.view.showSuccess();
        
        NavigationState.setRedirecting(true);
        
        setTimeout(() => {
          window.location.hash = '#/stories';
        }, 500);
      } catch (error) {
        throw error;
      }
    };

    this.view.bindEvents();
  }
}

export default LoginPresenter;

