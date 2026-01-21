/**
 * Integration tests for Vercel KV card storage
 *
 * These tests verify that the Vercel Redis database is working correctly.
 * Requires KV_REST_API_URL and KV_REST_API_TOKEN environment variables.
 *
 * To set up Vercel KV:
 * 1. Go to Vercel Dashboard → Your Project → Storage → Create Database → KV
 * 2. Run `vercel env pull .env.local` to sync credentials locally
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { storeCard, getCard } from '@/lib/card-storage';
import { RoastResult, DreamRole } from '@/lib/types';

// Check if KV is configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

// Mock roast result for testing
const createMockRoastResult = (): RoastResult => ({
  roastBullets: [
    "You've mastered the art of saying 'let's take this offline' to avoid decisions.",
    "Your roadmap has more pivots than a basketball game.",
    "You schedule meetings to discuss when to have meetings.",
  ],
  userName: "Test User",
  archetype: {
    name: "The Eternal Roadmapper",
    description: "Always planning, never shipping",
    emoji: "🗺️",
    element: "strategy",
    flavor: "This PM has been 'almost ready to launch' for 3 years.",
    stage: "Senior",
    weakness: "Deadlines",
  },
  moves: [
    { name: "Scope Creep", energyCost: 1, damage: 30, effect: "Adds 2 weeks to timeline" },
    { name: "Stakeholder Alignment", energyCost: 2, damage: 50, effect: "Confuses everyone" },
  ],
  careerScore: 72,
  capabilities: {
    productSense: 75,
    execution: 45,
    leadership: 68,
  },
  gaps: [
    "Shipping velocity",
    "Decision making speed",
    "Saying no to stakeholders",
  ],
  roadmap: [
    { month: 1, title: "Learn to Ship", actions: ["Set hard deadlines", "Cut scope ruthlessly"] },
    { month: 2, title: "Build Confidence", actions: ["Make decisions faster", "Trust your instincts"] },
  ],
  podcastEpisodes: [
    { title: "How to Ship Faster", guest: "Shreyas Doshi", reason: "Learn velocity" },
  ],
  bangerQuote: "Your roadmap is just a wish list with dates.",
  dreamRoleReaction: "You'll need to actually ship something first.",
  naturalRival: "Engineers who ask 'when is this shipping?'",
});

describe('Vercel KV Card Storage', () => {
  // Skip all tests if KV is not configured
  beforeAll(() => {
    if (!isKVConfigured()) {
      console.log('\n⚠️  Skipping KV tests: KV_REST_API_URL and KV_REST_API_TOKEN not set');
    }
  });

  const conditionalTest = isKVConfigured() ? test : test.skip;

  conditionalTest('should store a card and return an ID', async () => {
    global.logSection('Testing Card Storage');

    const mockResult = createMockRoastResult();
    const dreamRole: DreamRole = 'senior-pm';

    global.logStep('Storing card in KV...');
    const cardId = await storeCard(mockResult, dreamRole);

    global.logResult('Card ID', cardId);

    expect(cardId).toBeDefined();
    expect(typeof cardId).toBe('string');
    expect(cardId.length).toBeGreaterThan(0);
  });

  conditionalTest('should retrieve a stored card by ID', async () => {
    global.logSection('Testing Card Retrieval');

    const mockResult = createMockRoastResult();
    const dreamRole: DreamRole = 'founder';

    global.logStep('Storing card...');
    const cardId = await storeCard(mockResult, dreamRole);
    global.logResult('Stored Card ID', cardId);

    global.logStep('Retrieving card...');
    const retrieved = await getCard(cardId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.dreamRole).toBe(dreamRole);
    expect(retrieved?.result.archetype.name).toBe(mockResult.archetype.name);
    expect(retrieved?.result.careerScore).toBe(mockResult.careerScore);
    expect(retrieved?.result.bangerQuote).toBe(mockResult.bangerQuote);
    expect(retrieved?.result.roastBullets).toEqual(mockResult.roastBullets);
    expect(retrieved?.result.naturalRival).toBe(mockResult.naturalRival);

    global.logResult('Retrieved archetype', retrieved?.result.archetype.name);
    global.logResult('Retrieved score', retrieved?.result.careerScore);
    global.logResult('Retrieved dream role', retrieved?.dreamRole);
  });

  conditionalTest('should return null for non-existent card ID', async () => {
    global.logSection('Testing Non-Existent Card');

    const fakeId = 'non-existent-card-id-12345';

    global.logStep(`Attempting to retrieve card with ID: ${fakeId}`);
    const retrieved = await getCard(fakeId);

    expect(retrieved).toBeNull();
    global.logResult('Result', 'null (as expected)');
  });

  conditionalTest('should preserve full text without truncation', async () => {
    global.logSection('Testing Full Text Preservation');

    const mockResult = createMockRoastResult();
    // Add a very long roast bullet to verify no truncation
    mockResult.roastBullets[0] = 'A'.repeat(200) + ' - This is a very long roast that should not be truncated when stored in KV';
    mockResult.bangerQuote = 'B'.repeat(150) + ' - Long banger quote that exceeds typical URL encoding limits';

    const dreamRole: DreamRole = 'cpo';

    global.logStep('Storing card with long text...');
    const cardId = await storeCard(mockResult, dreamRole);

    global.logStep('Retrieving card...');
    const retrieved = await getCard(cardId);

    expect(retrieved?.result.roastBullets[0]).toBe(mockResult.roastBullets[0]);
    expect(retrieved?.result.roastBullets[0].length).toBeGreaterThan(200);
    expect(retrieved?.result.bangerQuote).toBe(mockResult.bangerQuote);
    expect(retrieved?.result.bangerQuote.length).toBeGreaterThan(150);

    global.logResult('Roast bullet length', retrieved?.result.roastBullets[0].length);
    global.logResult('Banger quote length', retrieved?.result.bangerQuote.length);
  });

  conditionalTest('should store and retrieve card with image data', async () => {
    global.logSection('Testing Image Data Storage');

    const mockResult = createMockRoastResult();
    // Simulate a base64 image (small test string)
    mockResult.archetypeImage = 'data:image/png;base64,' + 'A'.repeat(1000);

    const dreamRole: DreamRole = 'vp-product';

    global.logStep('Storing card with image...');
    const cardId = await storeCard(mockResult, dreamRole);

    global.logStep('Retrieving card...');
    const retrieved = await getCard(cardId);

    expect(retrieved?.result.archetypeImage).toBe(mockResult.archetypeImage);
    global.logResult('Image data preserved', retrieved?.result.archetypeImage?.substring(0, 50) + '...');
  });
});
