import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export type UsageType = "legend" | "linkedin" | "portfolio" | "resume" | "manual";

interface UsageLog {
  type: UsageType;
  timestamp: number;
  input?: string; // Sanitized input (no PII)
  success?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, input, success = true } = body as { type: UsageType; input?: string; success?: boolean };

    if (!type || !["legend", "linkedin", "portfolio", "resume", "manual"].includes(type)) {
      return NextResponse.json({ error: "Invalid usage type" }, { status: 400 });
    }

    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Increment total count for this type
    await kv.incr(`usage:total:${type}`);

    // Increment daily count
    await kv.incr(`usage:daily:${today}:${type}`);

    // Store recent logs (keep last 1000 per type for analysis)
    const log: UsageLog = {
      type,
      timestamp: now,
      input: sanitizeInput(input, type),
      success,
    };

    // Use a list to store recent logs
    await kv.lpush(`usage:logs:${type}`, JSON.stringify(log));
    // Trim to keep only last 1000
    await kv.ltrim(`usage:logs:${type}`, 0, 999);

    // Also maintain a global recent log
    await kv.lpush("usage:logs:all", JSON.stringify(log));
    await kv.ltrim("usage:logs:all", 0, 4999);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging usage:", error);
    // Don't fail the request if logging fails
    return NextResponse.json({ success: false, error: "Logging failed" });
  }
}

// Sanitize input to remove PII while keeping useful info
function sanitizeInput(input: string | undefined, type: UsageType): string | undefined {
  if (!input) return undefined;

  switch (type) {
    case "legend":
      // Keep celebrity names as-is (public figures)
      return input.trim().slice(0, 100);

    case "linkedin":
      // Just log that it was a LinkedIn URL, not the actual profile
      if (input.includes("linkedin.com/in/")) {
        return "linkedin.com/in/[redacted]";
      }
      return "linkedin.com/[redacted]";

    case "portfolio":
      // Log the domain only, not full URL
      try {
        const url = new URL(input.startsWith("http") ? input : `https://${input}`);
        return url.hostname;
      } catch {
        return "[invalid-url]";
      }

    case "resume":
      // Just log file type if available
      return "[resume-upload]";

    case "manual":
      // Don't log manual text input (contains personal info)
      return "[manual-entry]";

    default:
      return undefined;
  }
}

// GET endpoint to retrieve usage stats (for admin/analytics)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Simple auth check - require a secret to view stats
    if (secret !== process.env.ANALYTICS_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const types: UsageType[] = ["legend", "linkedin", "portfolio", "resume", "manual"];
    const today = new Date().toISOString().split("T")[0];

    // Get totals
    const totals: Record<string, number> = {};
    const todayCounts: Record<string, number> = {};

    for (const type of types) {
      totals[type] = (await kv.get<number>(`usage:total:${type}`)) || 0;
      todayCounts[type] = (await kv.get<number>(`usage:daily:${today}:${type}`)) || 0;
    }

    // Get last 7 days breakdown
    const last7Days: Record<string, Record<string, number>> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last7Days[dateStr] = {};

      for (const type of types) {
        last7Days[dateStr][type] = (await kv.get<number>(`usage:daily:${dateStr}:${type}`)) || 0;
      }
    }

    // Get recent logs (last 50)
    const recentLogs = await kv.lrange("usage:logs:all", 0, 49);

    return NextResponse.json({
      totals,
      today: todayCounts,
      last7Days,
      recentLogs: recentLogs.map((log) => (typeof log === "string" ? JSON.parse(log) : log)),
    });
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
