import { debounce } from '../utils/debounce.js';
import { searchService } from '../services/search-service.js';
import { router } from '../router.js';

export function renderSearchBar({ variant = 'hero', placeholder = 'Para onde você quer ir?', value = '', showButton = true } = {}) {
  return `
    <div class="search-bar search-bar--${variant}" data-search-bar>
      <div class="search-bar__inner">
        <div class="search-bar__input-wrap">
          <span class="search-bar__icon" aria-hidden="true">🔍</span>
          <input type="search" class="search-bar__input" placeholder="${placeholder}"
            value="${value}" aria-label="Buscar destinos, hotéis, restaurantes..." autocomplete="off">
          <div class="search-suggestions hidden" data-suggestions></div>
        </div>
        ${showButton ? '<button type="button" class="btn btn--primary btn--lg" data-search-submit>Buscar</button>' : ''}
      </div>
    </div>
  `;
}

export function bindSearchBar(container, { onSubmit } = {}) {
  const bar = container.querySelector('[data-search-bar]');
  if (!bar) return;

  const input = bar.querySelector('.search-bar__input');
  const suggestions = bar.querySelector('[data-suggestions]');
  const submitBtn = bar.querySelector('[data-search-submit]');

  const doSearch = () => {
    const q = input.value.trim();
    if (onSubmit) onSubmit(q);
    else router.navigate(`/busca?q=${encodeURIComponent(q)}`);
    suggestions?.classList.add('hidden');
  };

  submitBtn?.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
    if (e.key === 'Escape') suggestions?.classList.add('hidden');
  });

  const showSuggestions = debounce((q) => {
    if (!q || q.length < 2) {
      suggestions?.classList.add('hidden');
      return;
    }
    const results = searchService.autocomplete(q);
    if (!results.length) {
      suggestions?.classList.add('hidden');
      return;
    }
    suggestions.innerHTML = results.map(r => `
      <div class="search-suggestions__item" data-suggest-slug="${r.slug}" data-suggest-type="${r.type}">
        <span>📍</span>
        <div>
          <strong>${r.name}</strong>
          <div class="search-suggestions__type">${r.type} · ${r.cityName || ''}</div>
        </div>
      </div>
    `).join('');
    suggestions.classList.remove('hidden');

    suggestions.querySelectorAll('.search-suggestions__item').forEach(item => {
      item.addEventListener('click', () => {
        const typeRoutes = { city: 'cidade', beach: 'praia', hotel: 'hotel', restaurant: 'restaurante', tour: 'passeio', event: 'evento' };
        const route = typeRoutes[item.dataset.suggestType] || 'busca';
        if (route === 'busca') router.navigate(`/busca?q=${encodeURIComponent(input.value)}`);
        else router.navigate(`/${route}/${item.dataset.suggestSlug}`);
      });
    });
  }, 200);

  input.addEventListener('input', () => showSuggestions(input.value.trim()));

  document.addEventListener('click', (e) => {
    if (!bar.contains(e.target)) suggestions?.classList.add('hidden');
  });
}
