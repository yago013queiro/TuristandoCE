import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';
import { entityRepo } from '../storage/repositories/entity-repository.js';
import { generateId, slugify } from '../utils/slug.js';
import { eventBus, EVENTS } from '../event-bus.js';

class AuthService {
  getUsers() {
    return storage.get(STORAGE_KEYS.USERS) || [];
  }

  getSession() {
    return storage.get(STORAGE_KEYS.SESSION);
  }

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return this.getUsers().find(u => u.id === session.userId) || null;
  }

  isLoggedIn() {
    return !!this.getSession();
  }

  isPartner() {
    const user = this.getCurrentUser();
    return user?.role === 'parceiro';
  }

  register({ name, email, password, role = 'turista' }) {
    const users = this.getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error('E-mail já cadastrado');
    }
    const user = {
      id: generateId('user'),
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    storage.set(STORAGE_KEYS.USERS, users);
    this.login(email, password);
    return user;
  }

  login(email, password) {
    const user = this.getUsers().find(u => u.email === email && u.password === password);
    if (!user) throw new Error('E-mail ou senha incorretos');
    storage.set(STORAGE_KEYS.SESSION, { userId: user.id, loginAt: new Date().toISOString() });
    eventBus.emit(EVENTS.AUTH_CHANGED, user);
    return user;
  }

  logout() {
    storage.remove(STORAGE_KEYS.SESSION);
    eventBus.emit(EVENTS.AUTH_CHANGED, null);
  }
}

class EstablishmentService {
  register(data, ownerId) {
    const entity = {
      id: generateId(data.type),
      slug: slugify(data.name) + '-' + Date.now().toString(36),
      type: data.type,
      name: data.name,
      cityId: data.cityId,
      cityName: data.cityName,
      category: data.category || data.type,
      tags: data.tags || [],
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099925?w=800&q=80',
      images: data.images || [],
      rating: 0,
      reviewCount: 0,
      priceRange: data.priceRange || 2,
      description: data.description || '',
      summary: data.description?.slice(0, 120) || '',
      location: data.location || { lat: -3.73, lng: -38.52, address: data.address || '' },
      amenities: data.amenities || [],
      schedule: data.schedule || null,
      metadata: data.metadata || {},
      ownerId,
      createdAt: new Date().toISOString()
    };
    return entityRepo.add(entity);
  }

  update(id, data, ownerId) {
    const entity = entityRepo.getById(id);
    if (!entity || entity.ownerId !== ownerId) throw new Error('Sem permissão');
    return entityRepo.update(id, data);
  }

  remove(id, ownerId) {
    const entity = entityRepo.getById(id);
    if (!entity || entity.ownerId !== ownerId) throw new Error('Sem permissão');
    entityRepo.remove(id);
  }

  getByOwner(ownerId) {
    return entityRepo.getByOwner(ownerId);
  }
}

export const authService = new AuthService();
export const establishmentService = new EstablishmentService();
