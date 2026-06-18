import { entityRepo } from '../storage/repositories/entity-repository.js';
import { renderDetailPage, bindDetailPage, renderRelatedSection } from './detail-shared.js';

export function renderBeachPage(route) {
  const entity = entityRepo.getBySlug(route.params.slug);
  if (!entity || entity.type !== 'beach') return null;
  const breadcrumbs = [
    { label: 'Praias', href: '/busca?tipo=beach' },
    { label: entity.cityName, href: `/cidade/${entityRepo.getById(entity.cityId)?.slug || ''}` }
  ];
  const related = entityRepo.getByType('beach').filter(e => e.id !== entity.id && e.cityId === entity.cityId);
  return renderDetailPage(entity, { breadcrumbs }) + renderRelatedSection('Outras praias', related);
}

export function bindBeachPage(container, route) {
  const entity = entityRepo.getBySlug(route.params.slug);
  if (entity) bindDetailPage(container, entity);
}
