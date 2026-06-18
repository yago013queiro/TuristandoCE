import { searchService } from '../services/search-service.js';
import { entityRepo } from '../storage/repositories/entity-repository.js';
import { renderSearchBar, bindSearchBar } from '../components/search-bar.js';
import { renderFilterPanel, bindFilterPanel } from '../components/filter-panel.js';
import { renderEntityGrid, renderEmptyState } from '../components/entity-card.js';
import { bindFavoriteButtons } from '../components/favorite-button.js';
import { router } from '../router.js';
import { debounce } from '../utils/debounce.js';
import { bindRevealAnimations } from '../utils/dom.js';
import { pluralize } from '../utils/format.js';

const TYPE_LABELS = {
  city: 'Cidades', beach: 'Praias', hotel: 'Hotéis',
  restaurant: 'Restaurantes', tour: 'Passeios', event: 'Eventos'
};

export function renderSearchPage(route) {
  const query = route.query.q || '';
  const type = route.query.tipo || route.query.type || '';
  const tag = route.query.tag || '';
  const tags = tag ? [tag, ...(route.query.tags?.split(',') || [])].filter(Boolean) : [];

  const filters = { query, type, cityId: route.query.cidade || '', tags, sort: route.query.ordenar || 'relevance' };
  const results = searchService.search(filters);

  return `
    <div class="search-page">
      <div class="container">
        <div class="search-page__header">
          <h1>Buscar no Ceará</h1>
          <p class="text-muted">Encontre destinos, hotéis, restaurantes e muito mais</p>
          <div style="margin-top:var(--space-4)">${renderSearchBar({ value: query })}</div>
        </div>

        ${renderFilterPanel({ activeFilters: { type, cityId: filters.cityId, tags, sort: filters.sort } })}

        <div class="search-results-tabs" data-result-tabs>
          <button class="${!type ? 'is-active' : ''}" data-tab-type="">Todos (${results.length})</button>
          ${Object.entries(TYPE_LABELS).map(([t, label]) => {
            const count = results.filter(r => r.type === t).length;
            if (!count && type !== t) return '';
            return `<button class="${type === t ? 'is-active' : ''}" data-tab-type="${t}">${label} (${count})</button>`;
          }).join('')}
        </div>

        <p class="search-page__count" data-result-count>
          ${pluralize(results.length, 'resultado encontrado', 'resultados encontrados')}
          ${query ? ` para "${query}"` : ''}
        </p>

        <div data-search-results>
          ${results.length
            ? renderEntityGrid(results)
            : renderEmptyState({
                icon: '🔍',
                title: 'Nenhum resultado',
                message: 'Tente outros termos ou remova alguns filtros.',
                ctaText: 'Ver todos os destinos',
                ctaLink: '/busca'
              })
          }
        </div>
      </div>
    </div>
  `;
}

export function bindSearchPage(container, route) {
  let currentFilters = {
    query: route.query.q || '',
    type: route.query.tipo || route.query.type || '',
    cityId: route.query.cidade || '',
    tags: route.query.tag ? [route.query.tag] : [],
    sort: route.query.ordenar || 'relevance',
    priceMax: route.query.preco ? parseInt(route.query.preco) : 2000
  };

  const updateResults = () => {
    const results = searchService.search(currentFilters);
    const resultsEl = container.querySelector('[data-search-results]');
    const countEl = container.querySelector('[data-result-count]');

    if (resultsEl) {
      resultsEl.innerHTML = results.length
        ? renderEntityGrid(results)
        : renderEmptyState({ icon: '🔍', title: 'Nenhum resultado', message: 'Tente outros termos.', ctaText: 'Limpar busca', ctaLink: '/busca' });
      bindFavoriteButtons(resultsEl, results);
      bindRevealAnimations(resultsEl);
      resultsEl.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }
    if (countEl) {
      countEl.textContent = `${pluralize(results.length, 'resultado encontrado', 'resultados encontrados')}${currentFilters.query ? ` para "${currentFilters.query}"` : ''}`;
    }

    const params = new URLSearchParams();
    if (currentFilters.query) params.set('q', currentFilters.query);
    if (currentFilters.type) params.set('tipo', currentFilters.type);
    if (currentFilters.cityId) params.set('cidade', currentFilters.cityId);
    if (currentFilters.tags.length) params.set('tag', currentFilters.tags[0]);
    if (currentFilters.sort !== 'relevance') params.set('ordenar', currentFilters.sort);
    if (currentFilters.priceMax < 2000) params.set('preco', currentFilters.priceMax);
    history.replaceState(null, '', `/busca?${params.toString()}`);
  };

  bindSearchBar(container, {
    onSubmit: (q) => { currentFilters.query = q; updateResults(); }
  });

  bindFilterPanel(container, (filters) => {
    currentFilters = { ...currentFilters, ...filters };
    updateResults();
  });

  bindRevealAnimations(container);
  container.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));

  container.querySelector('[data-result-tabs]')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab-type]');
    if (!tab) return;
    container.querySelectorAll('[data-result-tabs] button').forEach(b => b.classList.remove('is-active'));
    tab.classList.add('is-active');
    currentFilters.type = tab.dataset.tabType;
    updateResults();
  });

  bindFavoriteButtons(container, entityRepo.getAll());
}
