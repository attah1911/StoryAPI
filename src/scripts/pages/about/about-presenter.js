import BasePresenter from '../../base/base-presenter.js';
import AboutModel from './about-model.js';
import AboutView from './about-view.js';

class AboutPresenter extends BasePresenter {
  constructor() {
    const model = new AboutModel();
    const view = new AboutView();
    
    super(model, view);
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    try {
      const data = await this.model.fetchData();
      this.view.setData(data);
      
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.innerHTML = this.view.getTemplate();
      }
      
      this.view.bindEvents();
    } catch (error) {
      console.error('Error initializing AboutPage:', error);
    }
  }
}

export default AboutPresenter;

