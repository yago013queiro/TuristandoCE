import { renderEntityDetailPage, bindEntityDetailPage } from './city-page.js';

export function renderRestaurantPage(route) {
  return renderEntityDetailPage(route, 'restaurant');
}

export function bindRestaurantPage(container, route) {
  bindEntityDetailPage(container, route, 'restaurant');
}
