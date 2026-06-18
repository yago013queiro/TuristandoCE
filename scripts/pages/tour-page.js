import { renderEntityDetailPage, bindEntityDetailPage } from './city-page.js';

export function renderTourPage(route) {
  return renderEntityDetailPage(route, 'tour');
}

export function bindTourPage(container, route) {
  bindEntityDetailPage(container, route, 'tour');
}
