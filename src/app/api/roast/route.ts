import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoastResult, DreamRole, DREAM_ROLES } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Dynamic import for pdf-parse (CommonJS module)
async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  return pdfParse(buffer);
}

const SYSTEM_PROMPT = `You are Lenny Rachitsky's AI twin. You have read every transcript from Lenny's Podcast - over 200 episodes with world-class PMs from Airbnb, Stripe, Figma, Linear, Notion, and more.

You are helpful but don't pull punches. You hate fluff like "stakeholder management" and love "impact," "product taste," and "rigor." You're witty, data-driven, slightly elitist, but actually insightful.

When analyzing a PM's profile or resume, you provide brutally honest but constructive feedback. You identify patterns that separate top 1% PMs from the rest.

Your responses MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "roastBullets": ["3-4 biting but accurate observations about their career"],
  "archetype": {
    "name": "A memorable persona like 'The Safe-Bet Specialist' or 'The Feature Factory Survivor'",
    "description": "2-3 sentence description of this archetype",
    "emoji": "A single emoji that represents this archetype"
  },
  "careerScore": 0-100 based on their trajectory toward becoming a top PM,
  "gaps": ["3-4 specific gaps in their experience or skills"],
  "roadmap": [
    {
      "month": 1,
      "title": "Month theme",
      "actions": ["2-3 specific actions"]
    },
    {
      "month": 2,
      "title": "Month theme",
      "actions": ["2-3 specific actions"]
    },
    {
      "month": 3,
      "title": "Month theme",
      "actions": ["2-3 specific actions"]
    },
    {
      "month": 4,
      "title": "Month theme",
      "actions": ["2-3 specific actions"]
    },
    {
      "month": 5,
      "title": "Month theme",
      "actions": ["2-3 specific actions"]
    },
    {
      "month": 6,
      "title": "Month theme",
      "actions": ["2-3 specific actions"]
    }
  ],
  "podcastEpisodes": [
    {
      "title": "Episode title",
      "guest": "Guest name",
      "reason": "Why they should listen"
    }
  ],
  "bangerQuote": "One memorable, shareable quote about their career for Twitter",
  "dreamRoleReaction": "A short, honest reaction to their dream role (can be encouraging or a reality check)"
}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const profileText = formData.get("profileText") as string | null;
    const dreamRole = formData.get("dreamRole") as DreamRole;

    if (!dreamRole || !DREAM_ROLES[dreamRole]) {
      return NextResponse.json({ error: "Invalid dream role" }, { status: 400 });
    }

    let resumeText = "";

    // Handle PDF upload
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await parsePdf(buffer);
      resumeText = pdfData.text;
    }
    // Handle LinkedIn profile text
    else if (profileText) {
      resumeText = profileText;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Not enough content to analyze. Please provide more details about your experience." },
        { status: 400 }
      );
    }

    // Call Gemini 1.5 Flash (stable, better free tier limits)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const prompt = `${SYSTEM_PROMPT}

Analyze this PM's profile/resume and provide a brutally honest roast. Their dream role is: ${DREAM_ROLES[dreamRole].label} (${DREAM_ROLES[dreamRole].description}).

Profile/Resume:
${resumeText}

Remember: Respond with valid JSON only. No markdown formatting, no code blocks, just the raw JSON object.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    // Parse JSON response
    let roastResult: RoastResult;
    try {
      // Clean the response - remove any markdown code blocks if present
      let jsonStr = textResponse.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      roastResult = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse Gemini response:", textResponse);
      throw new Error("Failed to parse AI response");
    }

    return NextResponse.json(roastResult);
  } catch (error) {
    console.error("Error processing roast:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process" },
      { status: 500 }
    );
  }
}
