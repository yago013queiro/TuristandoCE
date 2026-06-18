import { authService } from '../services/auth-service.js';
import { favoritesService } from '../services/favorites-service.js';
import { historyService } from '../services/history-service.js';
import { reviewsService } from '../services/reviews-service.js';
import { itineraryEngine } from '../services/itinerary-engine.js';
import { establishmentService } from '../services/auth-service.js';
import { entityRepo } from '../storage/repositories/entity-repository.js';
import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';
import { renderEntityGrid, renderEmptyState } from '../components/entity-card.js';
import { formatPrice, formatRelativeDate } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { openAuthModal } from '../components/header.js';
import { wishlistService } from '../services/wishlist-service.js';
import { INTERESTS, PROFILES } from '../../data/categories.js';

export function renderProfilePage(route) {
  const user = authService.getCurrentUser();
  const tab = route.query.tab || 'favoritos';

  if (!user) {
    return `
      <div class="profile-page container">
        <div class="empty-state">
          <div class="empty-state__icon">👤</div>
          <h2>Faça login para acessar seu perfil</h2>
          <p>Salve favoritos, roteiros e preferências</p>
          <button class="btn btn--primary" data-auth-open>Entrar ou cadastrar</button>
        </div>
      </div>
    `;
  }

  const favorites = favoritesService.getEntities(entityRepo.getAll());
  const wishlist = wishlistService.getEntities(entityRepo.getAll());
  const history = historyService.getAll();
  const itineraries = itineraryEngine.getAll();
  const myReviews = reviewsService.getByUser(user.id);
  const prefs = storage.get(STORAGE_KEYS.PREFERENCES) || { interests: [], profile: '' };
  const myEstablishments = user.role === 'parceiro' ? establishmentService.getByOwner(user.id) : [];

  return `
    <div class="profile-page">
      <div class="container">
        <div class="profile-header">
          <div class="profile-header__avatar">${user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div class="profile-header__info">
            <h1>${user.name}</h1>
            <p class="profile-header__role">${user.role === 'parceiro' ? 'Parceiro' : 'Turista'} · ${user.email}</p>
          </div>
          <button class="btn btn--ghost" data-reset-demo>Restaurar dados demo</button>
        </div>

        <div class="tabs" data-profile-tabs>
          <button class="tabs__btn ${tab === 'favoritos' ? 'is-active' : ''}" data-tab="favoritos">Favoritos (${favorites.length})</button>
          <button class="tabs__btn ${tab === 'quero-conhecer' ? 'is-active' : ''}" data-tab="quero-conhecer">Quero conhecer (${wishlist.length})</button>
          <button class="tabs__btn ${tab === 'historico' ? 'is-active' : ''}" data-tab="historico">Histórico</button>
          <button class="tabs__btn ${tab === 'roteiros' ? 'is-active' : ''}" data-tab="roteiros">Roteiros (${itineraries.length})</button>
          <button class="tabs__btn ${tab === 'avaliacoes' ? 'is-active' : ''}" data-tab="avaliacoes">Avaliações</button>
          <button class="tabs__btn ${tab === 'preferencias' ? 'is-active' : ''}" data-tab="preferencias">Preferências</button>
        </div>

        <div class="tab-panel ${tab === 'favoritos' ? 'is-active' : ''}" data-panel="favoritos">
          ${favorites.length ? renderEntityGrid(favorites) : renderEmptyState({ icon: '♡', title: 'Nenhum favorito', message: 'Explore e salve seus lugares favoritos', ctaText: 'Explorar', ctaLink: '/busca' })}
        </div>

        <div class="tab-panel ${tab === 'quero-conhecer' ? 'is-active' : ''}" data-panel="quero-conhecer">
          ${wishlist.length ? renderEntityGrid(wishlist) : renderEmptyState({ icon: '📍', title: 'Lista vazia', message: 'Marque lugares com "Quero conhecer"', ctaText: 'Explorar', ctaLink: '/busca' })}
        </div>

        <div class="tab-panel ${tab === 'historico' ? 'is-active' : ''}" data-panel="historico">
          ${history.length ? history.map(h => `
            <a href="#" data-nav data-history-slug="${h.slug}" data-history-type="${h.entityType}" class="history-item">
              <div class="history-item__image"><img src="${h.coverImage}" alt="" class="object-cover"></div>
              <div>
                <strong>${h.name}</strong>
                <p class="history-item__date">${h.cityName} · ${formatRelativeDate(h.viewedAt)}</p>
              </div>
            </a>
          `).join('') : renderEmptyState({ icon: '🕐', title: 'Sem histórico', message: 'Seus lugares visitados aparecerão aqui' })}
        </div>

        <div class="tab-panel ${tab === 'roteiros' ? 'is-active' : ''}" data-panel="roteiros">
          ${itineraries.length ? itineraries.map(it => `
            <div class="info-card" style="margin-bottom:var(--space-4)">
              <div class="flex justify-between items-center">
                <div>
                  <h3>${it.cityName} · ${it.days} dias</h3>
                  <p class="text-muted">${formatPrice(it.totalCost)} estimado · ${formatRelativeDate(it.createdAt)}</p>
                </div>
                <button class="btn btn--ghost btn--sm" data-delete-itinerary="${it.id}">Excluir</button>
              </div>
            </div>
          `).join('') : renderEmptyState({ icon: '🗺️', title: 'Nenhum roteiro', message: 'Crie seu primeiro roteiro', ctaText: 'Planejar viagem', ctaLink: '/planejar' })}
        </div>

        <div class="tab-panel ${tab === 'avaliacoes' ? 'is-active' : ''}" data-panel="avaliacoes">
          ${myReviews.length ? myReviews.map(r => {
            const entity = entityRepo.getById(r.entityId);
            return `<div class="review-item"><strong>${entity?.name || ''}</strong> — ${'★'.repeat(r.rating)}<p>${r.text}</p></div>`;
          }).join('') : '<p class="text-muted">Você ainda não fez avaliações.</p>'}
        </div>

        <div class="tab-panel ${tab === 'preferencias' ? 'is-active' : ''}" data-panel="preferencias">
          <form data-prefs-form class="info-card">
            <div class="form-group">
              <label class="form-label">Perfil de viagem</label>
              <select class="select" name="profile">
                <option value="">Selecione</option>
                ${PROFILES.map(p => `<option value="${p.id}" ${prefs.profile === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Interesses</label>
              <div class="checkbox-group">
                ${INTERESTS.map(i => `
                  <label class="checkbox-label">
                    <input type="checkbox" name="interests" value="${i.id}" ${(prefs.interests || []).includes(i.id) ? 'checked' : ''}> ${i.label}
                  </label>
                `).join('')}
              </div>
            </div>
            <button type="submit" class="btn btn--primary">Salvar preferências</button>
          </form>
        </div>

        ${myEstablishments.length ? `
          <div class="my-establishments">
            <h2 class="section-title">Meus estabelecimentos</h2>
            ${myEstablishments.map(e => `
              <div class="establishment-item">
                <div><strong>${e.name}</strong><p class="text-sm text-muted">${e.type} · ${e.cityName}</p></div>
                <div class="establishment-item__actions">
                  <button class="btn btn--ghost btn--sm" data-delete-est="${e.id}">Excluir</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function bindProfilePage(container) {
  container.querySelector('[data-auth-open]')?.addEventListener('click', openAuthModal);

  container.querySelector('[data-profile-tabs]')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    container.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('is-active'));
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    container.querySelector(`[data-panel="${btn.dataset.tab}"]`)?.classList.add('is-active');
  });

  container.querySelector('[data-prefs-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    storage.set(STORAGE_KEYS.PREFERENCES, {
      profile: fd.get('profile'),
      interests: fd.getAll('interests')
    });
    showToast('Preferências salvas!', 'success');
  });

  container.querySelector('[data-reset-demo]')?.addEventListener('click', () => {
    if (confirm('Restaurar dados demo? Favoritos e roteiros serão apagados.')) {
      storage.resetDemo();
      showToast('Dados demo restaurados', 'success');
      import('../router.js').then(({ router }) => router.resolve());
    }
  });

  container.querySelectorAll('[data-delete-itinerary]').forEach(btn => {
    btn.addEventListener('click', () => {
      itineraryEngine.remove(btn.dataset.deleteItinerary);
      showToast('Roteiro excluído', 'info');
      import('../router.js').then(({ router }) => router.resolve());
    });
  });

  const user = authService.getCurrentUser();
  container.querySelectorAll('[data-delete-est]').forEach(btn => {
    btn.addEventListener('click', () => {
      try {
        establishmentService.remove(btn.dataset.deleteEst, user.id);
        showToast('Estabelecimento removido', 'info');
        import('../router.js').then(({ router }) => router.resolve());
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  container.querySelectorAll('[data-history-slug]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const routes = { city: 'cidade', beach: 'praia', hotel: 'hotel', restaurant: 'restaurante', tour: 'passeio', event: 'evento' };
      const route = routes[link.dataset.historyType] || 'busca';
      import('../router.js').then(({ router }) => router.navigate(`/${route}/${link.dataset.historySlug}`));
    });
  });
}
