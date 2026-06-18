import { storage } from '../storage/storage-manager.js';
import { authService } from '../services/auth-service.js';
import { router } from '../router.js';
import { renderSearchBar, bindSearchBar } from './search-bar.js';
import { openModal } from './modal.js';
import { showToast } from './toast.js';
import { eventBus, EVENTS } from '../event-bus.js';

const NAV_ITEMS = [
  { label: 'Destinos', href: '/#destinos' },
  { label: 'Praias', href: '/#praias' },
  { label: 'Hotéis', href: '/#hoteis' },
  { label: 'Gastronomia', href: '/#gastronomia' },
  { label: 'Passeios', href: '/#passeios' },
  { label: 'Eventos', href: '/#eventos' },
  { label: 'Mapa', href: '/mapa' }
];

export function renderHeader() {
  const user = authService.getCurrentUser();
  const theme = storage.getTheme();
  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '';

  return `
    <header class="site-header" role="banner">
      <div class="container site-header__inner">
        <a href="/" data-nav class="site-header__logo">
          <span class="site-header__logo-icon" aria-hidden="true">🌴</span>
          <span>Turistando <strong>CE</strong></span>
        </a>

        <nav class="site-nav" aria-label="Principal">
          ${NAV_ITEMS.map(item => `<a href="${item.href}" data-nav class="site-nav__link">${item.label}</a>`).join('')}
        </nav>

        <div class="site-header__search-compact hide-mobile">
          ${renderSearchBar({ variant: 'compact', showButton: false })}
        </div>

        <div class="site-header__actions">
          <a href="/planejar" data-nav class="btn btn--secondary btn--sm hide-mobile">Planejar viagem</a>
          <button class="theme-toggle" data-theme-toggle aria-label="Alternar tema">${theme === 'dark' ? '☀️' : '🌙'}</button>
          ${user ? `
            <div class="profile-dropdown" data-profile-dropdown>
              <button class="profile-avatar" aria-label="Menu do perfil">${initials}</button>
              <div class="profile-dropdown__menu">
                <span class="profile-dropdown__item text-muted" style="pointer-events:none">${user.name}</span>
                <a href="/perfil" data-nav class="profile-dropdown__item">Meu perfil</a>
                <a href="/perfil" data-nav class="profile-dropdown__item">Favoritos</a>
                ${user.role === 'parceiro' ? '<a href="/cadastrar" data-nav class="profile-dropdown__item">Cadastrar</a>' : ''}
                <button class="profile-dropdown__item" data-logout>Sair</button>
              </div>
            </div>
          ` : `
            <button class="btn btn--ghost btn--sm" data-auth-open>Entrar</button>
          `}
          <button class="mobile-menu-btn" data-mobile-menu aria-label="Menu">☰</button>
        </div>
      </div>

      <nav class="mobile-nav" data-mobile-nav aria-label="Menu mobile">
        ${NAV_ITEMS.map(item => `<a href="${item.href}" data-nav class="mobile-nav__link">${item.label}</a>`).join('')}
        <a href="/planejar" data-nav class="mobile-nav__link">Planejar viagem</a>
        <a href="/perfil" data-nav class="mobile-nav__link">Perfil</a>
        <a href="/sobre" data-nav class="mobile-nav__link">Sobre</a>
      </nav>
    </header>
  `;
}

export function bindHeader(container) {
  container.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const theme = storage.toggleTheme();
    container.querySelector('[data-theme-toggle]').textContent = theme === 'dark' ? '☀️' : '🌙';
  });

  container.querySelector('[data-mobile-menu]')?.addEventListener('click', () => {
    container.querySelector('[data-mobile-nav]')?.classList.toggle('is-open');
  });

  container.querySelector('[data-mobile-nav]')?.addEventListener('click', () => {
    container.querySelector('[data-mobile-nav]')?.classList.remove('is-open');
  });

  const dropdown = container.querySelector('[data-profile-dropdown]');
  dropdown?.querySelector('.profile-avatar')?.addEventListener('click', () => {
    dropdown.classList.toggle('is-open');
  });

  container.querySelector('[data-logout]')?.addEventListener('click', () => {
    authService.logout();
    showToast('Você saiu da conta', 'info');
    router.navigate('/');
  });

  container.querySelector('[data-auth-open]')?.addEventListener('click', () => {
    openAuthModal();
  });

  bindSearchBar(container);

  eventBus.on(EVENTS.AUTH_CHANGED, () => {
    const headerEl = document.querySelector('.site-header');
    if (headerEl) {
      headerEl.outerHTML = renderHeader();
      bindHeader(document.getElementById('app-root'));
    }
  });
}

export function openAuthModal() {
  let mode = 'login';
  const content = document.createElement('div');

  const render = () => {
    content.innerHTML = `
      <div class="auth-tabs">
        <button class="${mode === 'login' ? 'is-active' : ''}" data-mode="login">Entrar</button>
        <button class="${mode === 'register' ? 'is-active' : ''}" data-mode="register">Cadastrar</button>
      </div>
      <form data-auth-form>
        ${mode === 'register' ? `
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input class="input" name="name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Perfil</label>
            <select class="select" name="role">
              <option value="turista">Turista</option>
              <option value="parceiro">Parceiro (hotel/restaurante)</option>
            </select>
          </div>
        ` : ''}
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="input" type="email" name="email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input class="input" type="password" name="password" required minlength="4">
        </div>
        <button type="submit" class="btn btn--primary btn--block">${mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
    `;

    content.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => { mode = btn.dataset.mode; render(); });
    });

    content.querySelector('[data-auth-form]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        if (mode === 'login') {
          authService.login(fd.get('email'), fd.get('password'));
          showToast('Bem-vindo de volta!', 'success');
        } else {
          authService.register({
            name: fd.get('name'),
            email: fd.get('email'),
            password: fd.get('password'),
            role: fd.get('role')
          });
          showToast('Conta criada com sucesso!', 'success');
        }
        modal.close();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  const modal = openModal({ title: 'Acesse sua conta', content });
  render();
}
