class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    this._listeners.get(event)?.forEach(cb => cb(data));
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  STORAGE_UPDATED: 'turistando:storage-updated',
  FAVORITE_TOGGLED: 'turistando:favorite-toggled',
  AUTH_CHANGED: 'turistando:auth-changed',
  THEME_CHANGED: 'turistando:theme-changed',
  ROUTE_CHANGED: 'turistando:route-changed'
};
