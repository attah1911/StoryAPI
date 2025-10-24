import BaseModel from '../../base/base-model.js';
import AuthService from '../../services/auth-service.js';

class RegisterModel extends BaseModel {
  async register({ name, email, password }) {
    return await AuthService.register({ name, email, password });
  }

  async autoLogin({ email, password }) {
    return await AuthService.login({ email, password });
  }

  isAuthenticated() {
    return AuthService.isAuthenticated();
  }

  async fetchData() {
    return {
      isAuthenticated: this.isAuthenticated(),
    };
  }
}

export default RegisterModel;

