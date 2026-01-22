import { NextRequest, NextResponse } from "next/server";
import { getCardRank } from "@/lib/card-storage";

export async function GET(request: NextRequest) {
  const cardId = request.nextUrl.searchParams.get("cardId");

  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  const rankInfo = await getCardRank(cardId);

  if (!rankInfo) {
    return NextResponse.json({ error: "Card not found in leaderboard" }, { status: 404 });
  }

  return NextResponse.json(rankInfo);
}
