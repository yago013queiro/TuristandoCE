import { searchService } from '../services/search-service.js';
import { itineraryEngine } from '../services/itinerary-engine.js';
import { INTERESTS, PROFILES } from '../../data/categories.js';
import { formatPrice } from '../utils/format.js';
import { showToast } from '../components/toast.js';

export function renderPlannerPage(route) {
  const cities = searchService.getCities();
  const preCity = route.query.cidade || '';

  return `
    <div class="planner-page">
      <div class="container">
        <h1>Planeje sua viagem</h1>
        <p class="text-muted section-subtitle">Informe suas preferências e receba um roteiro personalizado</p>

        <div class="planner-layout">
          <div class="planner-form-card">
            <form data-planner-form>
              <div class="form-group">
                <label class="form-label">Cidade base</label>
                <select class="select" name="cityId" required>
                  ${cities.map(c => `<option value="${c.id}" ${c.id === preCity ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Quantos dias?</label>
                <input class="input" type="number" name="days" min="1" max="14" value="3" required>
              </div>
              <div class="form-group">
                <label class="form-label">Orçamento total (R$)</label>
                <input class="input" type="number" name="budget" min="500" step="100" value="3000" required>
              </div>
              <div class="form-group">
                <label class="form-label">Perfil da viagem</label>
                <select class="select" name="profile">
                  ${PROFILES.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Interesses</label>
                <div class="checkbox-group">
                  ${INTERESTS.map(i => `
                    <label class="checkbox-label">
                      <input type="checkbox" name="interests" value="${i.id}"> ${i.label}
                    </label>
                  `).join('')}
                </div>
              </div>
              <button type="submit" class="btn btn--primary btn--block">Gerar roteiro</button>
            </form>
          </div>

          <div class="planner-result" data-planner-result>
            <div class="empty-state">
              <div class="empty-state__icon">🗺️</div>
              <h3>Seu roteiro aparecerá aqui</h3>
              <p>Preencha o formulário e clique em gerar roteiro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderItinerary(result) {
  return `
    <div class="itinerary-summary">
      <div class="itinerary-summary__item"><span>Cidade</span><strong>${result.cityName}</strong></div>
      <div class="itinerary-summary__item"><span>Dias</span><strong>${result.days}</strong></div>
      <div class="itinerary-summary__item"><span>Orçamento</span><strong>${formatPrice(result.budget)}</strong></div>
      <div class="itinerary-summary__item"><span>Custo estimado</span><strong>${formatPrice(result.totalCost)}</strong></div>
    </div>
    ${result.itinerary.map(day => `
      <div class="itinerary-day">
        <div class="itinerary-day__header">
          <span class="itinerary-day__title">Dia ${day.day}</span>
          <span class="itinerary-day__cost">${formatPrice(day.estimatedCost)}</span>
        </div>
        ${day.activities.map(a => `
          <div class="itinerary-activity">
            <span class="itinerary-activity__time">${a.time}</span>
            <span class="itinerary-activity__icon">${{ hotel: '🏨', restaurant: '🍽️', tour: '🚐', beach: '🏖️', event: '🎉' }[a.entity.type] || '📍'}</span>
            <div class="itinerary-activity__info">
              <h4>${a.entity.name}</h4>
              <p>${a.entity.cityName} · ${formatPrice(a.cost)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
    <button class="btn btn--primary btn--block" data-save-itinerary style="margin-top:var(--space-4)">Salvar roteiro</button>
  `;
}

export function bindPlannerPage(container) {
  let lastResult = null;

  container.querySelector('[data-planner-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const interests = fd.getAll('interests');

    const resultEl = container.querySelector('[data-planner-result]');
    resultEl.innerHTML = '<div class="loading-overlay" style="position:relative;min-height:200px"><div class="spinner"></div></div>';

    setTimeout(() => {
      try {
        lastResult = itineraryEngine.generate({
          days: parseInt(fd.get('days')),
          budget: parseInt(fd.get('budget')),
          cityId: fd.get('cityId'),
          interests,
          profile: fd.get('profile')
        });
        resultEl.innerHTML = renderItinerary(lastResult);
        resultEl.querySelector('[data-save-itinerary]')?.addEventListener('click', () => {
          itineraryEngine.save(lastResult);
          showToast('Roteiro salvo no seu perfil!', 'success');
        });
      } catch (err) {
        resultEl.innerHTML = `<p class="text-muted">${err.message}</p>`;
      }
    }, 600);
  });
}
