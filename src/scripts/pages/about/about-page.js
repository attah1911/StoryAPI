import AboutPresenter from './about-presenter.js';

export default class AboutPage {
  constructor() {
    this.presenter = new AboutPresenter();
  }

  async render() {
    return await this.presenter.render();
  }

  async afterRender() {
    return await this.presenter.afterRender();
  }
}
