import { entityRepo } from '../storage/repositories/entity-repository.js';
import { renderEntityGrid } from '../components/entity-card.js';

export function renderNotFoundPage() {
  const suggestions = entityRepo.getByType('city').slice(0, 4);
  return `
    <div class="not-found container">
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p class="text-muted" style="margin-bottom:var(--space-8)">O destino que você procura não existe ou foi movido.</p>
      <a href="/" data-nav class="btn btn--primary">Voltar ao início</a>
      <section style="margin-top:var(--space-16)">
        <h3 class="section-title">Destinos populares</h3>
        ${renderEntityGrid(suggestions)}
      </section>
    </div>
  `;
}

export function bindNotFoundPage() {}
