import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getCardRank } from "@/lib/card-storage";

const ROAST_COUNT_KEY = "stats:roast_count";
const BASE_COUNT = 1847; // Starting count before we started tracking

export async function GET(request: NextRequest) {
  const cardId = request.nextUrl.searchParams.get("cardId");

  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  const rankInfo = await getCardRank(cardId);

  if (!rankInfo) {
    return NextResponse.json({ error: "Card not found in leaderboard" }, { status: 404 });
  }

  // Get total roasts count (the "X PMs roasted" number)
  let totalRoasts = BASE_COUNT;
  try {
    const count = await kv.get<number>(ROAST_COUNT_KEY);
    totalRoasts = BASE_COUNT + (count || 0);
  } catch {
    // Fallback to base count
  }

  return NextResponse.json({
    ...rankInfo,
    totalRoasts,
  });
}
