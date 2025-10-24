import BaseView from '../../base/base-view.js';

class RegisterView extends BaseView {
  constructor() {
    super();
    this.onRegister = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="login-container">
          <div class="login-card">
            <h1 class="login-title">Create Account</h1>
            <p class="login-subtitle">Join the Dicoding Story community</p>
            
            <form id="register-form" class="login-form">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Your full name"
                  autocomplete="name"
                />
              </div>
              
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
                  autocomplete="new-password"
                />
              </div>
              
              <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirm-password" 
                  required 
                  placeholder="Confirm your password"
                  minlength="8"
                  autocomplete="new-password"
                />
              </div>
              
              <div id="error-message" class="error-message" role="alert" aria-live="polite" style="display: none;"></div>
              
              <button type="submit" class="btn btn-primary btn-block" id="register-button">
                Create Account
              </button>
            </form>
            
            <div class="login-footer">
              <p>Already have an account? <a href="#/login" class="link-primary">Login here</a></p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const registerButton = document.getElementById('register-button');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorMessage.style.display = 'none';
        
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if (password !== confirmPassword) {
          this.showError('Passwords do not match');
          return;
        }

        registerButton.disabled = true;
        registerButton.textContent = 'Creating account...';

        const credentials = { name, email, password };

        if (this.onRegister) {
          try {
            await this.onRegister(credentials);
          } catch (error) {
            this.showError(error.message);
            registerButton.disabled = false;
            registerButton.textContent = 'Create Account';
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
    const registerButton = document.getElementById('register-button');
    if (registerButton) {
      registerButton.textContent = '✓ Success! Logging in...';
      registerButton.style.backgroundColor = '#28a745';
    }
  }
}

export default RegisterView;

