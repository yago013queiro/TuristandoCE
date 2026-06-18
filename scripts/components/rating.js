import { formatRating } from '../utils/format.js';

export function renderRating(rating, reviewCount) {
  return `
    <span class="rating" aria-label="Avaliação ${rating} de 5">
      <span class="rating__star">★</span>
      <span>${formatRating(rating)}</span>
      ${reviewCount ? `<span class="text-muted">(${reviewCount})</span>` : ''}
    </span>
  `;
}

export function renderRatingInput(name = 'rating', value = 5) {
  return `
    <div class="rating rating--input" data-rating-input="${name}">
      ${[1, 2, 3, 4, 5].map(n => `
        <span class="rating__star" data-value="${n}" role="button" tabindex="0"
          aria-label="${n} estrelas" style="color: ${n <= value ? '#F59E0B' : '#D1D5DB'}">★</span>
      `).join('')}
      <input type="hidden" name="${name}" value="${value}">
    </div>
  `;
}

export function bindRatingInput(container) {
  container.querySelectorAll('[data-rating-input]').forEach(wrap => {
    const input = wrap.querySelector('input[type="hidden"]');
    wrap.querySelectorAll('.rating__star').forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        input.value = val;
        wrap.querySelectorAll('.rating__star').forEach(s => {
          s.style.color = parseInt(s.dataset.value) <= val ? '#F59E0B' : '#D1D5DB';
        });
      });
    });
  });
}
