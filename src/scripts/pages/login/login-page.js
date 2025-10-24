import LoginPresenter from './login-presenter.js';

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter();
  }

  async render() {
    return await this.presenter.render();
  }

  async afterRender() {
    return await this.presenter.afterRender();
  }
}

