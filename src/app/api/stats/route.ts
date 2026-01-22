import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const ROAST_COUNT_KEY = "stats:roast_count";
const BASE_COUNT = 1847; // Starting count before we started tracking

// Get current stats
export async function GET() {
  try {
    const count = await kv.get<number>(ROAST_COUNT_KEY);
    return NextResponse.json({
      totalRoasts: BASE_COUNT + (count || 0)
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Fallback to base count if KV fails
    return NextResponse.json({
      totalRoasts: BASE_COUNT
    });
  }
}

// Increment roast count
export async function POST() {
  try {
    const newCount = await kv.incr(ROAST_COUNT_KEY);
    return NextResponse.json({
      totalRoasts: BASE_COUNT + newCount
    });
  } catch (error) {
    console.error("Error incrementing stats:", error);
    return NextResponse.json({
      totalRoasts: BASE_COUNT
    });
  }
}
