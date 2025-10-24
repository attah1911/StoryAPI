import BaseModel from '../../base/base-model.js';
import AuthService from '../../services/auth-service.js';

class LoginModel extends BaseModel {
  async login({ email, password }) {
    return await AuthService.login({ email, password });
  }

  isAuthenticated() {
    return AuthService.isAuthenticated();
  }

  getUser() {
    return AuthService.getUser();
  }

  async fetchData() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getUser(),
    };
  }
}

export default LoginModel;

