/**
 * Share URL Tests
 *
 * Tests the encoding/decoding of shareable card data for URLs.
 * This is critical for the share functionality - if encoding/decoding
 * breaks, users won't be able to share their cards.
 */

import { encodeCardData, decodeCardData, generateShareUrl, ShareableCard } from '@/lib/share';

// Declare global helpers for TypeScript
declare global {
  function logSection(title: string): void;
  function logStep(step: string): void;
  function logResult(label: string, value: unknown): void;
  function logError(label: string, value: string): void;
}

describe('Share URL Encoding/Decoding', () => {

  beforeAll(() => {
    logSection('SHARE URL TESTS');
    console.log('  Testing the share URL encoding/decoding functionality');
    console.log('  This ensures users can share their PM cards via URL');
  });

  describe('encodeCardData & decodeCardData', () => {

    it('should encode and decode a basic card correctly', () => {
      logStep('Testing basic card encode/decode roundtrip');

      const testCard: ShareableCard = {
        s: 75, // careerScore
        n: 'Metric Monk',
        e: '📊',
        d: 'Lives and breathes dashboards',
        el: 'data',
        st: 'Senior',
        w: 'Meetings',
        f: 'Found in natural habitat: staring at Amplitude',
        m: [
          { n: 'Data Dump', c: 2, d: 60, e: 'Overwhelms with metrics' },
          { n: 'A/B Attack', c: 1, d: 30, e: 'Tests everything' }
        ],
        ps: 85,
        ex: 70,
        ld: 65,
        dr: 'l6-faang',
        q: 'Your dashboard has more tabs than a browser history',
        rr: 'L6 is within reach if you ship more'
      };

      logResult('Original card score', testCard.s);
      logResult('Original card name', testCard.n);

      const encoded = encodeCardData(testCard);
      logResult('Encoded length', encoded.length);
      logResult('Encoded preview', encoded.substring(0, 50) + '...');

      const decoded = decodeCardData(encoded);
      logResult('Decoded successfully', decoded !== null);

      expect(decoded).not.toBeNull();
      expect(decoded?.s).toBe(testCard.s);
      expect(decoded?.n).toBe(testCard.n);
      expect(decoded?.e).toBe(testCard.e);
      expect(decoded?.el).toBe(testCard.el);
      expect(decoded?.m).toHaveLength(2);

      logResult('All fields match', true);
    });

    it('should handle Unicode/emoji characters correctly', () => {
      logStep('Testing Unicode/emoji handling in card data');

      const unicodeCard: ShareableCard = {
        s: 88,
        n: 'Vision Virtuoso 🌟',
        e: '🔮',
        d: 'Sees the future, probably uses tarot cards in sprint planning',
        el: 'vision',
        st: 'Staff',
        w: 'Details',
        f: 'Whispers "product-market fit" in their sleep 💭',
        m: [
          { n: 'Big Picture™', c: 3, d: 90, e: 'Inspires with grand vision ✨' }
        ],
        ps: 90,
        ex: 60,
        ld: 85,
        dr: 'cpo-startup',
        q: 'Your roadmap is so visionary it needs a telescope 🔭',
        rr: 'CPO material if you can execute'
      };

      logResult('Testing card with emojis', unicodeCard.n);

      const encoded = encodeCardData(unicodeCard);
      const decoded = decodeCardData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.n).toBe(unicodeCard.n);
      expect(decoded?.e).toBe(unicodeCard.e);
      expect(decoded?.q).toBe(unicodeCard.q);

      logResult('Unicode preserved correctly', true);
    });

    it('should return null for invalid encoded data', () => {
      logStep('Testing invalid encoded data handling');

      const invalidData = 'this-is-not-valid-base64!!!';
      const result = decodeCardData(invalidData);

      logResult('Invalid data returns null', result === null);
      expect(result).toBeNull();
    });

    it('should handle empty moves array', () => {
      logStep('Testing card with no moves');

      const noMovesCard: ShareableCard = {
        s: 45,
        n: 'Mystery PM',
        e: '❓',
        d: 'Nobody knows what they do',
        el: 'chaos',
        st: 'Junior',
        w: 'Everything',
        f: 'Profile was too vague to analyze',
        m: [],
        ps: 50,
        ex: 50,
        ld: 50,
        dr: 'ic-senior',
        q: 'Your profile is vaguer than a PM roadmap',
        rr: 'Need more experience first'
      };

      const encoded = encodeCardData(noMovesCard);
      const decoded = decodeCardData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.m).toHaveLength(0);

      logResult('Empty moves handled', true);
    });
  });

  describe('generateShareUrl', () => {

    it('should generate a valid share URL from a roast result', () => {
      logStep('Testing full share URL generation');

      const mockResult = {
        careerScore: 82,
        archetype: {
          name: 'Shipping Sensei',
          emoji: '🚀',
          description: 'Gets things done, asks questions never',
          element: 'shipping',
          stage: 'Lead',
          weakness: 'Documentation',
          flavor: 'Ships fast, breaks things, fixes later'
        },
        moves: [
          { name: 'Ship It', energyCost: 1, damage: 40, effect: 'Deploys to prod on Friday' },
          { name: 'Scope Cut', energyCost: 2, damage: 70, effect: 'Removes 80% of features' }
        ],
        capabilities: { productSense: 75, execution: 95, leadership: 70 },
        bangerQuote: 'Your deployment frequency gives DevOps anxiety',
        dreamRoleReaction: 'Keep shipping and L6 is yours'
      };

      const baseUrl = 'https://pmroast.com';
      const shareUrl = generateShareUrl(baseUrl, mockResult, 'l6-faang');

      logResult('Base URL', baseUrl);
      logResult('Generated URL length', shareUrl.length);
      logResult('URL starts correctly', shareUrl.startsWith(baseUrl + '/share/'));

      expect(shareUrl).toContain(baseUrl);
      expect(shareUrl).toContain('/share/');

      // Extract encoded part and verify it decodes
      const encodedPart = shareUrl.split('/share/')[1];
      const decoded = decodeCardData(encodedPart);

      expect(decoded).not.toBeNull();
      expect(decoded?.s).toBe(82);
      expect(decoded?.n).toBe('Shipping Sensei');

      logResult('URL decodes back to original data', true);
    });

    it('should truncate long fields to prevent URL overflow', () => {
      logStep('Testing field truncation for long content');

      const longResult = {
        careerScore: 50,
        archetype: {
          name: 'This Is An Extremely Long Archetype Name That Should Be Truncated',
          emoji: '📝',
          description: 'A'.repeat(200), // Very long description
          element: 'strategy',
          stage: 'Senior',
          weakness: 'Brevity',
          flavor: 'B'.repeat(200)
        },
        moves: [
          {
            name: 'Super Long Move Name Here',
            energyCost: 1,
            damage: 50,
            effect: 'C'.repeat(100)
          }
        ],
        capabilities: { productSense: 60, execution: 60, leadership: 60 },
        bangerQuote: 'D'.repeat(200),
        dreamRoleReaction: 'E'.repeat(100)
      };

      const shareUrl = generateShareUrl('https://test.com', longResult, 'founder');
      const encodedPart = shareUrl.split('/share/')[1];
      const decoded = decodeCardData(encodedPart);

      expect(decoded).not.toBeNull();
      expect(decoded!.n.length).toBeLessThanOrEqual(30);
      expect(decoded!.d.length).toBeLessThanOrEqual(95); // Matches share.ts truncation
      expect(decoded!.q.length).toBeLessThanOrEqual(140); // Matches share.ts truncation

      logResult('Name truncated to', decoded!.n.length);
      logResult('Description truncated to', decoded!.d.length);
      logResult('Quote truncated to', decoded!.q.length);
    });
  });

  afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('  Share URL tests completed');
    console.log('='.repeat(60) + '\n');
  });
});
