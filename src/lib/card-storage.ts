import { kv } from "@vercel/kv";
import { RoastResult, DreamRole } from "./types";

// Sorted set key for the global leaderboard
const LEADERBOARD_KEY = "leaderboard:scores";

// Stored card data - full result with no truncation
export interface StoredCard {
  result: RoastResult;
  dreamRole: DreamRole;
  createdAt: number;
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
export async function storeCard(result: RoastResult, dreamRole: DreamRole): Promise<string> {
  const cardId = generateCardId();
  const storedCard: StoredCard = {
    result,
    dreamRole,
    createdAt: Date.now(),
  };

  // Store in KV with 30 day expiration (in seconds) to manage 256MB limit
  await kv.set(`card:${cardId}`, JSON.stringify(storedCard), { ex: 30 * 24 * 60 * 60 });

  // Add to leaderboard sorted set (score as the sorting value, cardId as member)
  // Higher scores = better rank, so we use the score directly
  await kv.zadd(LEADERBOARD_KEY, { score: result.careerScore, member: cardId });

  return cardId;
}

// Get rank info for a specific card
export async function getCardRank(cardId: string): Promise<RankInfo | null> {
  try {
    // Get the card's rank (0-indexed, sorted by score descending)
    // ZREVRANK gives rank where highest score = 0
    const rank = await kv.zrevrank(LEADERBOARD_KEY, cardId);

    if (rank === null) {
      return null;
    }

    // Get total count of cards in leaderboard
    const totalCards = await kv.zcard(LEADERBOARD_KEY);

    // Calculate percentile (higher is better)
    const percentile = totalCards > 1
      ? Math.round(((totalCards - rank - 1) / (totalCards - 1)) * 100)
      : 100;

    return {
      rank: rank + 1, // Convert to 1-indexed for display
      totalCards,
      percentile,
    };
  } catch (error) {
    console.error("Failed to get card rank:", error);
    return null;
  }
}

// Get total number of cards in leaderboard
export async function getTotalCards(): Promise<number> {
  try {
    return await kv.zcard(LEADERBOARD_KEY);
  } catch (error) {
    console.error("Failed to get total cards:", error);
    return 0;
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
