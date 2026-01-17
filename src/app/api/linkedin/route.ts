import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Validate LinkedIn URL
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    if (!linkedinRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL. Please use format: linkedin.com/in/username" },
        { status: 400 }
      );
    }

    // Try to fetch the LinkedIn page
    // Note: This often fails due to LinkedIn's anti-scraping measures
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch LinkedIn profile");
      }

      const html = await response.text();

      // Try to extract basic info from the HTML
      // LinkedIn public profiles have some data in meta tags and JSON-LD
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const descriptionMatch = html.match(/<meta name="description" content="([^"]+)"/);

      // Try to find JSON-LD data
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);

      let profileText = "";

      if (titleMatch) {
        profileText += titleMatch[1] + "\n\n";
      }

      if (descriptionMatch) {
        profileText += descriptionMatch[1] + "\n\n";
      }

      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.description) {
            profileText += jsonLd.description + "\n\n";
          }
        } catch {
          // JSON-LD parsing failed, continue
        }
      }

      // If we got meaningful content, return it
      if (profileText.trim().length > 100) {
        return NextResponse.json({
          success: true,
          profileText: profileText.trim(),
          message: "Profile fetched successfully"
        });
      }

      // If we couldn't extract enough, return needs_manual flag
      return NextResponse.json({
        success: false,
        needsManual: true,
        message: "Could not automatically fetch profile. Please paste your LinkedIn content manually."
      });

    } catch {
      // Fetch failed, need manual input
      return NextResponse.json({
        success: false,
        needsManual: true,
        message: "LinkedIn blocks automated access. Please paste your profile content manually."
      });
    }

  } catch (error) {
    console.error("Error processing LinkedIn URL:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process LinkedIn URL" },
      { status: 500 }
    );
  }
}
