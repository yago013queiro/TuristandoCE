import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';

const MAX_HISTORY = 50;

class HistoryService {
  getAll() {
    return storage.get(STORAGE_KEYS.HISTORY) || [];
  }

  add(entity) {
    let history = this.getAll().filter(h => h.entityId !== entity.id);
    history.unshift({
      entityId: entity.id,
      entityType: entity.type,
      name: entity.name,
      slug: entity.slug,
      coverImage: entity.coverImage,
      cityName: entity.cityName,
      viewedAt: new Date().toISOString()
    });
    history = history.slice(0, MAX_HISTORY);
    storage.set(STORAGE_KEYS.HISTORY, history);
  }

  getRecent(limit = 10) {
    return this.getAll().slice(0, limit);
  }

  getEntities(allEntities, limit = 10) {
    const history = this.getRecent(limit);
    return history.map(h => allEntities.find(e => e.id === h.entityId)).filter(Boolean);
  }
}

export const historyService = new HistoryService();
