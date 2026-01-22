/**
 * Input Detection Tests
 *
 * Tests the detectInputType function that determines whether user input
 * is a LinkedIn URL, website URL, X handle, or celebrity name (legend).
 */

// Recreate the detection logic for testing (mirrors page.tsx)
function detectInputType(value: string): "linkedin" | "website" | "x" | "legend" | null {
  const trimmed = value.trim();
  const trimmedLower = trimmed.toLowerCase();
  if (!trimmed) return null;

  // URL patterns take priority
  // Check for X/Twitter patterns
  if (trimmedLower.startsWith("@") || trimmedLower.includes("twitter.com") || trimmedLower.includes("x.com")) {
    return "x";
  }

  // Check for LinkedIn
  if (trimmedLower.includes("linkedin.com")) {
    return "linkedin";
  }

  // Check for any URL-like pattern
  if (trimmedLower.includes(".") || trimmedLower.startsWith("http")) {
    return "website";
  }

  // Legend search: two words (e.g., "Sam Altman") OR single word 5+ chars (e.g., "Grimes", "DaBaby")
  const isTwoOrMoreWords = /^[A-Za-z]+\s+[A-Za-z]+/.test(trimmed);
  const isSingleWordName = /^[A-Za-z]{5,}$/.test(trimmed);
  if (isTwoOrMoreWords || isSingleWordName) {
    return "legend";
  }

  return null;
}

describe('Input Type Detection', () => {

  describe('LinkedIn URL detection', () => {
    it('should detect standard LinkedIn profile URLs', () => {
      expect(detectInputType('https://linkedin.com/in/johndoe')).toBe('linkedin');
      expect(detectInputType('https://www.linkedin.com/in/johndoe')).toBe('linkedin');
      expect(detectInputType('linkedin.com/in/johndoe')).toBe('linkedin');
    });

    it('should detect LinkedIn URLs with trailing slashes', () => {
      expect(detectInputType('https://linkedin.com/in/johndoe/')).toBe('linkedin');
    });

    it('should be case-insensitive for LinkedIn', () => {
      expect(detectInputType('LINKEDIN.COM/in/johndoe')).toBe('linkedin');
      expect(detectInputType('LinkedIn.com/in/JohnDoe')).toBe('linkedin');
    });
  });

  describe('Website URL detection', () => {
    it('should detect standard website URLs', () => {
      expect(detectInputType('https://example.com')).toBe('website');
      expect(detectInputType('www.example.com')).toBe('website');
      expect(detectInputType('example.com')).toBe('website');
    });

    it('should detect URLs with paths', () => {
      expect(detectInputType('https://example.com/about')).toBe('website');
      expect(detectInputType('mysite.io/portfolio')).toBe('website');
    });

    it('should detect http:// URLs', () => {
      expect(detectInputType('http://example.com')).toBe('website');
    });

    it('should detect various TLDs', () => {
      expect(detectInputType('example.io')).toBe('website');
      expect(detectInputType('example.co')).toBe('website');
      expect(detectInputType('example.dev')).toBe('website');
    });
  });

  describe('X/Twitter handle detection', () => {
    it('should detect @ handles', () => {
      expect(detectInputType('@johndoe')).toBe('x');
      expect(detectInputType('@JohnDoe123')).toBe('x');
    });

    it('should detect twitter.com URLs', () => {
      expect(detectInputType('https://twitter.com/johndoe')).toBe('x');
      expect(detectInputType('twitter.com/johndoe')).toBe('x');
    });

    it('should detect x.com URLs', () => {
      expect(detectInputType('https://x.com/johndoe')).toBe('x');
      expect(detectInputType('x.com/johndoe')).toBe('x');
    });
  });

  describe('Legend (celebrity name) detection', () => {
    it('should detect two-word names', () => {
      expect(detectInputType('Sam Altman')).toBe('legend');
      expect(detectInputType('Elon Musk')).toBe('legend');
      expect(detectInputType('Brian Chesky')).toBe('legend');
    });

    it('should detect multi-word names', () => {
      expect(detectInputType('Mary Jane Watson')).toBe('legend');
      expect(detectInputType('Jean Claude Van Damme')).toBe('legend');
    });

    it('should detect single-word names with 5+ characters', () => {
      expect(detectInputType('Grimes')).toBe('legend');
      expect(detectInputType('DaBaby')).toBe('legend');
      expect(detectInputType('Beyonce')).toBe('legend');
      expect(detectInputType('Madonna')).toBe('legend');
      expect(detectInputType('Prince')).toBe('legend');
    });

    it('should NOT detect single-word names with less than 5 characters', () => {
      expect(detectInputType('Elon')).toBe(null);
      expect(detectInputType('Sam')).toBe(null);
      expect(detectInputType('test')).toBe(null);
    });

    it('should handle names with extra whitespace', () => {
      expect(detectInputType('  Sam Altman  ')).toBe('legend');
      expect(detectInputType('  Grimes  ')).toBe('legend');
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty input', () => {
      expect(detectInputType('')).toBe(null);
      expect(detectInputType('   ')).toBe(null);
    });

    it('should return null for short single words', () => {
      expect(detectInputType('hi')).toBe(null);
      expect(detectInputType('test')).toBe(null);
      expect(detectInputType('abc')).toBe(null);
    });

    it('should prioritize URL patterns over legend detection', () => {
      // "sam.com" should be website, not legend
      expect(detectInputType('sam.com')).toBe('website');
    });

    it('should prioritize X patterns over other detections', () => {
      expect(detectInputType('@elonmusk')).toBe('x');
    });
  });

  describe('URL priority order', () => {
    it('should detect X before website for x.com URLs', () => {
      expect(detectInputType('x.com/someone')).toBe('x');
    });

    it('should detect LinkedIn before generic website', () => {
      expect(detectInputType('linkedin.com/in/someone')).toBe('linkedin');
    });
  });
});
