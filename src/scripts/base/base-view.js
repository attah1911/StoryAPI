class BaseView {
  constructor() {
    if (new.target === BaseView) {
      throw new TypeError('Cannot construct BaseView instances directly');
    }
  }

  getTemplate() {
    throw new Error('Method getTemplate() must be implemented');
  }

  bindEvents() {
  }
}

export default BaseView;

