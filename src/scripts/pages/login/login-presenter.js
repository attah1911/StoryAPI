import BasePresenter from '../../base/base-presenter.js';
import LoginModel from './login-model.js';
import LoginView from './login-view.js';

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
      const NavigationState = (await import('../../utils/navigation-state.js')).default;
      NavigationState.setRedirecting(true);
      window.location.hash = '#/stories';
      return;
    }

    this.view.onLogin = async (credentials) => {
      try {
        await this.model.login(credentials);
        this.view.showSuccess();
        
        const NavigationState = (await import('../../utils/navigation-state.js')).default;
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

