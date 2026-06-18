export function renderSkeletonCards(count = 4) {
  return Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-card__image"></div>
      <div class="skeleton-card__body">
        <div class="skeleton skeleton-text skeleton-text--medium"></div>
        <div class="skeleton skeleton-text skeleton-text--short"></div>
      </div>
    </div>
  `).join('');
}
