export function renderGallery(images, alt = '') {
  if (!images?.length) return '';
  const [main, ...rest] = images;
  return `
    <div class="gallery gallery--grid">
      <div class="gallery__main gallery__item" data-lightbox="${main}">
        <img src="${main}" alt="${alt}" class="object-cover aspect-4-3">
      </div>
      ${rest.slice(0, 2).map((img, i) => `
        <div class="gallery__item" data-lightbox="${img}">
          <img src="${img}" alt="${alt} ${i + 2}" class="object-cover" style="height:100%">
          ${i === 1 && rest.length > 2 ? `<div class="gallery__more">+${rest.length - 1} fotos</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

export function bindGallery(container) {
  container.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox;
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `<button class="lightbox__close" aria-label="Fechar">&times;</button><img src="${src}" alt="">`;
      lb.querySelector('.lightbox__close').addEventListener('click', () => lb.remove());
      lb.addEventListener('click', (e) => { if (e.target === lb) lb.remove(); });
      document.body.appendChild(lb);
    });
  });
}
