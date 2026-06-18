export function renderFooter() {
  return `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <a href="/" data-nav class="site-header__logo" style="color:white">
              <span class="site-header__logo-icon">🌴</span>
              <span>Turistando <strong>CE</strong></span>
            </a>
            <p>A plataforma completa de turismo do Ceará. Descubra, planeje e viva experiências inesquecíveis.</p>
            <div class="site-footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">📷</a>
              <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">📘</a>
              <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <div>
            <h4 class="site-footer__title">Explorar</h4>
            <ul class="site-footer__links">
              <li><a href="/busca?tipo=city" data-nav>Destinos</a></li>
              <li><a href="/busca?tipo=beach" data-nav>Praias</a></li>
              <li><a href="/busca?tipo=hotel" data-nav>Hotéis</a></li>
              <li><a href="/busca?tipo=restaurant" data-nav>Restaurantes</a></li>
              <li><a href="/mapa" data-nav>Mapa</a></li>
            </ul>
          </div>
          <div>
            <h4 class="site-footer__title">Plataforma</h4>
            <ul class="site-footer__links">
              <li><a href="/planejar" data-nav>Planejar viagem</a></li>
              <li><a href="/perfil" data-nav>Meu perfil</a></li>
              <li><a href="/cadastrar" data-nav>Cadastrar estabelecimento</a></li>
              <li><a href="/sobre" data-nav>Sobre nós</a></li>
            </ul>
          </div>
          <div>
            <h4 class="site-footer__title">Newsletter</h4>
            <p class="text-sm" style="opacity:0.8">Receba dicas e ofertas do Ceará</p>
            <form class="newsletter-form" data-newsletter>
              <input type="email" placeholder="Seu e-mail" aria-label="E-mail para newsletter">
              <button type="submit" class="btn btn--secondary btn--sm">OK</button>
            </form>
          </div>
        </div>
        <div class="site-footer__bottom">
          <span>© 2026 Turistando CE. Todos os direitos reservados.</span>
          <button data-a11y-open class="btn btn--ghost btn--sm" style="color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.3)">♿ Acessibilidade</button>
        </div>
      </div>
    </footer>
  `;
}

export function bindFooter(container) {
  container.querySelector('[data-newsletter]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    import('./toast.js').then(({ showToast }) => showToast('Inscrição realizada! Obrigado.', 'success'));
    e.target.reset();
  });
}
