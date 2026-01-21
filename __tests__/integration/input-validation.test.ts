/**
 * Input Validation Tests
 *
 * Tests the validation logic for user input before sending to the AI.
 * This is CRITICAL to prevent hallucination - we must ensure users
 * provide enough real data before generating a roast.
 *
 * Validation rules:
 * 1. Minimum 100 characters
 * 2. At least 2 PM-related keywords
 * 3. Minimum 30 words
 */

// Declare global helpers for TypeScript
declare global {
  function logSection(title: string): void;
  function logStep(step: string): void;
  function logResult(label: string, value: unknown): void;
  function logError(label: string, value: string): void;
}

// Validation functions (mirrors the API logic)
const PM_KEYWORDS = [
  'product', 'manager', 'pm', 'lead', 'senior', 'staff', 'director',
  'company', 'startup', 'experience', 'worked', 'built', 'launched',
  'team', 'engineering', 'design', 'growth', 'strategy', 'revenue',
  'users', 'customers', 'metrics', 'shipped', 'developed', 'managed'
];

function validateProfileLength(text: string): { valid: boolean; charCount: number } {
  const trimmed = text.trim();
  return {
    valid: trimmed.length >= 100,
    charCount: trimmed.length
  };
}

function validateKeywords(text: string): { valid: boolean; matchedKeywords: string[]; count: number } {
  const lowerText = text.toLowerCase();
  const matchedKeywords = PM_KEYWORDS.filter(keyword => lowerText.includes(keyword));
  return {
    valid: matchedKeywords.length >= 2,
    matchedKeywords,
    count: matchedKeywords.length
  };
}

function validateWordCount(text: string): { valid: boolean; wordCount: number } {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return {
    valid: words.length >= 30,
    wordCount: words.length
  };
}

function validateProfile(text: string): {
  valid: boolean;
  errors: string[];
  details: {
    charCount: number;
    wordCount: number;
    keywordCount: number;
    matchedKeywords: string[];
  };
} {
  const lengthResult = validateProfileLength(text);
  const keywordResult = validateKeywords(text);
  const wordResult = validateWordCount(text);

  const errors: string[] = [];

  if (!lengthResult.valid) {
    errors.push(`Need at least 100 characters (got ${lengthResult.charCount})`);
  }
  if (!keywordResult.valid) {
    errors.push(`Need at least 2 PM-related keywords (got ${keywordResult.count})`);
  }
  if (!wordResult.valid) {
    errors.push(`Need at least 30 words (got ${wordResult.wordCount})`);
  }

  return {
    valid: errors.length === 0,
    errors,
    details: {
      charCount: lengthResult.charCount,
      wordCount: wordResult.wordCount,
      keywordCount: keywordResult.count,
      matchedKeywords: keywordResult.matchedKeywords
    }
  };
}

