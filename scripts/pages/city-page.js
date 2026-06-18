import { entityRepo } from '../storage/repositories/entity-repository.js';
import { renderDetailPage, bindDetailPage, renderRelatedSection } from './detail-shared.js';
import { bindFavoriteButtons } from '../components/favorite-button.js';
import { formatDate } from '../utils/format.js';

export function renderCityPage(route) {
  const { city, items } = entityRepo.getByCitySlug(route.params.slug);
  if (!city) return null;

  const hotels = items.filter(i => i.type === 'hotel');
  const restaurants = items.filter(i => i.type === 'restaurant');
  const tours = items.filter(i => i.type === 'tour');
  const beaches = items.filter(i => i.type === 'beach');
  const events = items.filter(i => i.type === 'event');
  const meta = city.metadata || {};

  const extra = `
    <div class="info-card">
      <h3>Informações úteis</h3>
      <ul>
        <li><strong>Melhor época:</strong> ${meta.bestSeason || 'Junho a Janeiro'}</li>
        <li><strong>Clima:</strong> ${meta.climate || 'Tropical'}</li>
        <li><strong>Como chegar:</strong> ${meta.howToArrive || 'Consulte voos para Fortaleza'}</li>
      </ul>
    </div>
    ${meta.history ? `<div class="info-card"><h3>História</h3><p>${meta.history}</p></div>` : ''}
    ${meta.curiosities ? `<div class="info-card"><h3>Curiosidades</h3><ul>${meta.curiosities.map(c => `<li>${c}</li>`).join('')}</ul></div>` : ''}
    ${meta.usefulInfo ? `
      <div class="info-card">
        <h3>Serviços</h3>
        <ul>
          ${meta.usefulInfo.hospitals ? `<li><strong>Hospitais:</strong> ${meta.usefulInfo.hospitals.join(', ')}</li>` : ''}
          ${meta.usefulInfo.pharmacies ? `<li><strong>Farmácias:</strong> ${meta.usefulInfo.pharmacies.join(', ')}</li>` : ''}
        </ul>
      </div>
    ` : ''}
  `;

  return `
    ${renderDetailPage(city, { breadcrumbs: [{ label: 'Destinos', href: '/busca?tipo=city' }], extraSections: extra })}
    <div class="city-stats container">
      <div class="city-stat"><div class="city-stat__value">${hotels.length}</div><div class="city-stat__label">Hotéis</div></div>
      <div class="city-stat"><div class="city-stat__value">${restaurants.length}</div><div class="city-stat__label">Restaurantes</div></div>
      <div class="city-stat"><div class="city-stat__value">${tours.length}</div><div class="city-stat__label">Passeios</div></div>
      <div class="city-stat"><div class="city-stat__value">${beaches.length}</div><div class="city-stat__label">Praias</div></div>
    </div>
    ${renderRelatedSection('Onde ficar', hotels)}
    ${renderRelatedSection('Onde comer', restaurants)}
    ${renderRelatedSection('Passeios', tours)}
    ${renderRelatedSection('Praias', beaches)}
    ${renderRelatedSection('Eventos', events)}
  `;
}

export function bindCityPage(container, route) {
  const city = entityRepo.getBySlug(route.params.slug);
  if (city) bindDetailPage(container, city);
  bindFavoriteButtons(container, entityRepo.getAll());
}

export function renderEntityDetailPage(route, type) {
  const entity = entityRepo.getBySlug(route.params.slug);
  if (!entity || entity.type !== type) return null;
  const breadcrumbs = [
    { label: 'Destinos', href: '/busca?tipo=city' },
    { label: entity.cityName, href: `/cidade/${entityRepo.getById(entity.cityId)?.slug || ''}` }
  ];

  let extra = '';
  if (type === 'hotel') {
    extra = `<div class="info-card"><h3>Comodidades</h3><div class="amenity-list">${(entity.amenities || []).map(a => `<span class="amenity-item">✓ ${a}</span>`).join('')}</div></div>`;
  }
  if (type === 'restaurant') {
    const meta = entity.metadata || {};
    extra = `
      <div class="info-card"><h3>Cardápio</h3><div class="menu-preview">${meta.menu || 'Consulte o restaurante'}</div></div>
      <div class="info-card"><h3>Informações</h3>
        <ul>
          <li><strong>Culinária:</strong> ${meta.cuisine || entity.category}</li>
          <li><strong>Horário:</strong> ${entity.schedule || 'Consulte'}</li>
          ${meta.instagram ? `<li><strong>Instagram:</strong> ${meta.instagram}</li>` : ''}
          ${meta.phone ? `<li><strong>Telefone:</strong> ${meta.phone}</li>` : ''}
        </ul>
      </div>`;
  }
  if (type === 'tour') {
    const meta = entity.metadata || {};
    extra = `<div class="info-card"><h3>Detalhes do passeio</h3><ul>
      <li><strong>Duração:</strong> ${meta.duration || '—'}</li>
      <li><strong>Dificuldade:</strong> ${meta.difficulty || '—'}</li>
      <li><strong>Empresa:</strong> ${meta.company || '—'}</li>
    </ul></div>`;
  }
  if (type === 'event') {
    const meta = entity.metadata || {};
    extra = `<div class="info-card"><h3>Informações do evento</h3><ul>
      <li><strong>Data:</strong> ${meta.date ? formatDate(meta.date) : '—'}</li>
      <li><strong>Ingresso:</strong> ${meta.ticket || '—'}</li>
    </ul></div>`;
  }

  const related = entityRepo.getByCityId(entity.cityId).filter(e => e.id !== entity.id && e.type === type);
  return renderDetailPage(entity, { breadcrumbs, extraSections: extra }) + renderRelatedSection('Você também pode gostar', related);
}

export function bindEntityDetailPage(container, route, type) {
  const entity = entityRepo.getBySlug(route.params.slug);
  if (entity) bindDetailPage(container, entity);
  bindFavoriteButtons(container, entityRepo.getAll());
}
