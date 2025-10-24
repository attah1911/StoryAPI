import HomePresenter from './home-presenter.js';

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter();
  }

  async render() {
    return await this.presenter.render();
  }

  async afterRender() {
    return await this.presenter.afterRender();
  }
}