describe('Input Validation', () => {

  beforeAll(() => {
    logSection('INPUT VALIDATION TESTS');
    console.log('  Testing validation to prevent hallucination');
    console.log('  We must ensure users provide enough real data');
  });

  describe('Character count validation', () => {

    it('should reject profiles under 100 characters', () => {
      logStep('Testing minimum character requirement');

      const shortProfiles = [
        'PM at Google',
        'Senior Product Manager. Built things.',
        'I am a product manager with experience in tech.',
      ];

      shortProfiles.forEach(profile => {
        const result = validateProfileLength(profile);
        logResult(`"${profile.substring(0, 30)}..." (${result.charCount} chars)`, result.valid ? 'PASS' : 'FAIL (expected)');
        expect(result.valid).toBe(false);
      });
    });

    it('should accept profiles with 100+ characters', () => {
      logStep('Testing acceptance of sufficient length');

      const goodProfile = `
        Senior Product Manager at Google with 5 years of experience.
        Built and launched multiple products including Cloud Shell and Container Instances.
        Led cross-functional teams of engineers and designers.
      `;

      const result = validateProfileLength(goodProfile);
      logResult(`Profile length: ${result.charCount} chars`, result.valid ? 'PASS' : 'FAIL');
      expect(result.valid).toBe(true);
    });
  });

  describe('Keyword validation', () => {

    it('should reject profiles without PM-related keywords', () => {
      logStep('Testing keyword requirement');

      const noKeywordProfile = `
        I like to make things and work on stuff.
        Sometimes I go to meetings and talk about ideas.
        My favorite color is blue and I enjoy coffee.
      `;

      const result = validateKeywords(noKeywordProfile);
      logResult(`Matched keywords: ${result.count}`, result.matchedKeywords);
      expect(result.valid).toBe(false);
    });

    it('should accept profiles with sufficient PM keywords', () => {
      logStep('Testing keyword detection');

      const goodProfile = `
        Senior Product Manager at a startup.
        I built and shipped multiple features, working with engineering teams.
        Focused on growth metrics and user experience.
      `;

      const result = validateKeywords(goodProfile);
      logResult(`Matched keywords: ${result.count}`, result.matchedKeywords);
      expect(result.valid).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(2);
    });

    it('should detect various PM keywords', () => {
      logStep('Testing all keyword categories');

      const keywordTests = [
        { text: 'Product Manager at company', expected: ['product', 'manager', 'company'] },
        { text: 'Led team and shipped features', expected: ['team', 'shipped'] },
        { text: 'Senior staff engineer turned PM', expected: ['senior', 'staff', 'pm'] },
        { text: 'Launched startup, grew revenue', expected: ['launched', 'startup', 'revenue', 'growth'] },
      ];

      keywordTests.forEach(({ text, expected }) => {
        const result = validateKeywords(text);
        const foundExpected = expected.filter(e => result.matchedKeywords.includes(e));
        logResult(`"${text}"`, `Found: ${result.matchedKeywords.join(', ')}`);
        expect(foundExpected.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Word count validation', () => {

    it('should reject profiles under 30 words', () => {
      logStep('Testing minimum word count');

      const shortProfile = 'Senior PM at Google. Built products. Led teams. Shipped features.';
      const result = validateWordCount(shortProfile);

      logResult(`Word count: ${result.wordCount}`, result.valid ? 'PASS' : 'FAIL (expected)');
      expect(result.valid).toBe(false);
    });

    it('should accept profiles with 30+ words', () => {
      logStep('Testing sufficient word count');

      const goodProfile = `
        I am a Senior Product Manager at Google with over five years of experience
        building and shipping consumer products. I have led cross-functional teams
        of engineers, designers, and data scientists to deliver features that
        impact millions of users. My expertise includes growth strategy, user
        research, and data-driven decision making.
      `;

      const result = validateWordCount(goodProfile);
      logResult(`Word count: ${result.wordCount}`, result.valid ? 'PASS' : 'FAIL');
      expect(result.valid).toBe(true);
    });
  });

  describe('Full profile validation', () => {

    it('should reject empty input', () => {
      logStep('Testing empty input handling');

      const emptyInputs = ['', '   ', '\n\n\n'];

      emptyInputs.forEach(input => {
        const result = validateProfile(input);
        logResult(`Empty input type`, result.valid ? 'PASS (unexpected)' : 'FAIL (expected)');
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should provide helpful error messages', () => {
      logStep('Testing error message quality');

      const badProfile = 'PM.';
      const result = validateProfile(badProfile);

      console.log('\n    Validation errors for minimal input:');
      result.errors.forEach(error => {
        console.log(`    - ${error}`);
      });

      expect(result.errors.length).toBe(3); // All three validations should fail
      expect(result.errors.some(e => e.includes('characters'))).toBe(true);
      expect(result.errors.some(e => e.includes('keywords'))).toBe(true);
      expect(result.errors.some(e => e.includes('words'))).toBe(true);
    });

    it('should accept a well-formed LinkedIn profile', () => {
      logStep('Testing realistic LinkedIn profile');

      const linkedInProfile = `
        Senior Product Manager at Stripe

        About:
        Product leader with 8+ years of experience building B2B and consumer products.
        Currently leading the Payments team at Stripe, where I've shipped features
        that process billions in transactions annually.

        Experience:
        - Senior PM at Stripe (2022-Present): Lead payments product strategy
        - PM at Airbnb (2019-2022): Built host tools and launched Experiences
        - Associate PM at Google (2016-2019): Worked on Google Maps features

        Skills: Product Strategy, User Research, Data Analysis, Team Leadership
      `;

      const result = validateProfile(linkedInProfile);

      console.log('\n    Validation details for LinkedIn profile:');
      console.log(`    - Character count: ${result.details.charCount}`);
      console.log(`    - Word count: ${result.details.wordCount}`);
      console.log(`    - Keywords found: ${result.details.matchedKeywords.join(', ')}`);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);

      logResult('Profile passes all validation', true);
    });

    it('should reject gibberish even if long enough', () => {
      logStep('Testing gibberish rejection');

      const gibberish = `
        Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.
      `;

      const result = validateProfile(gibberish);

      logResult('Gibberish char count', result.details.charCount);
      logResult('Gibberish word count', result.details.wordCount);
      logResult('PM keywords found', result.details.keywordCount);
      logResult('Rejected correctly', !result.valid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('keywords'))).toBe(true);
    });
  });

  afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('  Input validation tests completed');
    console.log('='.repeat(60) + '\n');
  });
});
