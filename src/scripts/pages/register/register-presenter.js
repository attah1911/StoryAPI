import BasePresenter from '../../base/base-presenter.js';
import RegisterModel from './register-model.js';
import RegisterView from './register-view.js';

class RegisterPresenter extends BasePresenter {
  constructor() {
    const model = new RegisterModel();
    const view = new RegisterView();
    
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

    this.view.onRegister = async (credentials) => {
      try {
        await this.model.register(credentials);
        
        await this.model.autoLogin({ 
          email: credentials.email, 
          password: credentials.password 
        });
        
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

export default RegisterPresenter;

