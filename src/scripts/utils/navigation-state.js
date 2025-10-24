class NavigationState {
  constructor() {
    this.isRedirecting = false;
  }

  setRedirecting(value) {
    this.isRedirecting = value;
  }

  getRedirecting() {
    return this.isRedirecting;
  }

  resetRedirecting() {
    this.isRedirecting = false;
  }
}

export default new NavigationState();

