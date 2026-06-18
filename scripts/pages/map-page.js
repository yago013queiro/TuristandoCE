import { entityRepo } from '../storage/repositories/entity-repository.js';
import { createMap, destroyMap, flyToMarker } from '../components/map-widget.js';
import { getEntityUrl } from '../components/entity-card.js';
import { router } from '../router.js';

const LAYER_TYPES = [
  { id: 'hotel', label: 'Hotéis', icon: '🏨' },
  { id: 'restaurant', label: 'Restaurantes', icon: '🍽️' },
  { id: 'beach', label: 'Praias', icon: '🏖️' },
  { id: 'tour', label: 'Passeios', icon: '🚐' },
  { id: 'event', label: 'Eventos', icon: '🎉' }
];

export function renderMapPage(route) {
  return `
    <div class="map-page">
      <div class="container">
        <h1 style="margin-bottom:var(--space-4)">Mapa do Ceará</h1>
        <div class="map-page__layout">
          <aside class="map-sidebar">
            <div class="map-filter-bar" data-map-filters>
              ${LAYER_TYPES.map(l => `
                <button class="chip is-active" data-layer="${l.id}">${l.icon} ${l.label}</button>
              `).join('')}
            </div>
            <div data-map-list></div>
          </aside>
          <div class="map-container" id="main-map"></div>
        </div>
      </div>
    </div>
  `;
}

export function bindMapPage(container, route) {
  let activeLayers = new Set(LAYER_TYPES.map(l => l.id));
  let mapInstance = null;

  const renderList = (entities) => {
    const list = container.querySelector('[data-map-list]');
    list.innerHTML = entities.slice(0, 20).map(e => `
      <div class="map-list-item" data-map-item="${e.id}">
        <strong>${e.name}</strong>
        <p class="text-sm text-muted">${e.cityName} · ${e.type}</p>
      </div>
    `).join('');
  };

  const updateMap = () => {
    const entities = entityRepo.getAll().filter(e =>
      e.type !== 'city' && activeLayers.has(e.type) && e.location?.lat
    );
    mapInstance = createMap(container.querySelector('#main-map'), {
      entities,
      onMarkerClick: (entity) => {
        container.querySelectorAll('.map-list-item').forEach(el => {
          el.classList.toggle('is-active', el.dataset.mapItem === entity.id);
        });
      }
    });
    renderList(entities);

    const focusId = route.query.focus;
    if (focusId) {
      const focus = entityRepo.getById(focusId);
      if (focus) flyToMarker(mapInstance?.map, focus);
    }
  };

  container.querySelector('[data-map-filters]')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-layer]');
    if (!chip) return;
    chip.classList.toggle('is-active');
    const layer = chip.dataset.layer;
    if (chip.classList.contains('is-active')) activeLayers.add(layer);
    else activeLayers.delete(layer);
    updateMap();
  });

  container.querySelector('[data-map-list]')?.addEventListener('click', (e) => {
    const item = e.target.closest('[data-map-item]');
    if (!item) return;
    const entity = entityRepo.getById(item.dataset.mapItem);
    if (entity) {
      flyToMarker(mapInstance?.map, entity);
      container.querySelectorAll('.map-list-item').forEach(el => el.classList.remove('is-active'));
      item.classList.add('is-active');
    }
  });

  updateMap();

  return () => destroyMap();
}
