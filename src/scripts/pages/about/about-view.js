import BaseView from '../../base/base-view.js';

class AboutView extends BaseView {
  constructor(data) {
    super();
    this.data = data || {};
  }

  setData(data) {
    this.data = data;
  }

  getTemplate() {
    const { title, description, features, developer } = this.data;

    return `
      <section class="container">
        <div class="about-content">
          <h1 class="about-title">${title || 'About'}</h1>
          <p class="about-description">${description || 'Loading...'}</p>
          
          ${features && features.length > 0 ? `
            <div class="about-features">
              <h2>Key Features</h2>
              <div class="features-grid">
                ${features.map((feature) => `
                  <div class="feature-card">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3 class="feature-title">${feature.title}</h3>
                    <p class="feature-description">${feature.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }

  bindEvents() {
  }
}

export default AboutView;

