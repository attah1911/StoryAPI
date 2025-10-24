import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import StoriesPage from '../pages/stories/stories-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import GuestStoryPage from '../pages/guest-story/guest-story-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import FavoritesPage from '../pages/favorites/favorites-page.js';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories': new StoriesPage(),
  '/add-story': new AddStoryPage(),
  '/guest-story': new GuestStoryPage(),
  '/story/:id': new StoryDetailPage(),
  '/favorites': new FavoritesPage(),
};

export default routes;
