class BasePresenter {
  constructor(model, view) {
    if (new.target === BasePresenter) {
      throw new TypeError('Cannot construct BasePresenter instances directly');
    }
    
    this.model = model;
    this.view = view;
  }

  async init() {
    await this.view.bindEvents();
  }

  async render() {
    return this.view.getTemplate();
  }

  destroy() {
  }
}

export default BasePresenter;

