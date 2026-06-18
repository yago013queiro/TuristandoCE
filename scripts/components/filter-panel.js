import { TAGS } from '../../data/categories.js';
import { searchService } from '../services/search-service.js';

export function renderFilterPanel({ activeFilters = {} } = {}) {
  const cities = searchService.getCities();
  const types = [
    { id: '', label: 'Todos' },
    { id: 'city', label: 'Cidades' },
    { id: 'beach', label: 'Praias' },
    { id: 'hotel', label: 'Hotéis' },
    { id: 'restaurant', label: 'Restaurantes' },
    { id: 'tour', label: 'Passeios' },
    { id: 'event', label: 'Eventos' }
  ];

  return `
    <div class="search-filters" data-filter-panel>
      <div class="search-filters__group">
        <label>Tipo</label>
        <div class="chip-group" data-filter-type>
          ${types.map(t => `
            <button class="chip ${activeFilters.type === t.id ? 'is-active' : ''}"
              data-value="${t.id}">${t.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="search-filters__group">
        <label>Cidade</label>
        <select class="select" data-filter-city style="min-width:160px">
          <option value="">Todas</option>
          ${cities.map(c => `<option value="${c.id}" ${activeFilters.cityId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="search-filters__group">
        <label>Tags</label>
        <div class="chip-group" data-filter-tags>
          ${TAGS.slice(0, 8).map(t => `
            <button class="chip ${(activeFilters.tags || []).includes(t.id) ? 'is-active' : ''}"
              data-value="${t.id}">${t.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="search-filters__group">
        <label>Preço máximo</label>
        <input type="range" data-filter-price min="0" max="2000" step="100" value="2000">
        <span class="text-sm text-muted" data-price-label>Qualquer preço</span>
      </div>
      <div class="search-filters__group">
        <label>Ordenar</label>
        <select class="select" data-filter-sort style="min-width:140px">
          <option value="relevance" ${activeFilters.sort === 'relevance' ? 'selected' : ''}>Relevância</option>
          <option value="rating" ${activeFilters.sort === 'rating' ? 'selected' : ''}>Avaliação</option>
          <option value="price-asc" ${activeFilters.sort === 'price-asc' ? 'selected' : ''}>Menor preço</option>
          <option value="price-desc" ${activeFilters.sort === 'price-desc' ? 'selected' : ''}>Maior preço</option>
        </select>
      </div>
    </div>
  `;
}

export function bindFilterPanel(container, onChange) {
  const panel = container.querySelector('[data-filter-panel]');
  if (!panel) return;

  const state = {
    type: panel.querySelector('[data-filter-type] .chip.is-active')?.dataset.value || '',
    cityId: panel.querySelector('[data-filter-city]')?.value || '',
    tags: [...panel.querySelectorAll('[data-filter-tags] .chip.is-active')].map(c => c.dataset.value),
    sort: panel.querySelector('[data-filter-sort]')?.value || 'relevance',
    priceMax: parseInt(panel.querySelector('[data-filter-price]')?.value) || 2000
  };

  const emit = () => onChange({ ...state });

  panel.querySelector('[data-filter-type]')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    panel.querySelectorAll('[data-filter-type] .chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    state.type = chip.dataset.value;
    emit();
  });

  panel.querySelector('[data-filter-city]')?.addEventListener('change', (e) => {
    state.cityId = e.target.value;
    emit();
  });

  panel.querySelector('[data-filter-tags]')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chip.classList.toggle('is-active');
    const tag = chip.dataset.value;
    if (chip.classList.contains('is-active')) {
      if (!state.tags.includes(tag)) state.tags.push(tag);
    } else {
      state.tags = state.tags.filter(t => t !== tag);
    }
    emit();
  });

  panel.querySelector('[data-filter-sort]')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    emit();
  });

  panel.querySelector('[data-filter-price]')?.addEventListener('input', (e) => {
    state.priceMax = parseInt(e.target.value);
    const label = panel.querySelector('[data-price-label]');
    if (label) label.textContent = state.priceMax >= 2000 ? 'Qualquer preço' : `Até R$ ${state.priceMax.toLocaleString('pt-BR')}`;
    emit();
  });

  return state;
}

export function renderActiveFilters(filters, onRemove) {
  const pills = [];
  if (filters.type) pills.push({ key: 'type', label: filters.type });
  if (filters.cityId) pills.push({ key: 'cityId', label: 'Cidade' });
  (filters.tags || []).forEach(t => pills.push({ key: `tag:${t}`, label: t }));

  if (!pills.length) return '';
  return `
    <div class="active-filters">
      ${pills.map(p => `
        <span class="active-filter">${p.label}
          <button data-remove-filter="${p.key}" aria-label="Remover filtro">×</button>
        </span>
      `).join('')}
      <button class="chip" data-clear-filters>Limpar tudo</button>
    </div>
  `;
}
