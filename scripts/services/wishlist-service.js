import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';
import { eventBus, EVENTS } from '../event-bus.js';

class WishlistService {
  getAll() {
    return storage.get(STORAGE_KEYS.WISHLIST) || [];
  }

  isWished(entityId) {
    return this.getAll().some(w => w.entityId === entityId);
  }

  toggle(entity) {
    const list = this.getAll();
    const idx = list.findIndex(w => w.entityId === entity.id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift({
        entityId: entity.id,
        entityType: entity.type,
        name: entity.name,
        slug: entity.slug,
        coverImage: entity.coverImage,
        cityName: entity.cityName,
        addedAt: new Date().toISOString()
      });
    }
    storage.set(STORAGE_KEYS.WISHLIST, list);
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key: STORAGE_KEYS.WISHLIST });
    return idx < 0;
  }

  getEntities(allEntities) {
    const ids = new Set(this.getAll().map(w => w.entityId));
    return allEntities.filter(e => ids.has(e.id));
  }
}

export const wishlistService = new WishlistService();
