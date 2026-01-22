import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getFamousCardByName, searchFamousCards } from "@/lib/famous-cards";

// Fetch Wikipedia page info and image for a person
async function getWikipediaInfo(name: string): Promise<{
  exists: boolean;
  title?: string;
  extract?: string;
  imageUrl?: string;
} | null> {
  try {
    // Search for the person on Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return { exists: false };
    }

    // Get the first result's page title
    const pageTitle = searchData.query.search[0].title;

    // Fetch page extract and image
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=original&format=json&origin=*`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();

    const pages = pageData.query?.pages;
    if (!pages) return { exists: false };

    const page = Object.values(pages)[0] as {
      title?: string;
      extract?: string;
      original?: { source?: string };
    };

    if (!page || (page as { missing?: boolean }).missing) {
      return { exists: false };
    }

    return {
      exists: true,
      title: page.title,
      extract: page.extract?.slice(0, 500), // First 500 chars of bio
      imageUrl: page.original?.source || undefined,
    };
  } catch (error) {
    console.error("Wikipedia API error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Invalid name provided" }, { status: 400 });
    }

    const normalizedName = name.trim();

    // First, check for exact match in pre-generated famous cards
    const exactMatch = getFamousCardByName(normalizedName);
    if (exactMatch) {
      return NextResponse.json({
        isFamous: true,
        name: exactMatch.name,
        reason: `${exactMatch.title} at ${exactMatch.company}`,
        imageUrl: exactMatch.imageUrl,
        source: "pre-generated",
      });
    }

    // Check for fuzzy match
    const fuzzyMatches = searchFamousCards(normalizedName);
    if (fuzzyMatches.length > 0) {
      const bestMatch = fuzzyMatches[0];
      const queryLower = normalizedName.toLowerCase();
      const matchLower = bestMatch.name.toLowerCase();

      if (matchLower.startsWith(queryLower) || queryLower.startsWith(matchLower.split(" ")[0])) {
        return NextResponse.json({
          isFamous: true,
          name: bestMatch.name,
          reason: `${bestMatch.title} at ${bestMatch.company}`,
          imageUrl: bestMatch.imageUrl,
          source: "pre-generated",
        });
      }
    }

    // Check cache for previously verified names
    const cacheKey = `verify:${normalizedName.toLowerCase().replace(/\s+/g, "-")}`;
    const cached = await kv.get<string>(cacheKey);

    if (cached) {
      const cachedResult = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json(cachedResult);
    }

    // Verify using Wikipedia
    const wikiInfo = await getWikipediaInfo(normalizedName);

    if (!wikiInfo || !wikiInfo.exists) {
      const result = {
        isFamous: false,
        name: normalizedName,
        reason: "No Wikipedia page found",
        source: "wikipedia",
      };

      // Cache the negative result for 1 day
      await kv.set(cacheKey, JSON.stringify(result), { ex: 24 * 60 * 60 });

      return NextResponse.json(result);
    }

    // Extract a brief description from the Wikipedia extract
    let reason = "Wikipedia verified";
    if (wikiInfo.extract) {
      // Get the first sentence as the reason
      const firstSentence = wikiInfo.extract.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 10) {
        reason = firstSentence.length > 100 ? firstSentence.slice(0, 100) + "..." : firstSentence;
      }
    }

    const result = {
      isFamous: true,
      name: wikiInfo.title || normalizedName,
      reason,
      imageUrl: wikiInfo.imageUrl || null,
      wikipediaExtract: wikiInfo.extract || null,
      source: "wikipedia",
    };

    // Cache the result for 7 days
    await kv.set(cacheKey, JSON.stringify(result), { ex: 7 * 24 * 60 * 60 });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in verify-legend API:", error);
    return NextResponse.json(
      { error: "Failed to verify legend" },
      { status: 500 }
    );
  }
}
