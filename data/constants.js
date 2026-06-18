export const PREFIX = 'turistando_';

export const STORAGE_KEYS = {
  ENTITIES: 'entities',
  USERS: 'users',
  SESSION: 'session',
  FAVORITES: 'favorites',
  WISHLIST: 'wishlist',
  HISTORY: 'history',
  ITINERARIES: 'itineraries',
  REVIEWS: 'reviews',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  A11Y: 'a11y',
  SEED_VERSION: 'seed_version'
};

export const SEED_VERSION = '2.0.0';

export const ENTITY_TYPES = {
  CITY: 'city',
  BEACH: 'beach',
  HOTEL: 'hotel',
  RESTAURANT: 'restaurant',
  TOUR: 'tour',
  EVENT: 'event',
  ESTABLISHMENT: 'establishment'
};

export const ROUTES = {
  HOME: '/',
  SEARCH: '/busca',
  CITY: '/cidade/:slug',
  BEACH: '/praia/:slug',
  HOTEL: '/hotel/:slug',
  RESTAURANT: '/restaurante/:slug',
  TOUR: '/passeio/:slug',
  EVENT: '/evento/:slug',
  MAP: '/mapa',
  PLANNER: '/planejar',
  PROFILE: '/perfil',
  REGISTER: '/cadastrar',
  ABOUT: '/sobre'
};

export const POPULAR_SEARCHES = [
  'Fortaleza', 'Jericoacoara', 'Praia', 'Hotel beira-mar',
  'Gastronomia', 'Canoa Quebrada', 'Passeio buggy'
];
