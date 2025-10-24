import BaseModel from '../../base/base-model.js';

class AboutModel extends BaseModel {
  constructor() {
    super();
    this.data = null;
  }

  async fetchData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.data = {
          title: 'About Story App',
          description: 'Story App is a platform built for Dicoding learners to share their coding journey, project experiences, and learning stories.',
          features: [
            {
              icon: '📱',
              title: 'Single Page Application',
              description: 'Built with modern SPA architecture using MVP pattern for better code organization.',
            },
            {
              icon: '🗺️',
              title: 'Interactive Maps',
              description: 'Visualize stories on an interactive map with markers and location-based filtering.',
            },
            {
              icon: '✨',
              title: 'Smooth Transitions',
              description: 'Enjoy seamless page transitions with custom animations for better UX.',
            },
          ],
        };
        resolve(this.data);
      }, 100);
    });
  }

  getData() {
    return this.data;
  }
}

export default AboutModel;

