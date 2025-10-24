class BaseModel {
  constructor() {
    if (new.target === BaseModel) {
      throw new TypeError('Cannot construct BaseModel instances directly');
    }
  }

  async fetchData() {
    throw new Error('Method fetchData() must be implemented');
  }
}

export default BaseModel;

