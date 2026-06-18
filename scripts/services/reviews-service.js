import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';
import { generateId } from '../utils/slug.js';

class ReviewsService {
  getAll() {
    return storage.get(STORAGE_KEYS.REVIEWS) || [];
  }

  getByEntity(entityId) {
    return this.getAll().filter(r => r.entityId === entityId);
  }

  getByUser(userId) {
    return this.getAll().filter(r => r.userId === userId);
  }

  add({ entityId, userId, userName, rating, text }) {
    const reviews = this.getAll();
    const review = {
      id: generateId('review'),
      entityId,
      userId,
      userName,
      rating,
      text,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(review);
    storage.set(STORAGE_KEYS.REVIEWS, reviews);
    return review;
  }

  getRecent(limit = 5) {
    return this.getAll().slice(0, limit);
  }

  getAverageRating(entityId) {
    const reviews = this.getByEntity(entityId);
    if (!reviews.length) return null;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }
}

export const reviewsService = new ReviewsService();
