import { kv } from "@vercel/kv";
import { RoastResult, DreamRole } from "./types";
import { FAMOUS_CARDS } from "./famous-cards";
import { CELEBRITY_CARDS } from "./celebrity-cards";

// Sorted set key for the global leaderboard
const LEADERBOARD_KEY = "leaderboard:scores";

// Pre-compute all legend scores (famous + celebrity cards)
const ALL_LEGEND_SCORES = [
  ...FAMOUS_CARDS.map(c => c.score),
  ...CELEBRITY_CARDS.map(c => c.score),
].sort((a, b) => b - a); // Sort descending (highest first)

// Stored card data - full result with no truncation
export interface StoredCard {
  result: RoastResult;
  dreamRole: DreamRole;
  createdAt: number;
  isLegend?: boolean;
}

// Rank info for a card
export interface RankInfo {
  rank: number;
  totalCards: number;
  percentile: number;
}

// Generate a short unique ID for the card
function generateCardId(): string {
  // Use timestamp + random chars for uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

// Store a card and return its ID
export async function storeCard(result: RoastResult, dreamRole: DreamRole, isLegend?: boolean): Promise<string> {
  const cardId = generateCardId();
  const storedCard: StoredCard = {
    result,
    dreamRole,
    createdAt: Date.now(),
    isLegend,
  };

  // Store in KV with 7 day expiration (in seconds) to manage storage limits during traffic spikes
  // Cards can be re-generated if needed, prioritize availability over retention
  await kv.set(`card:${cardId}`, JSON.stringify(storedCard), { ex: 7 * 24 * 60 * 60 });

  // Add to leaderboard sorted set (score as the sorting value, cardId as member)
  // Higher scores = better rank, so we use the score directly
  // Note: Leaderboard entries persist but card data expires - this is acceptable
  await kv.zadd(LEADERBOARD_KEY, { score: result.careerScore, member: cardId });

  return cardId;
}

// Get rank info for a specific card (includes famous/celebrity cards in ranking)
export async function getCardRank(cardId: string): Promise<RankInfo | null> {
  try {
    // Get the card's score from the leaderboard
    const score = await kv.zscore(LEADERBOARD_KEY, cardId);

    if (score === null) {
      return null;
    }

    // Get the card's rank among user cards (0-indexed, sorted by score descending)
    const userRank = await kv.zrevrank(LEADERBOARD_KEY, cardId);

    if (userRank === null) {
      return null;
    }

    // Get total count of user cards in leaderboard
    const userCards = await kv.zcard(LEADERBOARD_KEY);

    // Count how many legend cards have higher scores than this card
    // Legend scores are sorted descending, so count until we hit a score <= user's score
    let legendsAbove = 0;
    for (const legendScore of ALL_LEGEND_SCORES) {
      if (legendScore > score) {
        legendsAbove++;
      } else {
        break; // Sorted descending, no need to check further
      }
    }

    // Total cards = user cards + all legend cards
    const totalCards = userCards + ALL_LEGEND_SCORES.length;

    // Adjusted rank = user rank among users + legends that beat them
    const adjustedRank = userRank + legendsAbove;

    // Calculate percentile (higher is better)
    const percentile = totalCards > 1
      ? Math.round(((totalCards - adjustedRank - 1) / (totalCards - 1)) * 100)
      : 100;

    return {
      rank: adjustedRank + 1, // Convert to 1-indexed for display
      totalCards,
      percentile,
    };
  } catch (error) {
    console.error("Failed to get card rank:", error);
    return null;
  }
}

// Get total number of cards in leaderboard (includes legend cards)
export async function getTotalCards(): Promise<number> {
  try {
    const userCards = await kv.zcard(LEADERBOARD_KEY);
    return userCards + ALL_LEGEND_SCORES.length;
  } catch (error) {
    console.error("Failed to get total cards:", error);
    return ALL_LEGEND_SCORES.length; // At minimum, return legend count
  }
}

// Retrieve a card by ID
export async function getCard(cardId: string): Promise<StoredCard | null> {
  try {
    const data = await kv.get<string>(`card:${cardId}`);
    if (!data) return null;

    // Handle both string and object responses from KV
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data as unknown as StoredCard;
  } catch (error) {
    console.error("Failed to retrieve card:", error);
    return null;
  }
}

// Generate the share URL for a card
export function getCardShareUrl(baseUrl: string, cardId: string): string {
  return `${baseUrl}/card/${cardId}`;
}
