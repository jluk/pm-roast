/**
 * Famous Cards Search Tests
 *
 * Tests the search and retrieval functions for pre-generated famous PM cards.
 */

import {
  searchFamousCards,
  getFamousCardByName,
  getFamousCardById,
  FAMOUS_CARDS
} from '@/lib/famous-cards';

describe('Famous Cards Search', () => {

  describe('searchFamousCards', () => {
    it('should find cards by partial name match', () => {
      const results = searchFamousCards('sam');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(card => card.name.toLowerCase().includes('sam'))).toBe(true);
    });

    it('should find cards by company name', () => {
      const results = searchFamousCards('airbnb');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(card => card.company.toLowerCase().includes('airbnb'))).toBe(true);
    });

    it('should be case-insensitive', () => {
      const resultsLower = searchFamousCards('elon');
      const resultsUpper = searchFamousCards('ELON');
      const resultsMixed = searchFamousCards('Elon');

      expect(resultsLower.length).toBe(resultsUpper.length);
      expect(resultsLower.length).toBe(resultsMixed.length);
    });

    it('should return empty array for empty query', () => {
      expect(searchFamousCards('')).toEqual([]);
      expect(searchFamousCards('   ')).toEqual([]);
    });

    it('should return at most 5 results', () => {
      // Use a common letter that matches many cards
      const results = searchFamousCards('a');
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should trim whitespace from query', () => {
      const results = searchFamousCards('  brian  ');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchFamousCards('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getFamousCardByName', () => {
    it('should find card by exact name match', () => {
      const card = getFamousCardByName('Brian Chesky');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Brian Chesky');
    });

    it('should be case-insensitive', () => {
      const card1 = getFamousCardByName('brian chesky');
      const card2 = getFamousCardByName('BRIAN CHESKY');
      const card3 = getFamousCardByName('Brian Chesky');

      expect(card1).toBeDefined();
      expect(card2).toBeDefined();
      expect(card3).toBeDefined();
      expect(card1?.id).toBe(card2?.id);
      expect(card2?.id).toBe(card3?.id);
    });

    it('should return undefined for partial matches', () => {
      const card = getFamousCardByName('Brian');
      expect(card).toBeUndefined();
    });

    it('should return undefined for non-existent names', () => {
      const card = getFamousCardByName('John Doe Nobody');
      expect(card).toBeUndefined();
    });

    it('should trim whitespace', () => {
      const card = getFamousCardByName('  Brian Chesky  ');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Brian Chesky');
    });
  });

  describe('getFamousCardById', () => {
    it('should find card by ID', () => {
      const card = getFamousCardById('brian-chesky');
      expect(card).toBeDefined();
      expect(card?.id).toBe('brian-chesky');
    });

    it('should return undefined for non-existent ID', () => {
      const card = getFamousCardById('nonexistent-id');
      expect(card).toBeUndefined();
    });
  });

  describe('FAMOUS_CARDS data integrity', () => {
    it('should have cards with all required fields', () => {
      FAMOUS_CARDS.forEach(card => {
        expect(card.id).toBeTruthy();
        expect(card.name).toBeTruthy();
        expect(card.title).toBeTruthy();
        expect(card.company).toBeTruthy();
        expect(card.score).toBeGreaterThanOrEqual(0);
        expect(card.score).toBeLessThanOrEqual(100);
        expect(card.archetypeName).toBeTruthy();
        expect(card.archetypeEmoji).toBeTruthy();
        expect(card.element).toBeTruthy();
        expect(card.moves.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs', () => {
      const ids = FAMOUS_CARDS.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid PM elements', () => {
      const validElements = ['data', 'chaos', 'strategy', 'shipping', 'politics', 'vision'];
      FAMOUS_CARDS.forEach(card => {
        expect(validElements).toContain(card.element);
      });
    });

    it('should have moves with valid structure', () => {
      FAMOUS_CARDS.forEach(card => {
        card.moves.forEach(move => {
          expect(move.name).toBeTruthy();
          expect(move.energyCost).toBeGreaterThan(0);
          expect(move.damage).toBeGreaterThan(0);
          expect(move.effect).toBeTruthy();
        });
      });
    });
  });
});
