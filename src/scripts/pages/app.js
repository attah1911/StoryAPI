import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import TransitionManager from '../utils/transition-manager.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #transitionManager = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#transitionManager = new TransitionManager(content);

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', isOpen);
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });

    this.#drawerButton.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  async renderPage(skipTransition = false) {
    const url = getActiveRoute();
    const page = routes[url];

    const isFirstLoad = this.#content.innerHTML.trim() === '';
    
    if (isFirstLoad || skipTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#content.style.visibility = 'visible';
    } else {
      await this.#transitionManager.transition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    }
  }
}

export default App;
