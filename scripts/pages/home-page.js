import { entityRepo } from '../storage/repositories/entity-repository.js';
import { searchService } from '../services/search-service.js';
import { historyService } from '../services/history-service.js';
import { reviewsService } from '../services/reviews-service.js';
import { CATEGORIES } from '../../data/categories.js';
import { POPULAR_SEARCHES } from '../../data/constants.js';
import { wishlistService } from '../services/wishlist-service.js';
import { itineraryEngine } from '../services/itinerary-engine.js';
import { renderSearchBar, bindSearchBar } from '../components/search-bar.js';
import { renderSectionBlock, renderEntityCard } from '../components/entity-card.js';
import { renderRating } from '../components/rating.js';
import { bindFavoriteButtons } from '../components/favorite-button.js';
import { bindRevealAnimations } from '../utils/dom.js';

export function renderHomePage() {
  const cities = entityRepo.getByType('city').slice(0, 8);
  const beaches = entityRepo.getByType('beach').slice(0, 4);
  const hotels = entityRepo.getByType('hotel').sort((a, b) => b.rating - a.rating).slice(0, 4);
  const restaurants = entityRepo.getByType('restaurant').sort((a, b) => b.rating - a.rating).slice(0, 4);
  const tours = entityRepo.getByType('tour').slice(0, 4);
  const events = entityRepo.getByType('event').slice(0, 4);
  const serras = cities.filter(c => (c.tags || []).includes('serra'));
  const recent = historyService.getRecent(4);
  const recentEntities = recent.map(h => entityRepo.getById(h.entityId)).filter(Boolean);
  const reviews = reviewsService.getRecent(3);
  const wishlist = wishlistService.getEntities(entityRepo.getAll()).slice(0, 4);
  const savedRoutes = itineraryEngine.getAll().slice(0, 3);

  const news = [
    { title: 'Festival de Forró de Jeri', desc: 'Julho 2026 — música, cultura e pôr do sol', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', link: '/busca?tipo=event' },
    { title: 'Nova rota ecoturismo na Chapada', desc: 'Trilhas guiadas no Crato', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', link: '/busca?tag=natureza' },
    { title: 'Hotéis pet friendly em Fortaleza', desc: 'Viaje com seu pet pela orla', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099925?w=400&q=80', link: '/busca?tipo=hotel&tag=pet-friendly' }
  ];

  return `
    <section class="hero">
      <div class="hero__bg">
        <img src="https://images.unsplash.com/photo-1596484552834-0650573cbe53?w=1920&q=80" alt="Praia do Ceará ao pôr do sol">
      </div>
      <div class="hero__overlay"></div>
      <div class="hero__content container">
        <h1 class="hero__title">Descubra o melhor do Ceará</h1>
        <p class="hero__subtitle">Hotéis, praias, gastronomia, passeios e roteiros — tudo em um só lugar.</p>
        <div class="hero__search">${renderSearchBar({ variant: 'hero' })}</div>
        <div class="hero__actions" style="margin-top:var(--space-4)">
          <a href="/busca" data-nav class="btn btn--primary btn--lg">Buscar mais opções</a>
        </div>
        <div class="hero__popular chip-group" style="margin-top:var(--space-4)">
          ${POPULAR_SEARCHES.map(q => `
            <a href="/busca?q=${encodeURIComponent(q)}" data-nav class="chip chip--category">${q}</a>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title reveal">Explore por categoria</h2>
        <div class="categories-scroll reveal">
          ${CATEGORIES.map(cat => `
            <a href="/busca?tipo=${cat.type || ''}&tag=${cat.tag || ''}" data-nav class="category-card">
              <span class="category-card__icon">${cat.icon}</span>
              <span class="font-semibold">${cat.label}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    ${renderSectionBlock({ title: 'Destinos populares', subtitle: 'As cidades mais visitadas do Ceará', entities: cities, viewAllLink: '/busca?tipo=city', anchorId: 'destinos' })}
    ${renderSectionBlock({ title: 'Praias imperdíveis', subtitle: 'Do litoral urbano ao paraíso de Jeri', entities: beaches, viewAllLink: '/busca?tipo=beach', anchorId: 'praias' })}
    ${serras.length ? renderSectionBlock({ title: 'Serras e interior', subtitle: 'Clima ameno e natureza exuberante', entities: serras, viewAllLink: '/busca?tag=serra' }) : ''}
    ${renderSectionBlock({ title: 'Hotéis em destaque', subtitle: 'Hospedagens bem avaliadas', entities: hotels, viewAllLink: '/busca?tipo=hotel', anchorId: 'hoteis' })}
    ${renderSectionBlock({ title: 'Gastronomia', subtitle: 'Sabores autênticos do Ceará', entities: restaurants, viewAllLink: '/busca?tipo=restaurant', anchorId: 'gastronomia' })}
    ${renderSectionBlock({ title: 'Passeios e experiências', subtitle: 'Aventuras inesquecíveis', entities: tours, viewAllLink: '/busca?tipo=tour', anchorId: 'passeios' })}
    ${renderSectionBlock({ title: 'Eventos', subtitle: 'Festivais e celebrações', entities: events, viewAllLink: '/busca?tipo=event', anchorId: 'eventos' })}

    ${recentEntities.length ? renderSectionBlock({ title: 'Vistos recentemente', subtitle: 'Continue de onde parou', entities: recentEntities }) : ''}

    ${wishlist.length ? renderSectionBlock({ title: 'Quero conhecer', subtitle: 'Lugares que você marcou para visitar', entities: wishlist }) : ''}

    <section class="section section--alt reveal">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Novidades</h2>
            <p class="section-subtitle">O que há de novo no turismo cearense</p>
          </div>
        </div>
        <div class="grid grid--2 grid--3">
          ${news.map(n => `
            <a href="${n.link}" data-nav class="news-card">
              <div class="news-card__image aspect-4-3 overflow-hidden">
                <img src="${n.image}" alt="" class="object-cover" loading="lazy">
              </div>
              <div class="news-card__body">
                <h3 class="font-semibold">${n.title}</h3>
                <p class="text-sm text-muted">${n.desc}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    ${savedRoutes.length ? `
      <section class="section reveal">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Roteiros salvos</h2>
            <a href="/perfil?tab=roteiros" data-nav class="btn btn--ghost">Ver todos</a>
          </div>
          <div class="grid grid--2 grid--3">
            ${savedRoutes.map(r => `
              <div class="info-card">
                <h3>${r.cityName}</h3>
                <p class="text-muted">${r.days} dias · ${r.itinerary?.length || 0} dias planejados</p>
                <a href="/planejar" data-nav class="btn btn--ghost btn--sm" style="margin-top:var(--space-3)">Ver roteiro</a>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    ` : ''}

    <section class="section section--alt reveal">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Avaliações recentes</h2>
            <p class="section-subtitle">O que os viajantes estão dizendo</p>
          </div>
        </div>
        <div class="reviews-carousel">
          ${reviews.length ? reviews.map(r => {
            const entity = entityRepo.getById(r.entityId);
            return `
              <div class="review-card">
                <p class="review-card__text">"${r.text}"</p>
                <div class="flex items-center gap-4">
                  ${renderRating(r.rating)}
                  <span class="text-sm text-muted">${r.userName} · ${entity?.name || ''}</span>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="review-card">
              <p class="review-card__text">"Jericoacoara superou todas as expectativas. O pôr do sol na duna é mágico!"</p>
              ${renderRating(5)} <span class="text-sm text-muted">Maria · Jericoacoara</span>
            </div>
            <div class="review-card">
              <p class="review-card__text">"Fortaleza tem uma gastronomia incrível. O Coco Bambu é imperdível!"</p>
              ${renderRating(5)} <span class="text-sm text-muted">João · Fortaleza</span>
            </div>
          `}
        </div>
      </div>
    </section>

    <section class="section reveal">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Monte seu roteiro</h2>
          <a href="/planejar" data-nav class="btn btn--primary">Planejar viagem →</a>
        </div>
        <p class="section-subtitle">Informe seus dias, orçamento e interesses — nós criamos o roteiro perfeito para você.</p>
      </div>
    </section>
  `;
}

export function bindHomePage(container) {
  bindSearchBar(container);
  const allEntities = entityRepo.getAll();
  bindFavoriteButtons(container, allEntities);
  bindRevealAnimations(container);
}
