const TYPE_COLORS = {
  hotel: '#1B4D3E',
  restaurant: '#A67C52',
  beach: '#5B9BD5',
  tour: '#4CAF7D',
  event: '#D97706',
  city: '#2D7A5F',
  establishment: '#6B7280'
};

let activeMap = null;

export function createMap(container, { center = [-3.73, -38.52], zoom = 8, entities = [], onMarkerClick } = {}) {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }

  if (!window.L) {
    container.innerHTML = '<p class="text-muted">Mapa indisponível. Verifique sua conexão.</p>';
    return null;
  }

  const map = L.map(container, { scrollWheelZoom: true }).setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const markers = [];

  entities.forEach(entity => {
    if (!entity.location?.lat || !entity.location?.lng) return;
    const color = TYPE_COLORS[entity.type] || '#1B4D3E';
    const icon = L.divIcon({
      className: 'map-marker',
      html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([entity.location.lat, entity.location.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <div class="map-popup">
          <h4>${entity.name}</h4>
          <p>${entity.cityName || ''} · ${entity.type}</p>
          <a href="#" data-map-nav="${entity.slug}" data-map-type="${entity.type}">Ver detalhes →</a>
        </div>
      `);

    marker.entity = entity;
    markers.push(marker);

    marker.on('click', () => onMarkerClick?.(entity));
  });

  if (markers.length > 1) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }

  activeMap = map;

  container.addEventListener('click', (e) => {
    const link = e.target.closest('[data-map-nav]');
    if (link) {
      e.preventDefault();
      const routes = { city: 'cidade', beach: 'praia', hotel: 'hotel', restaurant: 'restaurante', tour: 'passeio', event: 'evento' };
      const route = routes[link.dataset.mapType] || 'busca';
      import('../router.js').then(({ router }) => router.navigate(`/${route}/${link.dataset.mapNav}`));
    }
  });

  return { map, markers };
}

export function destroyMap() {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }
}

export function flyToMarker(map, entity) {
  if (map && entity?.location) {
    map.flyTo([entity.location.lat, entity.location.lng], 14);
  }
}
