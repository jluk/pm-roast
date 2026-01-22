/**
 * Card Data Encoding Unit Tests
 *
 * Tests the card data encoding used for:
 * 1. Share URLs (/share/[encoded]) - allows sharing card results via URL
 * 2. OG image endpoint (/api/og?data=[encoded]) - renders card for social previews
 *
 * Note: Local card download now uses domToPng to capture the rendered card directly,
 * but these encoding tests remain important for the sharing functionality.
 */

import { encodeCardData, decodeCardData, ShareableCard } from '@/lib/share';

describe('Card Share Data Encoding', () => {
  // Sample card data matching what downloadCard() creates
  const sampleCardData: ShareableCard = {
    s: 85,                           // score
    n: 'Data Whisperer',             // archetype name
    e: '📊',                         // emoji
    d: 'You speak fluent SQL and think in dashboards', // description
    el: 'data',                      // element
    st: 'Senior',                    // stage
    w: 'Meetings',                   // weakness
    f: 'This PM can find signal in any noise', // flavor
    m: [                             // moves
      { n: 'Query Storm', c: 1, d: 45, e: 'Pulls insights from chaos' },
      { n: 'Dashboard Deploy', c: 2, d: 60 },
    ],
    ps: 90,                          // productSense
    ex: 85,                          // execution
    ld: 75,                          // leadership
    dr: 'staff',                     // dreamRole
    q: 'You quantify everything except your own imposter syndrome', // bangerQuote
    rr: 'Staff PM? Numbers say yes, your anxiety says maybe', // dreamRoleReaction
    u: 'TestUser',                   // userName
  };

  describe('encodeCardData', () => {
    it('should encode card data to a non-empty string', () => {
      const encoded = encodeCardData(sampleCardData);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should produce URL-safe base64 (no +, /, or = padding)', () => {
      const encoded = encodeCardData(sampleCardData);
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it('should handle Unicode characters (emojis)', () => {
      const cardWithEmoji: ShareableCard = {
        ...sampleCardData,
        e: '🔥',
        n: 'Fire Starter 🚀',
      };
      const encoded = encodeCardData(cardWithEmoji);
      expect(encoded).toBeTruthy();

      // Should be decodable
      const decoded = decodeCardData(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.e).toBe('🔥');
      expect(decoded?.n).toBe('Fire Starter 🚀');
    });
  });

  describe('decodeCardData', () => {
    it('should decode encoded data back to original', () => {
      const encoded = encodeCardData(sampleCardData);
      const decoded = decodeCardData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.s).toBe(sampleCardData.s);
      expect(decoded?.n).toBe(sampleCardData.n);
      expect(decoded?.e).toBe(sampleCardData.e);
      expect(decoded?.d).toBe(sampleCardData.d);
      expect(decoded?.el).toBe(sampleCardData.el);
      expect(decoded?.q).toBe(sampleCardData.q);
      expect(decoded?.u).toBe(sampleCardData.u);
    });

    it('should preserve moves array', () => {
      const encoded = encodeCardData(sampleCardData);
      const decoded = decodeCardData(encoded);

      expect(decoded?.m).toHaveLength(2);
      expect(decoded?.m[0].n).toBe('Query Storm');
      expect(decoded?.m[0].c).toBe(1);
      expect(decoded?.m[0].d).toBe(45);
      expect(decoded?.m[0].e).toBe('Pulls insights from chaos');
      expect(decoded?.m[1].n).toBe('Dashboard Deploy');
      expect(decoded?.m[1].e).toBeUndefined(); // No effect on second move
    });

    it('should return null for invalid encoded data', () => {
      expect(decodeCardData('invalid-data')).toBeNull();
      expect(decodeCardData('')).toBeNull();
      expect(decodeCardData('!!!')).toBeNull();
    });
  });

  describe('OG endpoint URL construction', () => {
    it('should create a valid OG URL with data parameter', () => {
      const baseUrl = 'https://pmroast.com';
      const encoded = encodeCardData(sampleCardData);
      const ogUrl = `${baseUrl}/api/og?data=${encoded}`;

      expect(ogUrl).toContain('/api/og?data=');
      expect(ogUrl).not.toContain('undefined');
      expect(ogUrl).not.toContain('null');
    });

    it('should include all required fields for OG image rendering', () => {
      const encoded = encodeCardData(sampleCardData);
      const decoded = decodeCardData(encoded);

      // These fields are required by the OG endpoint to render the card
      expect(decoded?.s).toBeDefined();  // score
      expect(decoded?.n).toBeDefined();  // name
      expect(decoded?.e).toBeDefined();  // emoji
      expect(decoded?.d).toBeDefined();  // description
      expect(decoded?.el).toBeDefined(); // element
      expect(decoded?.m).toBeDefined();  // moves
      expect(decoded?.q).toBeDefined();  // quote
    });
  });

  describe('Regression: OG endpoint must use data param, not individual params', () => {
    /**
     * This test documents the OG endpoint's expected format. The endpoint
     * only recognizes the 'data' param with encoded card data - without it,
     * it returns the default PM Roast logo instead of the card image.
     *
     * This is important for social sharing previews (Twitter, LinkedIn, etc.)
     * where the OG image is fetched by the platform.
     */
    it('encoded data should be decodable by OG endpoint format', () => {
      const encoded = encodeCardData(sampleCardData);

      // The OG endpoint uses this exact decoding logic:
      // 1. Replace URL-safe chars back to standard base64
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      // 2. Add padding
      while (base64.length % 4) {
        base64 += '=';
      }
      // 3. Decode base64
      const binaryString = atob(base64);
      // 4. Convert to UTF-8
      const utf8Bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        utf8Bytes[i] = binaryString.charCodeAt(i);
      }
      const json = new TextDecoder().decode(utf8Bytes);
      const card = JSON.parse(json);

      // Verify all card fields are present
      expect(card.s).toBe(85);
      expect(card.n).toBe('Data Whisperer');
      expect(card.e).toBe('📊');
      expect(card.el).toBe('data');
    });

    it('should NOT use individual query params format', () => {
      // This is the WRONG format that was causing the bug:
      const wrongUrl = `/api/og?name=Test&archetype=Tester&score=85&rarity=rare`;

      // The OG endpoint checks for 'data' param first
      const url = new URL(wrongUrl, 'https://example.com');
      const dataParam = url.searchParams.get('data');

      // Without 'data' param, OG returns default logo - this is the bug
      expect(dataParam).toBeNull();

      // Correct format uses 'data' param
      const encoded = encodeCardData(sampleCardData);
      const correctUrl = `/api/og?data=${encoded}`;
      const correctUrlObj = new URL(correctUrl, 'https://example.com');

      expect(correctUrlObj.searchParams.get('data')).toBe(encoded);
    });
  });
});
