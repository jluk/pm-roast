/**
 * Seed the leaderboard with Mt. Roastmore famous cards
 *
 * Run: npx tsx scripts/seed-leaderboard.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { kv } from '@vercel/kv';
import { FAMOUS_CARDS } from '../src/lib/famous-cards';

const LEADERBOARD_KEY = "leaderboard:scores";

async function seedLeaderboard() {
  console.log(`Seeding leaderboard with ${FAMOUS_CARDS.length} famous cards...\n`);

  let added = 0;
  let skipped = 0;

  for (const card of FAMOUS_CARDS) {
    const memberId = `famous:${card.id}`;

    // Check if already in leaderboard
    const existingRank = await kv.zrank(LEADERBOARD_KEY, memberId);

    if (existingRank !== null) {
      console.log(`⏭️  ${card.name} (${card.score}) - already in leaderboard`);
      skipped++;
      continue;
    }

    // Add to leaderboard
    await kv.zadd(LEADERBOARD_KEY, { score: card.score, member: memberId });
    console.log(`✅ ${card.name} (${card.score}) - added`);
    added++;
  }

  // Get total count
  const total = await kv.zcard(LEADERBOARD_KEY);

  console.log(`\n--- Summary ---`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Total cards in leaderboard: ${total}`);
}

seedLeaderboard().catch(console.error);
