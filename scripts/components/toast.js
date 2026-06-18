let toastContainer = null;

export function initToast() {
  toastContainer = document.getElementById('toast-root');
}

export function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) initToast();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
