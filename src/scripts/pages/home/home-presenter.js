import BasePresenter from '../../base/base-presenter.js';
import HomeModel from './home-model.js';
import HomeView from './home-view.js';

class HomePresenter extends BasePresenter {
  constructor() {
    const model = new HomeModel();
    const view = new HomeView();
    
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
      console.error('Error initializing HomePage:', error);
    }
  }
}

export default HomePresenter;

