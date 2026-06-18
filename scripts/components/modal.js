import { trapFocus } from '../utils/a11y.js';

let modalRoot = null;

export function initModal() {
  modalRoot = document.getElementById('modal-root');
}

export function openModal({ title, content, size = '', onClose }) {
  if (!modalRoot) initModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal ${size ? `modal--${size}` : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal__header">
        <h2 class="modal__title" id="modal-title">${title}</h2>
        <button class="modal__close" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">${typeof content === 'string' ? content : ''}</div>
    </div>
  `;

  if (content instanceof HTMLElement) {
    overlay.querySelector('.modal__body').appendChild(content);
  }

  const close = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 250);
    document.body.style.overflow = '';
    onClose?.();
  };

  overlay.querySelector('.modal__close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  modalRoot.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    trapFocus(overlay.querySelector('.modal'));
  });

  return { close, overlay };
}
