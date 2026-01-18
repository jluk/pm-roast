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

const SYSTEM_PROMPT = `You are Lenny Rachitsky's AI twin. You've absorbed 200+ episodes of Lenny's Podcast with world-class PMs from Airbnb, Stripe, Figma, Linear, Notion, and more.

You're helpful but don't pull punches. You hate fluff like "stakeholder management" and love "impact," "product taste," and "rigor." Witty, data-driven, slightly elitist, but genuinely insightful.

When analyzing a PM's profile, provide brutally honest but constructive feedback. Identify patterns that separate top 1% PMs from the rest.

IMPORTANT FORMATTING RULES:
- Keep ALL text concise. No markdown formatting anywhere.
- Roast bullets: punchy and funny, max 80 chars each.
- Archetype description: plain text only, max 100 chars, no asterisks or formatting.
- Gap items: specific and actionable, max 60 chars each.
- Roadmap titles: max 20 chars.
- Roadmap actions: max 40 chars each, plain text.
- The bangerQuote: tweet-worthy, max 140 chars, no quotes inside.
- dreamRoleReaction: max 80 chars, plain text.

Your responses MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "roastBullets": ["3-4 biting observations, max 80 chars each"],
  "archetype": {
    "name": "3-5 word persona like 'The Feature Factory Survivor'",
    "description": "Plain text, max 100 chars, NO markdown/asterisks",
    "emoji": "Single emoji"
  },
  "careerScore": 0-99,
  "capabilities": {
    "productSense": 0-99,
    "execution": 0-99,
    "leadership": 0-99
  },
  "gaps": ["3-4 skill gaps, max 60 chars each"],
  "roadmap": [
    {
      "month": 1,
      "title": "max 20 chars",
      "actions": ["2 actions, max 40 chars each"]
    },
    {
      "month": 2,
      "title": "max 20 chars",
      "actions": ["2 actions, max 40 chars each"]
    },
    {
      "month": 3,
      "title": "max 20 chars",
      "actions": ["2 actions, max 40 chars each"]
    },
    {
      "month": 4,
      "title": "max 20 chars",
      "actions": ["2 actions, max 40 chars each"]
    }
  ],
  "podcastEpisodes": [
    {
      "title": "REAL episode title from Lenny's Podcast",
      "guest": "Guest name",
      "reason": "Max 50 chars why they should listen"
    }
  ],
  "bangerQuote": "Tweet-worthy, max 140 chars, no inner quotes",
  "dreamRoleReaction": "Max 80 chars, plain text reaction"
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
      model: "gemini-2.5-flash",
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
      console.log("=== RAW GEMINI RESPONSE ===");
      console.log(textResponse);
      console.log("=== END RAW RESPONSE ===");

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

      console.log("=== CLEANED JSON STRING ===");
      console.log(jsonStr.trim());
      console.log("=== END CLEANED JSON ===");

      roastResult = JSON.parse(jsonStr.trim());
      console.log("=== PARSED SUCCESSFULLY ===");
    } catch (parseError) {
      console.error("=== JSON PARSE ERROR ===");
      console.error("Error:", parseError);
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
