import { renderEntityDetailPage, bindEntityDetailPage } from './city-page.js';

export function renderHotelPage(route) {
  return renderEntityDetailPage(route, 'hotel');
}

export function bindHotelPage(container, route) {
  bindEntityDetailPage(container, route, 'hotel');
}
