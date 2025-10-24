import BaseView from '../../base/base-view.js';

class LoginView extends BaseView {
  constructor() {
    super();
    this.onLogin = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="login-container">
          <div class="login-card">
            <h1 class="login-title">Login to Story App</h1>
            <p class="login-subtitle">Login to explore and share stories</p>
            
            <form id="login-form" class="login-form">
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="your@email.com"
                  autocomplete="email"
                />
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  placeholder="Min. 8 characters"
                  minlength="8"
                  autocomplete="current-password"
                />
              </div>
              
              <div id="error-message" class="error-message" role="alert" aria-live="polite" style="display: none;"></div>
              
              <button type="submit" class="btn btn-primary btn-block" id="login-button">
                Login
              </button>
            </form>
            
            <div class="login-footer">
              <p>Don't have an account? <a href="#/register" class="link-primary">Register here</a></p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginButton = document.getElementById('login-button');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorMessage.style.display = 'none';
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        const formData = new FormData(form);
        const credentials = {
          email: formData.get('email'),
          password: formData.get('password'),
        };

        if (this.onLogin) {
          try {
            await this.onLogin(credentials);
          } catch (error) {
            this.showError(error.message);
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
          }
        }
      });
    }
  }

  showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  }

  showSuccess() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.textContent = '✓ Success!';
      loginButton.style.backgroundColor = '#28a745';
    }
  }
}

export default LoginView;

