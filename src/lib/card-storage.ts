import { kv } from "@vercel/kv";
import { RoastResult, DreamRole } from "./types";

// Stored card data - full result with no truncation
export interface StoredCard {
  result: RoastResult;
  dreamRole: DreamRole;
  createdAt: number;
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

  return cardId;
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
