import { formatPriceRange } from '../utils/format.js';
import { renderRating } from './rating.js';
import { renderFavoriteButton } from './favorite-button.js';
import { router } from '../router.js';

const TYPE_ROUTES = {
  city: '/cidade',
  beach: '/praia',
  hotel: '/hotel',
  restaurant: '/restaurante',
  tour: '/passeio',
  event: '/evento',
  establishment: '/hotel'
};

export function getEntityUrl(entity) {
  const base = TYPE_ROUTES[entity.type] || '/busca';
  return `${base}/${entity.slug}`;
}

export function renderEntityCard(entity) {
  const url = getEntityUrl(entity);
  const price = entity.priceRange != null ? formatPriceRange(entity.priceRange) : '';
  const badge = entity.type === 'event' ? '<span class="badge badge--new">Evento</span>' : '';

  return `
    <article class="entity-card reveal" data-entity-id="${entity.id}">
      <div class="entity-card__media aspect-4-3 overflow-hidden">
        <a href="${url}" data-nav>
          <img src="${entity.coverImage}" alt="${entity.name}" loading="lazy" class="object-cover">
        </a>
        ${badge ? `<div class="entity-card__badge">${badge}</div>` : ''}
        ${renderFavoriteButton(entity)}
      </div>
      <a href="${url}" data-nav class="entity-card__body">
        <div class="entity-card__meta">
          <span>${entity.cityName || ''}</span>
          ${entity.category ? `<span>${entity.category}</span>` : ''}
        </div>
        <h3 class="entity-card__title">${entity.name}</h3>
        <p class="entity-card__summary line-clamp-2">${entity.summary || ''}</p>
        <div class="entity-card__footer">
          ${renderRating(entity.rating, entity.reviewCount)}
          ${price ? `<span class="entity-card__price">${price}</span>` : ''}
        </div>
      </a>
    </article>
  `;
}

export function renderEntityGrid(entities) {
  if (!entities.length) return '';
  return `<div class="grid grid--2 grid--3 grid--4">${entities.map(renderEntityCard).join('')}</div>`;
}

export function renderSkeletonCards(count = 4) {
  return `<div class="grid grid--2 grid--3 grid--4">${Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-card__image"></div>
      <div class="skeleton-card__body">
        <div class="skeleton skeleton-text skeleton-text--medium"></div>
        <div class="skeleton skeleton-text skeleton-text--short"></div>
      </div>
    </div>
  `).join('')}</div>`;
}

export function renderSectionBlock({ title, subtitle, entities, viewAllLink, anchorId }) {
  return `
    <section ${anchorId ? `id="${anchorId}"` : ''} class="section reveal">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">${title}</h2>
            ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
          </div>
          ${viewAllLink ? `<a href="${viewAllLink}" data-nav class="btn btn--ghost">Ver todos →</a>` : ''}
        </div>
        ${renderEntityGrid(entities)}
      </div>
    </section>
  `;
}

export function renderEmptyState({ icon = '🔍', title, message, ctaText, ctaLink }) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${ctaText ? `<a href="${ctaLink || '/'}" data-nav class="btn btn--primary">${ctaText}</a>` : ''}
    </div>
  `;
}
