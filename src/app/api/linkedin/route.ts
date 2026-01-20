import { NextRequest, NextResponse } from "next/server";
import { fetchLinkedInData } from "@/lib/linkedin";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    console.log("=== LINKEDIN API ROUTE START ===");
    console.log("Received URL:", url);

    if (!url) {
      console.log("Error: No URL provided");
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Validate LinkedIn URL (allow various formats)
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?(\?.*)?$/;
    if (!linkedinRegex.test(url)) {
      console.log("Error: Invalid LinkedIn URL format");
      console.log("URL received:", url);
      console.log("Regex used:", linkedinRegex.toString());
      return NextResponse.json(
        { error: "Invalid LinkedIn URL. Please use format: linkedin.com/in/username" },
        { status: 400 }
      );
    }

    // Clean the URL (remove query params)
    const cleanUrl = url.split("?")[0].replace(/\/$/, "");
    console.log("Cleaned URL:", cleanUrl);

    // Fetch profile data using LinkdAPI
    const result = await fetchLinkedInData(cleanUrl);

    console.log("=== FETCH RESULT ===");
    console.log("Success:", result.success);
    console.log("Profile text length:", result.profileText?.length || 0);
    console.log("Has profile pic:", !!result.profilePicUrl);
    console.log("Is mock:", result.isMock);
    console.log("Error code:", result.errorCode);

    if (result.success) {
      // Check if we have enough data for a QUALITY roast
      const textLength = result.profileText?.length || 0;
      const experiences = result.data?.experiences || [];
      const hasExperiences = experiences.length > 0;
      const experiencesWithDescriptions = experiences.filter(e => e.description && e.description.length > 20);
      const experiencesWithCompanies = experiences.filter(e => e.company);
      const experiencesWithTitles = experiences.filter(e => e.title);
      const hasSummary = result.data?.summary && result.data.summary.length > 50;
      const hasHeadline = result.data?.headline && result.data.headline.length > 10;

      console.log("=== DATA QUALITY FOR ROAST ===");
      console.log("Text length:", textLength);
      console.log("Has experiences:", hasExperiences);
      console.log("Total experiences:", experiences.length);
      console.log("Experiences with descriptions:", experiencesWithDescriptions.length);
      console.log("Experiences with companies:", experiencesWithCompanies.length);
      console.log("Experiences with titles:", experiencesWithTitles.length);
      console.log("Has summary (50+ chars):", hasSummary);
      console.log("Has headline (10+ chars):", hasHeadline);

      // Quality assessment for roast-worthy content
      // We need EITHER:
      // 1. At least 1 experience with a description (tells us what they actually DID)
      // 2. OR a substantial summary (50+ chars) that describes their work
      // 3. AND at least some job context (company + title)
      const hasSubstantiveContent = experiencesWithDescriptions.length >= 1 || hasSummary;
      const hasBasicJobContext = experiencesWithCompanies.length >= 1 && experiencesWithTitles.length >= 1;
      const isHighQuality = hasSubstantiveContent && hasBasicJobContext && textLength >= 150;
      const isPartialQuality = hasBasicJobContext && textLength >= 100;

      console.log("=== QUALITY ASSESSMENT ===");
      console.log("Has substantive content:", hasSubstantiveContent);
      console.log("Has basic job context:", hasBasicJobContext);
      console.log("Is HIGH quality (proceed automatically):", isHighQuality);
      console.log("Is PARTIAL quality (needs supplementing):", isPartialQuality && !isHighQuality);

      if (textLength < 100) {
        console.log("WARNING: Profile text is under 100 chars");
        console.log("Full profile text:", result.profileText);
      }

      // HIGH QUALITY: Proceed automatically
      if (isHighQuality) {
        console.log("=== HIGH QUALITY - PROCEEDING ===");
        return NextResponse.json({
          success: true,
          profileText: result.profileText,
          profilePicUrl: result.profilePicUrl || null,
          data: result.data,
          isMock: result.isMock || false,
          quality: "high",
          message: result.isMock
            ? "Using mock profile (API key not configured)"
            : "Profile fetched successfully",
        });
      }

      // PARTIAL QUALITY: Return what we have but flag it needs supplementing
      if (isPartialQuality) {
        console.log("=== PARTIAL QUALITY - NEEDS SUPPLEMENT ===");
        return NextResponse.json({
          success: true,
          profileText: result.profileText,
          profilePicUrl: result.profilePicUrl || null,
          data: result.data,
          isMock: result.isMock || false,
          quality: "partial",
          needsSupplement: true,
          message: "We found your basic info but need more details for a quality roast. Please add your job descriptions and achievements below.",
        });
      }

      // LOW QUALITY: Not enough for any useful roast
      console.log("=== LOW QUALITY - NEEDS MANUAL INPUT ===");
      return NextResponse.json({
        success: false,
        profileText: result.profileText || "",
        profilePicUrl: result.profilePicUrl || null,
        data: result.data,
        quality: "low",
        needsManual: true,
        message: "We couldn't find enough details on your LinkedIn profile. Please paste your experience information below for an accurate roast.",
      });
    }

    // Handle specific error cases
    if (result.errorCode === "NOT_FOUND") {
      console.log("=== RETURNING NOT_FOUND ERROR ===");
      return NextResponse.json(
        {
          success: false,
          needsManual: true,
          error: result.error,
          message: "Profile not found. Please paste your LinkedIn content manually.",
        },
        { status: 404 }
      );
    }

    if (result.errorCode === "RATE_LIMITED") {
      console.log("=== RETURNING RATE_LIMITED ERROR ===");
      return NextResponse.json(
        {
          success: false,
          needsManual: true,
          error: result.error,
          message: "Service temporarily unavailable. Please paste your LinkedIn content manually.",
        },
        { status: 429 }
      );
    }

    // Generic error - suggest manual input
    console.log("=== RETURNING GENERIC ERROR ===");
    console.log("Error details:", result.error);
    console.log("Error code:", result.errorCode);
    return NextResponse.json({
      success: false,
      needsManual: true,
      error: result.error,
      message: "Could not fetch profile automatically. Please paste your LinkedIn content manually.",
    });
  } catch (error) {
    console.error("=== LINKEDIN API ROUTE EXCEPTION ===");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    return NextResponse.json(
      {
        success: false,
        needsManual: true,
        error: error instanceof Error ? error.message : "Failed to process LinkedIn URL",
        message: "Something went wrong. Please paste your LinkedIn content manually.",
      },
      { status: 500 }
    );
  }
}
