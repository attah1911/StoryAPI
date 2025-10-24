import RegisterPresenter from './register-presenter.js';

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter();
  }

  async render() {
    return await this.presenter.render();
  }

  async afterRender() {
    return await this.presenter.afterRender();
  }
}

