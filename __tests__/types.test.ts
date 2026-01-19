/**
 * Type & Data Structure Tests
 *
 * Tests that our type definitions and constants are consistent.
 * This catches issues when we add new elements, roles, or rarities
 * but forget to update related code.
 */

import { DREAM_ROLES, ROLE_CATEGORIES, DreamRole, RoleCategory } from '@/lib/types';

// PM Elements (duplicated here since it's in a client component)
const PM_ELEMENTS = ['data', 'chaos', 'strategy', 'shipping', 'politics', 'vision'] as const;
type PMElement = typeof PM_ELEMENTS[number];

// Card rarities
const CARD_RARITIES = ['common', 'uncommon', 'rare', 'ultra', 'rainbow', 'gold'] as const;
type CardRarity = typeof CARD_RARITIES[number];

// Declare global helpers for TypeScript
declare global {
  function logSection(title: string): void;
  function logStep(step: string): void;
  function logResult(label: string, value: unknown): void;
  function logError(label: string, value: string): void;
}

describe('Type & Data Structure Consistency', () => {

  beforeAll(() => {
    logSection('TYPE CONSISTENCY TESTS');
    console.log('  Ensuring all type definitions and constants are consistent');
    console.log('  This catches issues when adding new elements/roles/rarities');
  });

  describe('Dream Roles', () => {

    it('should have all required dream roles defined', () => {
      logStep('Checking dream role definitions');

      const expectedRoles: DreamRole[] = [
        'founder',
        'cpo-startup',
        'cpo-enterprise',
        'l6-faang',
        'l7-faang',
        'vp-product',
        'ic-senior'
      ];

      expectedRoles.forEach(role => {
        const roleInfo = DREAM_ROLES[role];
        logResult(`Role: ${role}`, roleInfo ? `✓ ${roleInfo.label}` : '✗ Missing!');
        expect(roleInfo).toBeDefined();
        expect(roleInfo.label).toBeTruthy();
        expect(roleInfo.description).toBeTruthy();
        expect(roleInfo.category).toBeTruthy();
        expect(roleInfo.emoji).toBeTruthy();
      });
    });

    it('should have valid category for each role', () => {
      logStep('Checking role categories');

      const validCategories: RoleCategory[] = ['executive', 'bigtech', 'startup', 'ic'];

      Object.entries(DREAM_ROLES).forEach(([role, info]) => {
        const isValidCategory = validCategories.includes(info.category);
        logResult(`${role} category: ${info.category}`, isValidCategory ? 'valid' : 'INVALID');
        expect(isValidCategory).toBe(true);
      });
    });

    it('should have unique labels for each role', () => {
      logStep('Checking for duplicate labels');

      const labels = Object.values(DREAM_ROLES).map(r => r.label);
      const uniqueLabels = new Set(labels);

      logResult('Total roles', labels.length);
      logResult('Unique labels', uniqueLabels.size);

      expect(uniqueLabels.size).toBe(labels.length);
    });
  });

  describe('Role Categories', () => {

    it('should have all categories defined with styling', () => {
      logStep('Checking category styling definitions');

      const expectedCategories: RoleCategory[] = ['executive', 'bigtech', 'startup', 'ic'];

      expectedCategories.forEach(category => {
        const categoryInfo = ROLE_CATEGORIES[category];
        logResult(`Category: ${category}`, categoryInfo ? `✓ ${categoryInfo.label}` : '✗ Missing!');

        expect(categoryInfo).toBeDefined();
        expect(categoryInfo.label).toBeTruthy();
        expect(categoryInfo.color).toMatch(/^text-/);
        expect(categoryInfo.bgColor).toMatch(/^bg-/);
        expect(categoryInfo.borderColor).toMatch(/^border-/);
      });
    });
  });

  describe('PM Elements', () => {

    it('should have exactly 6 PM elements', () => {
      logStep('Checking PM element count');

      logResult('Element count', PM_ELEMENTS.length);
      expect(PM_ELEMENTS.length).toBe(6);
    });

    it('should have expected element types', () => {
      logStep('Listing all PM elements');

      const expectedElements = ['data', 'chaos', 'strategy', 'shipping', 'politics', 'vision'];

      expectedElements.forEach(element => {
        const exists = PM_ELEMENTS.includes(element as PMElement);
        logResult(`Element: ${element}`, exists ? '✓ exists' : '✗ missing');
        expect(exists).toBe(true);
      });
    });

    it('should map elements to PM archetypes correctly', () => {
      logStep('Element to archetype mapping examples');

      const elementDescriptions: Record<PMElement, string> = {
        data: 'PMs obsessed with metrics and A/B tests',
        chaos: 'PMs who thrive in ambiguity and firefighting',
        strategy: 'PMs focused on planning and frameworks',
        shipping: 'PMs who just get things done',
        politics: 'PMs skilled at stakeholder management',
        vision: 'PMs with big ideas and product intuition'
      };

      PM_ELEMENTS.forEach(element => {
        logResult(`${element}`, elementDescriptions[element]);
        expect(elementDescriptions[element]).toBeTruthy();
      });
    });
  });

  describe('Card Rarities', () => {

    it('should have exactly 6 rarity tiers', () => {
      logStep('Checking rarity tier count');

      logResult('Rarity count', CARD_RARITIES.length);
      expect(CARD_RARITIES.length).toBe(6);
    });

    it('should have rarities in order of increasing rarity', () => {
      logStep('Verifying rarity order');

      const rarityOrder = ['common', 'uncommon', 'rare', 'ultra', 'rainbow', 'gold'];

      rarityOrder.forEach((rarity, index) => {
        logResult(`Tier ${index + 1}`, rarity);
        expect(CARD_RARITIES[index]).toBe(rarity);
      });
    });

    it('should have score thresholds that cover 0-100', () => {
      logStep('Verifying score threshold coverage');

      // Score ranges for each rarity
      const thresholds = [
        { rarity: 'common', min: 0, max: 39 },
        { rarity: 'uncommon', min: 40, max: 59 },
        { rarity: 'rare', min: 60, max: 74 },
        { rarity: 'ultra', min: 75, max: 84 },
        { rarity: 'rainbow', min: 85, max: 94 },
        { rarity: 'gold', min: 95, max: 100 },
      ];

      // Check no gaps
      for (let i = 1; i < thresholds.length; i++) {
        const prevMax = thresholds[i - 1].max;
        const currMin = thresholds[i].min;
        expect(currMin).toBe(prevMax + 1);
      }

      // Check full coverage
      expect(thresholds[0].min).toBe(0);
      expect(thresholds[thresholds.length - 1].max).toBe(100);

      thresholds.forEach(t => {
        logResult(`${t.rarity}`, `${t.min}-${t.max}`);
      });
    });
  });

  describe('Data integrity', () => {

    it('should have no undefined or null values in DREAM_ROLES', () => {
      logStep('Checking for null/undefined in dream roles');

      let issues = 0;
      Object.entries(DREAM_ROLES).forEach(([role, info]) => {
        if (!info.label || !info.description || !info.category || !info.emoji) {
          logError(`Role ${role}`, 'has missing fields');
          issues++;
        }
      });

      logResult('Issues found', issues);
      expect(issues).toBe(0);
    });

    it('should have consistent emoji format (single emoji)', () => {
      logStep('Checking emoji format consistency');

      Object.entries(DREAM_ROLES).forEach(([role, info]) => {
        // Emoji should be 1-2 characters (some emoji are 2 chars due to Unicode)
        const emojiLength = [...info.emoji].length;
        logResult(`${role} emoji: ${info.emoji}`, `length: ${emojiLength}`);
        expect(emojiLength).toBeLessThanOrEqual(2);
      });
    });
  });

  afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('  Type consistency tests completed');
    console.log('='.repeat(60) + '\n');
  });
});
