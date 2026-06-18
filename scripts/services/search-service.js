import { storage } from '../storage/storage-manager.js';
import { STORAGE_KEYS } from '../../data/constants.js';
import { entityRepo } from '../storage/repositories/entity-repository.js';
import { normalizeText } from '../utils/debounce.js';
import { eventBus, EVENTS } from '../event-bus.js';

class SearchService {
  search({ query = '', type = '', cityId = '', tags = [], priceMin = 0, priceMax = Infinity, sort = 'relevance' } = {}) {
    const includeCities = Boolean(query || type === 'city' || tags.length || cityId);
    let results = entityRepo.getAll().filter(e => e.type !== 'city' || includeCities);

    if (query) {
      const queryWords = normalizeText(query).split(/\s+/).filter(Boolean);
      const exactMatches = results
        .map(entity => ({ entity, score: this._getRelevanceScore(entity, queryWords) }))
        .filter(item => item.score > 0);

      if (exactMatches.length > 0) {
        results = exactMatches
          .sort((a, b) => b.score - a.score)
          .map(item => item.entity);
      } else {
        const fuzzyMatches = results
          .map(entity => ({ entity, score: this._getFallbackScore(entity, queryWords) }))
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);
        results = fuzzyMatches.map(item => item.entity);
      }
    }

    if (type) {
      results = results.filter(e => e.type === type);
    }

    if (cityId) {
      results = results.filter(e => e.cityId === cityId);
    }

    if (tags.length) {
      results = results.filter(e => tags.every(t => (e.tags || []).includes(t)));
    }

    if (priceMin > 0 || priceMax < Infinity) {
      results = results.filter(e => {
        const price = this._getPrice(e);
        return price >= priceMin && price <= priceMax;
      });
    }

    results = this._sort(results, sort);

    return results;
  }

  _getPrice(entity) {
    if (typeof entity.priceRange === 'number') return entity.priceRange * 50;
    if (entity.priceRange?.min != null) return entity.priceRange.min;
    return 0;
  }

  _sort(results, sort) {
    const sorted = [...results];
    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => this._getPrice(a) - this._getPrice(b));
      case 'price-desc':
        return sorted.sort((a, b) => this._getPrice(b) - this._getPrice(a));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted.sort((a, b) => (b.rating || 0) * (b.reviewCount || 1) - (a.rating || 0) * (a.reviewCount || 1));
    }
  }

  _getRelevanceScore(entity, queryWords) {
    const haystack = normalizeText([
      entity.name,
      entity.slug,
      entity.cityName,
      entity.category,
      entity.description,
      entity.summary,
      entity.schedule,
      entity.location?.address,
      entity.metadata?.cuisine,
      entity.metadata?.company,
      entity.metadata?.menu,
      ...(entity.tags || []),
      ...(entity.amenities || [])
    ].join(' '));

    return queryWords.reduce((score, word) => {
      if (!word) return score;
      const count = (haystack.match(new RegExp(word, 'g')) || []).length;
      return score + (count * 10) + (haystack.startsWith(word) ? 50 : 0);
    }, 0);
  }

  _getFallbackScore(entity, queryWords) {
    const haystack = normalizeText([
      entity.name,
      entity.slug,
      entity.cityName,
      entity.category,
      entity.description,
      entity.summary,
      entity.schedule,
      entity.location?.address,
      entity.metadata?.cuisine,
      entity.metadata?.company,
      entity.metadata?.menu,
      ...(entity.tags || []),
      ...(entity.amenities || [])
    ].join(' '));

    return queryWords.reduce((score, word) => {
      if (!word) return score;
      if (haystack.includes(word)) {
        const count = (haystack.match(new RegExp(word, 'g')) || []).length;
        return score + (count * 5);
      }
      const partial = word.slice(0, Math.max(3, Math.floor(word.length / 2)));
      if (partial && haystack.includes(partial)) {
        return score + 2;
      }
      return score;
    }, 0);
  }

  groupByType(results) {
    const groups = {};
    results.forEach(e => {
      if (!groups[e.type]) groups[e.type] = [];
      groups[e.type].push(e);
    });
    return groups;
  }

  autocomplete(query, limit = 8) {
    if (!query || query.length < 2) return [];
    return this.search({ query }).slice(0, limit);
  }

  getCities() {
    return entityRepo.getByType('city');
  }
}

export const searchService = new SearchService();
