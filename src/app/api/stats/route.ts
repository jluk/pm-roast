import { NextResponse } from "next/server";

// In production, this would use Vercel KV or a database
// For now, we use a starting count that can be updated manually
const BASE_COUNT = 1847;

// Simple in-memory counter (resets on server restart)
// In production, replace with: import { kv } from "@vercel/kv";
let sessionCount = 0;

// Get current stats
export async function GET() {
  return NextResponse.json({
    totalRoasts: BASE_COUNT + sessionCount
  });
}

// Increment roast count
export async function POST() {
  sessionCount++;
  return NextResponse.json({
    totalRoasts: BASE_COUNT + sessionCount
  });
}
