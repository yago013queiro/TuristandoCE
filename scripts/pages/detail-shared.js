import { entityRepo } from '../storage/repositories/entity-repository.js';
import { historyService } from '../services/history-service.js';
import { reviewsService } from '../services/reviews-service.js';
import { authService } from '../services/auth-service.js';
import { renderGallery, bindGallery } from '../components/gallery.js';
import { renderRating, renderRatingInput, bindRatingInput } from '../components/rating.js';
import { renderFavoriteButton, bindFavoriteButtons } from '../components/favorite-button.js';
import { favoritesService } from '../services/favorites-service.js';
import { wishlistService } from '../services/wishlist-service.js';
import { renderEntityGrid } from '../components/entity-card.js';
import { createMap } from '../components/map-widget.js';
import { shareContent } from '../utils/share.js';
import { formatPriceRange, formatDate } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { router } from '../router.js';

function renderReviews(entityId) {
  const reviews = reviewsService.getByEntity(entityId);
  return `
    <div class="info-card">
      <h3>Avaliações (${reviews.length})</h3>
      ${reviews.length ? reviews.map(r => `
        <div class="review-item">
          <div class="review-item__header">
            <span class="review-item__author">${r.userName}</span>
            ${renderRating(r.rating)}
          </div>
          <p class="review-item__text">${r.text}</p>
          <span class="review-item__date">${formatDate(r.createdAt)}</span>
        </div>
      `).join('') : '<p class="text-muted">Seja o primeiro a avaliar!</p>'}
      <div class="review-form" data-review-form>
        <h4>Deixe sua avaliação</h4>
        ${renderRatingInput('rating', 5)}
        <div class="form-group" style="margin-top:var(--space-3)">
          <textarea class="textarea" name="text" placeholder="Conte sua experiência..." required></textarea>
        </div>
        <button class="btn btn--primary" data-submit-review>Enviar avaliação</button>
      </div>
    </div>
  `;
}

function renderDetailActions(entity) {
  const wished = wishlistService.isWished(entity.id);
  return `
    <div class="detail-actions">
      <button class="btn btn--ghost" data-favorite-id="${entity.id}" aria-pressed="${favoritesService.isFavorite(entity.id)}">
        ${favoritesService.isFavorite(entity.id) ? '♥ Favorito' : '♡ Favoritar'}
      </button>
      <button class="btn btn--ghost" data-wishlist-id="${entity.id}" aria-pressed="${wished}">
        ${wished ? '✓ Quero conhecer' : '+ Quero conhecer'}
      </button>
      <button class="btn btn--ghost" data-share>Compartilhar</button>
      <a href="/mapa?focus=${entity.id}" data-nav class="btn btn--ghost">Ver no mapa</a>
      <a href="/planejar?cidade=${entity.cityId}" data-nav class="btn btn--ocean">Adicionar ao roteiro</a>
    </div>
  `;
}

function renderSidebar(entity) {
  const price = entity.priceRange ? formatPriceRange(entity.priceRange) : '';
  return `
    <div class="info-panel">
      ${price ? `<div class="info-panel__price">${price}</div>` : ''}
      ${renderRating(entity.rating, entity.reviewCount)}
      <div class="info-panel__actions">
        ${entity.type === 'hotel' ? '<button class="btn btn--primary btn--block">Reservar agora</button>' : ''}
        ${entity.type === 'restaurant' ? '<button class="btn btn--primary btn--block">Ver cardápio</button>' : ''}
        ${entity.type === 'tour' ? '<button class="btn btn--primary btn--block">Reservar passeio</button>' : ''}
        <button class="btn btn--ghost btn--block" data-share>Compartilhar</button>
      </div>
      <div class="mini-map" id="detail-mini-map"></div>
    </div>
  `;
}

export function renderDetailPage(entity, { breadcrumbs = [], extraSections = '' } = {}) {
  if (!entity) return '';

  return `
    <div class="container detail-layout">
      <div class="detail-layout__main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/" data-nav>Home</a> <span class="breadcrumb__sep">›</span>
          ${breadcrumbs.map(b => `<a href="${b.href}" data-nav>${b.label}</a> <span class="breadcrumb__sep">›</span>`).join('')}
          <span>${entity.name}</span>
        </nav>

        <h1>${entity.name}</h1>
        <p class="text-muted">${entity.cityName} · ${entity.category || entity.type}</p>
        ${renderDetailActions(entity)}

        ${renderGallery(entity.images || [entity.coverImage], entity.name)}

        <div class="detail-info-grid" style="margin-top:var(--space-6)">
          <div class="info-card">
            <h3>Sobre</h3>
            <p>${entity.description || entity.summary}</p>
          </div>
          ${extraSections}
        </div>

        <div class="detail-map" id="detail-map"></div>
        ${renderReviews(entity.id)}
      </div>
      <aside class="detail-layout__sidebar">
        ${renderSidebar(entity)}
      </aside>
    </div>
  `;
}

export function bindDetailPage(container, entity) {
  if (!entity) return;
  historyService.add(entity);
  bindGallery(container);
  bindFavoriteButtons(container, [entity]);

  container.querySelector('[data-wishlist-id]')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const isNow = wishlistService.toggle(entity);
    btn.textContent = isNow ? '✓ Quero conhecer' : '+ Quero conhecer';
    btn.setAttribute('aria-pressed', isNow);
    showToast(isNow ? 'Adicionado à lista "Quero conhecer"' : 'Removido da lista', 'success');
  });
  bindRatingInput(container);

  container.querySelector('[data-share]')?.addEventListener('click', async () => {
    const result = await shareContent({ title: entity.name, text: entity.summary });
    showToast(result === 'copied' ? 'Link copiado!' : result ? 'Compartilhado!' : 'Não foi possível compartilhar', result ? 'success' : 'error');
  });

  container.querySelector('[data-submit-review]')?.addEventListener('click', () => {
    const user = authService.getCurrentUser();
    if (!user) { showToast('Faça login para avaliar', 'info'); return; }
    const form = container.querySelector('[data-review-form]');
    const rating = parseInt(form.querySelector('input[name="rating"]').value);
    const text = form.querySelector('textarea').value.trim();
    if (!text) { showToast('Escreva um comentário', 'error'); return; }
    reviewsService.add({ entityId: entity.id, userId: user.id, userName: user.name, rating, text });
    showToast('Avaliação enviada!', 'success');
    router.resolve();
  });

  const mapEntities = [entity];
  createMap(container.querySelector('#detail-mini-map'), {
    center: [entity.location.lat, entity.location.lng],
    zoom: 14,
    entities: mapEntities
  });
  createMap(container.querySelector('#detail-map'), {
    center: [entity.location.lat, entity.location.lng],
    zoom: 13,
    entities: mapEntities
  });
}

export function renderRelatedSection(title, entities) {
  if (!entities.length) return '';
  return `
    <section class="section">
      <div class="container">
        <h2 class="section-title">${title}</h2>
        ${renderEntityGrid(entities.slice(0, 4))}
      </div>
    </section>
  `;
}
