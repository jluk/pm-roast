/**
 * Log Usage Sanitization Tests
 *
 * Tests that user inputs are properly sanitized before being logged
 * to protect user privacy while still providing useful analytics.
 */

type UsageType = "legend" | "linkedin" | "portfolio" | "resume" | "manual";

// Recreate the sanitization logic for testing (mirrors log-usage/route.ts)
function sanitizeInput(input: string | undefined, type: UsageType): string | undefined {
  if (!input) return undefined;

  switch (type) {
    case "legend":
      // Keep celebrity names as-is (public figures)
      return input.trim().slice(0, 100);

    case "linkedin":
      // Just log that it was a LinkedIn URL, not the actual profile
      if (input.includes("linkedin.com/in/")) {
        return "linkedin.com/in/[redacted]";
      }
      return "linkedin.com/[redacted]";

    case "portfolio":
      // Log the domain only, not full URL
      try {
        const url = new URL(input.startsWith("http") ? input : `https://${input}`);
        return url.hostname;
      } catch {
        return "[invalid-url]";
      }

    case "resume":
      // Just log file type if available
      return "[resume-upload]";

    case "manual":
      // Don't log manual text input (contains personal info)
      return "[manual-entry]";

    default:
      return undefined;
  }
}

describe('Log Usage Sanitization', () => {

  describe('Legend input sanitization', () => {
    it('should keep celebrity names as-is', () => {
      expect(sanitizeInput('Elon Musk', 'legend')).toBe('Elon Musk');
      expect(sanitizeInput('Sam Altman', 'legend')).toBe('Sam Altman');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  Elon Musk  ', 'legend')).toBe('Elon Musk');
    });

    it('should truncate very long names', () => {
      const longName = 'A'.repeat(150);
      const result = sanitizeInput(longName, 'legend');
      expect(result?.length).toBe(100);
    });

    it('should return undefined for empty input', () => {
      expect(sanitizeInput('', 'legend')).toBeUndefined();
      expect(sanitizeInput(undefined, 'legend')).toBeUndefined();
    });
  });

  describe('LinkedIn input sanitization', () => {
    it('should redact LinkedIn profile URLs', () => {
      expect(sanitizeInput('https://linkedin.com/in/johndoe', 'linkedin'))
        .toBe('linkedin.com/in/[redacted]');
      expect(sanitizeInput('linkedin.com/in/johndoe', 'linkedin'))
        .toBe('linkedin.com/in/[redacted]');
    });

    it('should redact other LinkedIn URLs', () => {
      expect(sanitizeInput('https://linkedin.com/company/acme', 'linkedin'))
        .toBe('linkedin.com/[redacted]');
    });

    it('should not expose usernames or profile details', () => {
      const result = sanitizeInput('https://linkedin.com/in/secretuser123', 'linkedin');
      expect(result).not.toContain('secretuser123');
    });
  });

  describe('Portfolio input sanitization', () => {
    it('should extract domain from full URLs', () => {
      expect(sanitizeInput('https://example.com/about/me', 'portfolio'))
        .toBe('example.com');
      expect(sanitizeInput('https://www.mysite.io/portfolio', 'portfolio'))
        .toBe('www.mysite.io');
    });

    it('should handle URLs without protocol', () => {
      expect(sanitizeInput('example.com', 'portfolio')).toBe('example.com');
      expect(sanitizeInput('mysite.io/about', 'portfolio')).toBe('mysite.io');
    });

    it('should not include paths or query strings', () => {
      const result = sanitizeInput('https://example.com/secret/path?token=abc123', 'portfolio');
      expect(result).toBe('example.com');
      expect(result).not.toContain('secret');
      expect(result).not.toContain('token');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(sanitizeInput('not a valid url', 'portfolio')).toBe('[invalid-url]');
    });
  });

  describe('Resume input sanitization', () => {
    it('should always return generic placeholder', () => {
      expect(sanitizeInput('my-resume.pdf', 'resume')).toBe('[resume-upload]');
      expect(sanitizeInput('secret_document.pdf', 'resume')).toBe('[resume-upload]');
    });

    it('should not expose file names', () => {
      const result = sanitizeInput('john_doe_resume_2024.pdf', 'resume');
      expect(result).not.toContain('john');
      expect(result).not.toContain('doe');
    });
  });

  describe('Manual input sanitization', () => {
    it('should always return generic placeholder', () => {
      expect(sanitizeInput('My bio text with personal info', 'manual'))
        .toBe('[manual-entry]');
    });

    it('should not expose any personal information', () => {
      const personalInfo = 'John Doe, phone: 555-1234, email: john@example.com';
      const result = sanitizeInput(personalInfo, 'manual');
      expect(result).toBe('[manual-entry]');
      expect(result).not.toContain('John');
      expect(result).not.toContain('555');
      expect(result).not.toContain('email');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined input for all types', () => {
      expect(sanitizeInput(undefined, 'legend')).toBeUndefined();
      expect(sanitizeInput(undefined, 'linkedin')).toBeUndefined();
      expect(sanitizeInput(undefined, 'portfolio')).toBeUndefined();
      expect(sanitizeInput(undefined, 'resume')).toBeUndefined();
      expect(sanitizeInput(undefined, 'manual')).toBeUndefined();
    });

    it('should handle empty string input', () => {
      expect(sanitizeInput('', 'legend')).toBeUndefined();
    });
  });
});
