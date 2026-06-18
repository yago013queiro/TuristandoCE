import { favoritesService } from '../services/favorites-service.js';
import { eventBus, EVENTS } from '../event-bus.js';

export function renderFavoriteButton(entity, className = '') {
  const isActive = favoritesService.isFavorite(entity.id);
  return `
    <button class="entity-card__favorite ${isActive ? 'is-active' : ''} ${className}"
      data-favorite-id="${entity.id}" aria-label="${isActive ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
      aria-pressed="${isActive}">
      ${isActive ? '♥' : '♡'}
    </button>
  `;
}

export function bindFavoriteButtons(container, entities) {
  container.querySelectorAll('[data-favorite-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const entity = entities.find(en => en.id === btn.dataset.favoriteId);
      if (!entity) return;
      const isNow = favoritesService.toggle(entity);
      btn.classList.toggle('is-active', isNow);
      btn.textContent = isNow ? '♥' : '♡';
      btn.setAttribute('aria-pressed', isNow);
    });
  });
}
