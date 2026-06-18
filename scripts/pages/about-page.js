export function renderAboutPage() {
  return `
    <div class="about-page">
      <div class="page-hero">
        <div class="container page-hero__inner">
          <h1>Sobre o Turistando CE</h1>
          <p>A plataforma completa de turismo do Ceará — feita para quem ama viajar.</p>
        </div>
      </div>

      <div class="container">
        <section class="about-section">
          <h2>Nossa missão</h2>
          <p class="section-subtitle">Facilitar o planejamento de viagens no Ceará através de tecnologia, organização e informações confiáveis. Queremos que você encontre tudo em um só lugar — sem precisar pesquisar em dezenas de sites diferentes.</p>
        </section>

        <section class="about-section">
          <h2>Por que existimos</h2>
          <p>Hoje quem deseja conhecer o Ceará enfrenta informações espalhadas no Google, Booking, TripAdvisor, Instagram e blogs. O Turistando CE centraliza destinos, hotéis, restaurantes, passeios, eventos e roteiros em uma experiência moderna e intuitiva.</p>
        </section>

        <section class="about-section">
          <h2>Nossos valores</h2>
          <div class="about-values">
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">🛡️</div>
              <h3>Confiabilidade</h3>
              <p>Informações verificadas e atualizadas por nossa equipe e parceiros locais.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">✨</div>
              <h3>Simplicidade</h3>
              <p>Navegação intuitiva inspirada nas melhores plataformas do mundo.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">♿</div>
              <h3>Acessibilidade</h3>
              <p>Modo escuro, ajuste de fonte, alto contraste e leitura por voz.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">🌿</div>
              <h3>Sustentabilidade</h3>
              <p>Valorização do turismo responsável e da cultura cearense.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">🗺️</div>
              <h3>Inovação</h3>
              <p>Roteiros inteligentes, mapas interativos e busca avançada.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">❤️</div>
              <h3>Cultura local</h3>
              <p>Feito por cearenses, para quem quer viver o melhor do nosso estado.</p>
            </div>
          </div>
        </section>

        <section class="about-section text-center">
          <h2>Pronto para explorar?</h2>
          <p class="section-subtitle" style="margin:0 auto var(--space-6)">Comece sua jornada pelo Ceará agora mesmo.</p>
          <a href="/busca" data-nav class="btn btn--primary btn--lg">Explorar destinos</a>
        </section>
      </div>
    </div>
  `;
}

export function bindAboutPage(container) {
  import('../utils/dom.js').then(({ bindRevealAnimations }) => bindRevealAnimations(container));
}
