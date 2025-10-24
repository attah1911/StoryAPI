import BaseView from '../../base/base-view.js';

class HomeView extends BaseView {
  constructor(data) {
    super();
    this.data = data || {};
  }

  setData(data) {
    this.data = data;
  }

  getTemplate() {
    const { title, description, stats, isAuthenticated } = this.data;

    return `
      <section class="container">
        <div class="home-hero">
          <h1 class="home-title">${title || 'Loading...'}</h1>
          <p class="home-description">${description || ''}</p>
          
          ${isAuthenticated && stats ? `
            <div class="home-stats">
              <div class="stat-item">
                <span class="stat-number">${stats.totalStories}</span>
                <span class="stat-label">Stories Shared</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${stats.activeUsers}</span>
                <span class="stat-label">Active Users</span>
              </div>
            </div>
          ` : isAuthenticated === false ? `
            <div class="home-login-prompt">
              <div class="login-prompt-icon">🔒</div>
              <h3>Login to See Community Stats</h3>
              <p>Sign in to view total stories shared and active users in the Dicoding community</p>
            </div>
            
            <div class="guest-story-section">
              <div class="guest-story-card">
                <div class="guest-story-header">
                  <h3>📝 Share Story as Guest</h3>
                  <p>No account needed! Share your Dicoding story with the community</p>
                </div>
                <a href="#/guest-story" class="btn btn-primary btn-block">Share Story as Guest</a>
              </div>
            </div>
          ` : ''}
          
          <div class="home-actions">
            <a href="#/login" class="btn btn-primary">Get Started</a>
            <a href="#/about" class="btn btn-secondary">Learn More</a>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
  }
}

export default HomeView;

