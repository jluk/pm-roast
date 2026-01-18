import { NextRequest, NextResponse } from "next/server";
import { fetchLinkedInData } from "@/lib/linkedin";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Validate LinkedIn URL (allow various formats)
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?(\?.*)?$/;
    if (!linkedinRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL. Please use format: linkedin.com/in/username" },
        { status: 400 }
      );
    }

    // Clean the URL (remove query params)
    const cleanUrl = url.split("?")[0].replace(/\/$/, "");

    // Fetch profile data using Proxycurl
    const result = await fetchLinkedInData(cleanUrl);

    if (result.success) {
      return NextResponse.json({
        success: true,
        profileText: result.profileText,
        data: result.data,
        isMock: result.isMock || false,
        message: result.isMock
          ? "Using mock profile (API key not configured)"
          : "Profile fetched successfully",
      });
    }

    // Handle specific error cases
    if (result.errorCode === "NOT_FOUND") {
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
    return NextResponse.json({
      success: false,
      needsManual: true,
      error: result.error,
      message: "Could not fetch profile automatically. Please paste your LinkedIn content manually.",
    });
  } catch (error) {
    console.error("Error processing LinkedIn URL:", error);
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
