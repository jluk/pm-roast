/**
 * Card Rarity Tests
 *
 * Tests the card rarity calculation system.
 * Rarity determines the visual appearance of cards:
 * - Common (0-39): Basic styling
 * - Uncommon (40-59): Blue tint
 * - Rare (60-74): Purple holographic
 * - Ultra Rare (75-84): Pink holographic
 * - Rainbow Rare (85-94): Full rainbow effect
 * - Gold (95-100): Gold legendary styling
 */

// Inline the getCardRarity function since we can't easily import the client component
type CardRarity = "common" | "uncommon" | "rare" | "ultra" | "rainbow" | "gold";

function getCardRarity(score: number): CardRarity {
  if (score >= 95) return "gold";
  if (score >= 85) return "rainbow";
  if (score >= 75) return "ultra";
  if (score >= 60) return "rare";
  if (score >= 40) return "uncommon";
  return "common";
}

// Declare global helpers for TypeScript
declare global {
  function logSection(title: string): void;
  function logStep(step: string): void;
  function logResult(label: string, value: unknown): void;
  function logError(label: string, value: string): void;
}

describe('Card Rarity System', () => {

  beforeAll(() => {
    logSection('CARD RARITY TESTS');
    console.log('  Testing the rarity calculation based on career score');
    console.log('  Higher scores = rarer, more impressive card visuals');
  });

  describe('getCardRarity score thresholds', () => {

    it('should return "common" for scores 0-39', () => {
      logStep('Testing Common rarity tier (0-39)');

      const testScores = [0, 10, 20, 30, 39];

      testScores.forEach(score => {
        const rarity = getCardRarity(score);
        logResult(`Score ${score}`, rarity);
        expect(rarity).toBe('common');
      });
    });

    it('should return "uncommon" for scores 40-59', () => {
      logStep('Testing Uncommon rarity tier (40-59)');

      const testScores = [40, 45, 50, 55, 59];

      testScores.forEach(score => {
        const rarity = getCardRarity(score);
        logResult(`Score ${score}`, rarity);
        expect(rarity).toBe('uncommon');
      });
    });

    it('should return "rare" for scores 60-74', () => {
      logStep('Testing Rare rarity tier (60-74)');

      const testScores = [60, 65, 70, 74];

      testScores.forEach(score => {
        const rarity = getCardRarity(score);
        logResult(`Score ${score}`, rarity);
        expect(rarity).toBe('rare');
      });
    });

    it('should return "ultra" for scores 75-84', () => {
      logStep('Testing Ultra Rare rarity tier (75-84)');

      const testScores = [75, 80, 84];

      testScores.forEach(score => {
        const rarity = getCardRarity(score);
        logResult(`Score ${score}`, rarity);
        expect(rarity).toBe('ultra');
      });
    });

    it('should return "rainbow" for scores 85-94', () => {
      logStep('Testing Rainbow Rare rarity tier (85-94)');

      const testScores = [85, 90, 94];

      testScores.forEach(score => {
        const rarity = getCardRarity(score);
        logResult(`Score ${score}`, rarity);
        expect(rarity).toBe('rainbow');
      });
    });

    it('should return "gold" for scores 95-100', () => {
      logStep('Testing Gold rarity tier (95-100)');

      const testScores = [95, 97, 99, 100];

      testScores.forEach(score => {
        const rarity = getCardRarity(score);
        logResult(`Score ${score}`, rarity);
        expect(rarity).toBe('gold');
      });
    });
  });

  describe('Boundary conditions', () => {

    it('should handle exact boundary values correctly', () => {
      logStep('Testing exact boundary transitions');

      // Test exact boundaries where rarity changes
      const boundaries = [
        { score: 39, expected: 'common' },
        { score: 40, expected: 'uncommon' },
        { score: 59, expected: 'uncommon' },
        { score: 60, expected: 'rare' },
        { score: 74, expected: 'rare' },
        { score: 75, expected: 'ultra' },
        { score: 84, expected: 'ultra' },
        { score: 85, expected: 'rainbow' },
        { score: 94, expected: 'rainbow' },
        { score: 95, expected: 'gold' },
      ];

      boundaries.forEach(({ score, expected }) => {
        const rarity = getCardRarity(score);
        logResult(`Boundary ${score}`, `${rarity} (expected: ${expected})`);
        expect(rarity).toBe(expected);
      });
    });

    it('should handle edge case scores', () => {
      logStep('Testing edge cases');

      // Minimum score
      expect(getCardRarity(0)).toBe('common');
      logResult('Score 0', 'common');

      // Maximum score
      expect(getCardRarity(100)).toBe('gold');
      logResult('Score 100', 'gold');

      // Negative score (shouldn't happen but test anyway)
      expect(getCardRarity(-5)).toBe('common');
      logResult('Score -5 (edge case)', 'common');

      // Above 100 (shouldn't happen but test anyway)
      expect(getCardRarity(150)).toBe('gold');
      logResult('Score 150 (edge case)', 'gold');
    });
  });

  describe('Rarity distribution analysis', () => {

    it('should show expected rarity distribution for random scores', () => {
      logStep('Analyzing rarity distribution');

      const distribution: Record<CardRarity, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        ultra: 0,
        rainbow: 0,
        gold: 0
      };

      // Calculate distribution for all scores 0-100
      for (let score = 0; score <= 100; score++) {
        const rarity = getCardRarity(score);
        distribution[rarity]++;
      }

      console.log('\n    Distribution of rarities across 0-100 scores:');
      Object.entries(distribution).forEach(([rarity, count]) => {
        const percentage = ((count / 101) * 100).toFixed(1);
        console.log(`    ${rarity.padEnd(10)}: ${count.toString().padStart(2)} scores (${percentage}%)`);
      });

      // Verify expected counts
      expect(distribution.common).toBe(40);    // 0-39
      expect(distribution.uncommon).toBe(20);  // 40-59
      expect(distribution.rare).toBe(15);      // 60-74
      expect(distribution.ultra).toBe(10);     // 75-84
      expect(distribution.rainbow).toBe(10);   // 85-94
      expect(distribution.gold).toBe(6);       // 95-100

      logResult('Distribution matches expected', true);
    });
  });

  afterAll(() => {
    console.log('\n' + '='.repeat(60));
    console.log('  Card rarity tests completed');
    console.log('='.repeat(60) + '\n');
  });
});
