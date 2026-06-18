import { renderEntityDetailPage, bindEntityDetailPage } from './city-page.js';

export function renderEventPage(route) {
  return renderEntityDetailPage(route, 'event');
}

export function bindEventPage(container, route) {
  bindEntityDetailPage(container, route, 'event');
}
