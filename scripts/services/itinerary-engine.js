import { entityRepo } from '../storage/repositories/entity-repository.js';
import { searchService } from './search-service.js';
import { generateId } from '../utils/slug.js';
import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';

class ItineraryEngine {
  generate({ days = 3, budget = 3000, cityId, interests = [], profile = 'familia' }) {
    const city = entityRepo.getById(cityId);
    if (!city) throw new Error('Cidade não encontrada');

    const dailyBudget = budget / days;
    const pool = searchService.search({ cityId });
    const scored = pool.map(e => ({
      entity: e,
      score: this._score(e, interests, profile)
    })).sort((a, b) => b.score - a.score);

    const itinerary = [];
    const used = new Set();

    for (let d = 0; d < days; d++) {
      const dayActivities = [];
      let dayCost = 0;
      const slots = [
        { time: '08:00', types: ['tour', 'beach'] },
        { time: '12:30', types: ['restaurant'] },
        { time: '14:30', types: ['tour', 'beach', 'event'] },
        { time: '19:30', types: ['restaurant', 'event'] }
      ];

      for (const slot of slots) {
        const candidate = scored.find(({ entity }) => {
          if (used.has(entity.id)) return false;
          if (!slot.types.includes(entity.type)) return false;
          const cost = this._getCost(entity);
          return dayCost + cost <= dailyBudget * 1.2;
        });

        if (candidate) {
          const cost = this._getCost(candidate.entity);
          dayActivities.push({
            time: slot.time,
            entity: candidate.entity,
            cost
          });
          dayCost += cost;
          used.add(candidate.entity.id);
        }
      }

      itinerary.push({
        day: d + 1,
        date: this._addDays(new Date(), d),
        activities: dayActivities,
        estimatedCost: dayCost
      });
    }

    const totalCost = itinerary.reduce((s, d) => s + d.estimatedCost, 0);

    return {
      id: generateId('itinerary'),
      cityId,
      cityName: city.name,
      days,
      budget,
      interests,
      profile,
      itinerary,
      totalCost,
      createdAt: new Date().toISOString()
    };
  }

  _score(entity, interests, profile) {
    let score = entity.rating || 4;
    const tags = entity.tags || [];
    interests.forEach(i => {
      const map = { praias: 'praia', gastronomia: 'gastronomia', cultura: 'cultural', aventura: 'aventura', natureza: 'natureza', noite: 'noite' };
      if (tags.includes(map[i] || i)) score += 2;
    });
    const profileTags = { familia: 'familia', casal: 'casal', amigos: 'aventura', aventureiro: 'aventura', luxo: 'luxo' };
    if (tags.includes(profileTags[profile])) score += 1.5;
    return score;
  }

  _getCost(entity) {
    if (typeof entity.priceRange === 'number') return entity.priceRange * 40;
    if (entity.priceRange?.min) return entity.priceRange.min;
    return 50;
  }

  _addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  save(itinerary) {
    const all = storage.get(STORAGE_KEYS.ITINERARIES) || [];
    all.unshift(itinerary);
    storage.set(STORAGE_KEYS.ITINERARIES, all);
    return itinerary;
  }

  getAll() {
    return storage.get(STORAGE_KEYS.ITINERARIES) || [];
  }

  remove(id) {
    const all = this.getAll().filter(i => i.id !== id);
    storage.set(STORAGE_KEYS.ITINERARIES, all);
  }
}

export const itineraryEngine = new ItineraryEngine();
