import { storage } from '../storage-manager.js';
import { STORAGE_KEYS } from '../../../data/constants.js';

class EntityRepository {
  getAll() {
    return storage.get(STORAGE_KEYS.ENTITIES) || [];
  }

  getById(id) {
    return this.getAll().find(e => e.id === id) || null;
  }

  getBySlug(slug) {
    return this.getAll().find(e => e.slug === slug) || null;
  }

  getByType(type) {
    return this.getAll().filter(e => e.type === type);
  }

  getByCityId(cityId) {
    return this.getAll().filter(e => e.cityId === cityId && e.type !== 'city');
  }

  getByCitySlug(citySlug) {
    const city = this.getAll().find(e => e.type === 'city' && e.slug === citySlug);
    if (!city) return { city: null, items: [] };
    return { city, items: this.getByCityId(city.id) };
  }

  add(entity) {
    const all = this.getAll();
    all.push(entity);
    storage.set(STORAGE_KEYS.ENTITIES, all);
    return entity;
  }

  update(id, updates) {
    const all = this.getAll();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    storage.set(STORAGE_KEYS.ENTITIES, all);
    return all[idx];
  }

  remove(id) {
    const all = this.getAll().filter(e => e.id !== id);
    storage.set(STORAGE_KEYS.ENTITIES, all);
  }

  getByOwner(ownerId) {
    return this.getAll().filter(e => e.ownerId === ownerId);
  }
}

export const entityRepo = new EntityRepository();
