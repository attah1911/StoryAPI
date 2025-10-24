import API_CONFIG from '../config/api-config.js';

class AuthService {
  static TOKEN_KEY = 'auth_token';
  static USER_KEY = 'user_data';

  async register({ name, email, password }) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }

  async login({ email, password }) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.loginResult) {
      this.saveToken(data.loginResult.token);
      this.saveUser({
        userId: data.loginResult.userId,
        name: data.loginResult.name,
      });
    }

    return data;
  }

  saveToken(token) {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  saveUser(userData) {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(userData));
  }

  getUser() {
    const userData = localStorage.getItem(AuthService.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
  }
}

export default new AuthService();

