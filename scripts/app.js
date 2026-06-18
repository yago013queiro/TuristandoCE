import { storage } from './storage/storage-manager.js';
import { router } from './router.js';
import { initA11y } from './utils/a11y.js';
import { initToast } from './components/toast.js';
import { initModal } from './components/modal.js';
import { renderHeader, bindHeader } from './components/header.js';
import { renderFooter, bindFooter } from './components/footer.js';
import { renderAccessibilityToolbar, bindAccessibilityToolbar } from './components/accessibility-toolbar.js';
import { destroyMap } from './components/map-widget.js';
import { authService } from './services/auth-service.js';

import { renderHomePage, bindHomePage } from './pages/home-page.js';
import { renderSearchPage, bindSearchPage } from './pages/search-page.js';
import { renderCityPage, bindCityPage } from './pages/city-page.js';
import { renderBeachPage, bindBeachPage } from './pages/beach-page.js';
import { renderHotelPage, bindHotelPage } from './pages/hotel-page.js';
import { renderRestaurantPage, bindRestaurantPage } from './pages/restaurant-page.js';
import { renderTourPage, bindTourPage } from './pages/tour-page.js';
import { renderEventPage, bindEventPage } from './pages/event-page.js';
import { renderMapPage, bindMapPage } from './pages/map-page.js';
import { renderPlannerPage, bindPlannerPage } from './pages/planner-page.js';
import { renderProfilePage, bindProfilePage } from './pages/profile-page.js';
import { renderRegisterPage, bindRegisterPage } from './pages/register-page.js';
import { renderAboutPage, bindAboutPage } from './pages/about-page.js';
import { renderNotFoundPage, bindNotFoundPage } from './pages/not-found-page.js';

import { updateMeta } from './utils/seo.js';
import { entityRepository } from './storage/repositories/entity-repository.js';

let cleanupFn = null;

const routes = [
  { name: 'home', render: renderHomePage, bind: bindHomePage },
  { name: 'search', render: renderSearchPage, bind: bindSearchPage },
  { name: 'city', render: renderCityPage, bind: bindCityPage },
  { name: 'beach', render: renderBeachPage, bind: bindBeachPage },
  { name: 'hotel', render: renderHotelPage, bind: bindHotelPage },
  { name: 'restaurant', render: renderRestaurantPage, bind: bindRestaurantPage },
  { name: 'tour', render: renderTourPage, bind: bindTourPage },
  { name: 'event', render: renderEventPage, bind: bindEventPage },
  { name: 'map', render: renderMapPage, bind: bindMapPage },
  { name: 'planner', render: renderPlannerPage, bind: bindPlannerPage },
  { name: 'profile', render: renderProfilePage, bind: bindProfilePage },
  { name: 'register', render: renderRegisterPage, bind: bindRegisterPage },
  { name: 'about', render: renderAboutPage, bind: bindAboutPage },
  { name: 'notFound', render: renderNotFoundPage, bind: bindNotFoundPage }
];

function updateSEO(route) {
  const { name, params } = route;
  
  if (['city', 'beach', 'hotel', 'restaurant', 'tour', 'event'].includes(name) && params.slug) {
    const entity = entityRepository.getBySlug(params.slug);
    if (entity) {
      updateMeta({
        title: `${entity.name} — Turistando CE`,
        description: entity.summary || entity.description,
        image: entity.coverImage,
        url: window.location.href
      });
      return;
    }
  }

  const titles = {
    home: 'Turistando CE — Turismo no Ceará',
    search: 'Buscar — Turistando CE',
    map: 'Mapa — Turistando CE',
    planner: 'Planejar viagem — Turistando CE',
    profile: 'Meu perfil — Turistando CE',
    register: 'Cadastrar — Turistando CE',
    about: 'Sobre — Turistando CE'
  };

  updateMeta({
    title: titles[name] || 'Turistando CE',
    url: window.location.href
  });
}

async function renderApp(route) {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }
  destroyMap();

  let routeConfig = routes.find(r => r.name === route.name) || routes.find(r => r.name === 'notFound');
  let content = routeConfig.render(route);

  if (content === null) {
    content = renderNotFoundPage();
    routeConfig = routes.find(r => r.name === 'notFound');
  }

  const appRoot = document.getElementById('app-root');
  appRoot.innerHTML = `
    ${renderHeader()}
    <main id="main-content" role="main">${content}</main>
    ${renderFooter()}
    ${renderAccessibilityToolbar()}
  `;

  updateSEO(route);

  bindHeader(appRoot);
  bindFooter(appRoot);
  bindAccessibilityToolbar(appRoot);

  if (routeConfig.bind) {
    const cleanup = routeConfig.bind(appRoot, route);
    if (typeof cleanup === 'function') cleanupFn = cleanup;
  }

  if (route.name === 'home' && window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }

  window.scrollTo(0, 0);
}

function init() {
  storage.init();
  initA11y();
  initToast();
  initModal();

  routes.forEach(({ name }) => {
    router.register(name, (route) => renderApp(route));
  });

  router.init();
}

function showBootError(error) {
  const root = document.getElementById('app-root');
  if (!root) return;
  root.innerHTML = `
    <div class="app-error">
      <h2>Não foi possível iniciar o Turistando CE</h2>
      <p>Abra o projeto com um servidor local (Live Server ou <code>npx serve .</code>), não abrindo o arquivo HTML diretamente.</p>
      <code>${error?.message || error}</code>
      <p style="margin-top:1rem"><button class="btn btn--primary" onclick="location.reload()">Tentar novamente</button></p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    init();
  } catch (error) {
    console.error(error);
    showBootError(error);
  }
});

window.addEventListener('error', (e) => {
  if (e.message?.includes('module') || e.message?.includes('import')) {
    showBootError(e.error || { message: e.message });
  }
});

window.addEventListener('unhandledrejection', (e) => {
  showBootError(e.reason);
});
