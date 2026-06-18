import { PREFIX, STORAGE_KEYS, SEED_VERSION } from '../../data/constants.js';
import { seedEntities } from '../../data/seed.js';
import { eventBus, EVENTS } from '../event-bus.js';

class StorageManager {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key, value });
  }

  remove(key) {
    localStorage.removeItem(PREFIX + key);
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key });
  }

  setIfEmpty(key, value) {
    if (!this.get(key)) this.set(key, value);
  }

  init() {
    const currentVersion = this.get(STORAGE_KEYS.SEED_VERSION);
    if (currentVersion !== SEED_VERSION) {
      this.set(STORAGE_KEYS.ENTITIES, seedEntities);
      this.set(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
      if (!this.get(STORAGE_KEYS.FAVORITES)) this.set(STORAGE_KEYS.FAVORITES, []);
      if (!this.get(STORAGE_KEYS.WISHLIST)) this.set(STORAGE_KEYS.WISHLIST, []);
      if (!this.get(STORAGE_KEYS.HISTORY)) this.set(STORAGE_KEYS.HISTORY, []);
      if (!this.get(STORAGE_KEYS.ITINERARIES)) this.set(STORAGE_KEYS.ITINERARIES, []);
      if (!this.get(STORAGE_KEYS.REVIEWS)) this.set(STORAGE_KEYS.REVIEWS, []);
      if (!this.get(STORAGE_KEYS.USERS)) this.set(STORAGE_KEYS.USERS, []);
      if (!this.get(STORAGE_KEYS.PREFERENCES)) this.set(STORAGE_KEYS.PREFERENCES, { interests: [], profile: '' });
    } else {
      this.ensureCollections();
    }
    this.applyTheme();
  }

  ensureCollections() {
    const entities = this.get(STORAGE_KEYS.ENTITIES);
    if (!entities || entities.length === 0) {
      this.set(STORAGE_KEYS.ENTITIES, seedEntities);
    }
    ['FAVORITES', 'WISHLIST', 'HISTORY', 'ITINERARIES', 'REVIEWS', 'USERS'].forEach(k => {
      if (!this.get(STORAGE_KEYS[k])) this.set(STORAGE_KEYS[k], []);
    });
    if (!this.get(STORAGE_KEYS.PREFERENCES)) {
      this.set(STORAGE_KEYS.PREFERENCES, { interests: [], profile: '' });
    }
  }

  resetDemo() {
    this.set(STORAGE_KEYS.ENTITIES, seedEntities);
    this.set(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
    this.set(STORAGE_KEYS.FAVORITES, []);
    this.set(STORAGE_KEYS.HISTORY, []);
    this.set(STORAGE_KEYS.ITINERARIES, []);
    this.set(STORAGE_KEYS.REVIEWS, []);
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key: 'reset' });
  }

  getTheme() {
    return this.get(STORAGE_KEYS.THEME) || 'light';
  }

  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
    document.documentElement.dataset.theme = theme;
    eventBus.emit(EVENTS.THEME_CHANGED, theme);
  }

  applyTheme() {
    document.documentElement.dataset.theme = this.getTheme();
  }

  toggleTheme() {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }
}

export const storage = new StorageManager();
