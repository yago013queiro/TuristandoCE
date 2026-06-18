import { ROUTES } from '../data/constants.js';
import { eventBus, EVENTS } from './event-bus.js';

const routeDefinitions = [
  { path: ROUTES.HOME, name: 'home' },
  { path: ROUTES.SEARCH, name: 'search' },
  { path: ROUTES.CITY, name: 'city' },
  { path: ROUTES.BEACH, name: 'beach' },
  { path: ROUTES.HOTEL, name: 'hotel' },
  { path: ROUTES.RESTAURANT, name: 'restaurant' },
  { path: ROUTES.TOUR, name: 'tour' },
  { path: ROUTES.EVENT, name: 'event' },
  { path: ROUTES.MAP, name: 'map' },
  { path: ROUTES.PLANNER, name: 'planner' },
  { path: ROUTES.PROFILE, name: 'profile' },
  { path: ROUTES.REGISTER, name: 'register' },
  { path: ROUTES.ABOUT, name: 'about' }
];

class Router {
  constructor() {
    this._routes = routeDefinitions;
    this._handlers = new Map();
    this._current = null;
    this._guards = [];
  }

  register(name, handler) {
    this._handlers.set(name, handler);
  }

  addGuard(guard) {
    this._guards.push(guard);
  }

  init() {
    window.addEventListener('popstate', () => this.resolve());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-nav]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
    this.resolve();
  }

  navigate(path, replace = false) {
    const url = path.startsWith('/') ? path : `/${path}`;
    if (replace) {
      history.replaceState(null, '', url);
    } else {
      history.pushState(null, '', url);
    }
    this.resolve();
  }

  getParams() {
    return this._current?.params || {};
  }

  getQuery() {
    return this._current?.query || {};
  }

  getPath() {
    return this._current?.path || '/';
  }

  getRouteName() {
    return this._current?.name || 'notFound';
  }

  match(pathname) {
    let clean = pathname.split('?')[0].replace(/\/$/, '') || '/';
    if (clean.includes('/index.html')) {
      clean = '/';
    }
    for (const route of this._routes) {
      const pattern = route.path.replace(/:\w+/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      const match = clean.match(regex);
      if (match) {
        const paramNames = [...route.path.matchAll(/:(\w+)/g)].map(m => m[1]);
        const params = {};
        paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
        const queryStr = pathname.includes('?') ? pathname.split('?')[1] : window.location.search.slice(1);
        const query = Object.fromEntries(new URLSearchParams(queryStr));
        return { ...route, params, query, path: clean };
      }
    }
    return { name: 'notFound', path: clean, params: {}, query: {} };
  }

  async resolve() {
    const pathname = window.location.pathname + window.location.search;
    const matched = this.match(pathname);

    for (const guard of this._guards) {
      const result = await guard(matched);
      if (result === false) return;
      if (typeof result === 'string') {
        this.navigate(result, true);
        return;
      }
    }

    this._current = matched;
    const handler = this._handlers.get(matched.name) || this._handlers.get('notFound');
    if (handler) {
      eventBus.emit(EVENTS.ROUTE_CHANGED, matched);
      await handler(matched);
    }
  }

  link(path) {
    return path;
  }
}

export const router = new Router();
