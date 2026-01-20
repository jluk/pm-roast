import { NextRequest, NextResponse } from "next/server";

// Simple HTML to text extraction
function htmlToText(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Replace common block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n');
  text = text.replace(/<(br|hr)[^>]*\/?>/gi, '\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&#\d+;/g, '');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  text = text.replace(/\n+/g, '\n');

  return text.trim();
}

// Extract meta description and title
function extractMeta(html: string): { title: string; description: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  return { title, description };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Ensure URL has protocol
    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    console.log("=== FETCHING WEBSITE ===");
    console.log("URL:", fullUrl);

    // Fetch the website
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PMRoastBot/1.0; +https://pmroast.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.log("Fetch failed:", response.status);
      return NextResponse.json({
        success: false,
        message: `Could not fetch website (${response.status}). Please paste your bio manually.`,
      });
    }

    const html = await response.text();
    console.log("HTML length:", html.length);

    // Extract meta info
    const meta = extractMeta(html);
    console.log("Title:", meta.title);
    console.log("Description:", meta.description);

    // Convert HTML to text
    let text = htmlToText(html);
    console.log("Extracted text length:", text.length);

    // Limit text length to avoid overwhelming the AI
    if (text.length > 10000) {
      text = text.slice(0, 10000) + '...';
    }

    // Build profile text
    let profileText = '';
    if (meta.title) {
      profileText += `Website: ${meta.title}\n`;
    }
    if (meta.description) {
      profileText += `Description: ${meta.description}\n`;
    }
    profileText += `URL: ${fullUrl}\n\n`;
    profileText += `Content:\n${text}`;

    // Check content quality
    const wordCount = text.split(/\s+/).length;
    console.log("Word count:", wordCount);

    if (wordCount < 50) {
      return NextResponse.json({
        success: true,
        quality: "partial",
        needsSupplement: true,
        profileText,
        message: "We found limited content on your website. Please add more details about your PM experience below.",
      });
    }

    // Check for PM-related keywords
    const pmKeywords = [
      'product', 'manager', 'pm', 'lead', 'senior', 'director',
      'experience', 'worked', 'built', 'launched', 'shipped',
      'team', 'engineering', 'design', 'growth', 'strategy'
    ];
    const lowerText = text.toLowerCase();
    const matchedKeywords = pmKeywords.filter(kw => lowerText.includes(kw));

    if (matchedKeywords.length < 2) {
      return NextResponse.json({
        success: true,
        quality: "partial",
        needsSupplement: true,
        profileText,
        message: "Your website doesn't seem to have much PM-related content. Please add details about your product experience below.",
      });
    }

    console.log("=== WEBSITE SCRAPE SUCCESS ===");
    return NextResponse.json({
      success: true,
      quality: "high",
      profileText,
    });

  } catch (error) {
    console.error("Website scrape error:", error);
    return NextResponse.json({
      success: false,
      message: "Could not fetch website. Please paste your bio manually.",
    });
  }
}
