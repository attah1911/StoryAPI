import GuestStoryPresenter from './guest-story-presenter.js';

export default class GuestStoryPage {
  constructor() {
    this.presenter = new GuestStoryPresenter();
  }

  async render() {
    return await this.presenter.render();
  }

  async afterRender() {
    return await this.presenter.afterRender();
  }
}

