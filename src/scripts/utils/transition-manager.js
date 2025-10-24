class TransitionManager {
  constructor(contentElement) {
    this.content = contentElement;
    this.supportsViewTransitions = 'startViewTransition' in document;
  }

  async transition(renderCallback) {
    if (!this.supportsViewTransitions) {
      await this.fallbackTransition(renderCallback);
      return;
    }

    const transition = document.startViewTransition(async () => {
      await renderCallback();
    });

    try {
      await transition.finished;
    } catch (error) {
      console.error('View transition failed:', error);
    }
  }

  async fallbackTransition(renderCallback) {
    this.content.style.transition = 'opacity 0.25s ease-in-out, transform 0.25s ease-in-out';
    this.content.style.opacity = '0';
    this.content.style.transform = 'translateX(-20px)';
    
    await new Promise(resolve => setTimeout(resolve, 250));
    
    await renderCallback();
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    this.content.style.opacity = '1';
    this.content.style.transform = 'translateX(0)';
    
    await new Promise(resolve => setTimeout(resolve, 250));
    this.content.style.transition = '';
    this.content.style.transform = '';
  }
}

export default TransitionManager;

