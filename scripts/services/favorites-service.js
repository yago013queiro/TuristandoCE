import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';
import { eventBus, EVENTS } from '../event-bus.js';

class FavoritesService {
  getAll() {
    return storage.get(STORAGE_KEYS.FAVORITES) || [];
  }

  isFavorite(entityId) {
    return this.getAll().some(f => f.entityId === entityId);
  }

  toggle(entity) {
    const favorites = this.getAll();
    const idx = favorites.findIndex(f => f.entityId === entity.id);
    if (idx >= 0) {
      favorites.splice(idx, 1);
    } else {
      favorites.unshift({
        entityId: entity.id,
        entityType: entity.type,
        name: entity.name,
        slug: entity.slug,
        coverImage: entity.coverImage,
        cityName: entity.cityName,
        addedAt: new Date().toISOString()
      });
    }
    storage.set(STORAGE_KEYS.FAVORITES, favorites);
    eventBus.emit(EVENTS.FAVORITE_TOGGLED, { entityId: entity.id, isFavorite: idx < 0 });
    return idx < 0;
  }

  getEntities(allEntities) {
    const ids = new Set(this.getAll().map(f => f.entityId));
    return allEntities.filter(e => ids.has(e.id));
  }
}

export const favoritesService = new FavoritesService();
