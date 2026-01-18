import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoastResult, DreamRole, DREAM_ROLES, PMElement } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Dynamic import for pdf-parse (CommonJS module)
async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  return pdfParse(buffer);
}

// Element settings for image generation - includes background style and typical settings
const ELEMENT_SETTINGS: Record<PMElement, { bg: string; setting: string }> = {
  data: {
    bg: "blue-tinted office with glowing screens and data visualizations",
    setting: "surrounded by multiple monitors showing dashboards and metrics"
  },
  chaos: {
    bg: "busy startup environment with sticky notes and whiteboards everywhere",
    setting: "in the middle of a hectic open office with people rushing around"
  },
  strategy: {
    bg: "elegant executive boardroom with mahogany furniture",
    setting: "at a whiteboard covered in frameworks and strategy diagrams"
  },
  shipping: {
    bg: "modern tech office with deployment screens and green status lights",
    setting: "celebrating a product launch with confetti or shipping notifications"
  },
  politics: {
    bg: "corporate meeting room with glass walls and city skyline view",
    setting: "in a stakeholder meeting with executives around a conference table"
  },
  vision: {
    bg: "futuristic innovation lab with prototypes and concept boards",
    setting: "presenting a big vision on stage or at a product keynote"
  },
};

// Generate archetype image using Gemini showing person in context
async function generateArchetypeImage(
  archetypeName: string,
  archetypeDescription: string,
  emoji: string,
  element: PMElement
): Promise<string | null> {
  try {
    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const elementSettings = ELEMENT_SETTINGS[element];

    const imagePrompt = `Generate a stylized illustration of a Product Manager character for a trading card. The character represents "${archetypeName}".

Character personality: ${archetypeDescription}

SCENE REQUIREMENT (CRITICAL):
Show the character ${elementSettings.setting}. The background should be a ${elementSettings.bg}.

Style requirements:
- Illustrated character portrait showing a PERSON (not abstract or emoji)
- The person should be in a realistic work environment doing their job
- Semi-realistic or stylized illustration style (like editorial illustration)
- Show the character's personality through their expression and body language
- Professional attire appropriate for a tech PM
- Dynamic composition with the character as the clear focus
- No text, labels, or words in the image
- Vibrant but professional color palette
- The scene should tell a story about who this PM archetype is`;

    const result = await imageModel.generateContent({
      contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
      generationConfig: {
        temperature: 1,
      },
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyPart = part as any;
      if (anyPart.inlineData) {
        return `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
      }
    }

    console.log("No image data found in response");
    return null;
  } catch (error) {
    console.error("Failed to generate archetype image:", error);
    return null;
  }
}

const SYSTEM_PROMPT = `You are Lenny Rachitsky's AI twin. You've absorbed 200+ episodes of Lenny's Podcast with world-class PMs from Airbnb, Stripe, Figma, Linear, Notion, and more.

You're helpful but don't pull punches. You hate fluff like "stakeholder management" and love "impact," "product taste," and "rigor." Witty, data-driven, slightly elitist, but genuinely insightful.

When analyzing a PM's profile, provide brutally honest but constructive feedback. Identify patterns that separate top 1% PMs from the rest.

PM ELEMENT TYPES (choose the most fitting one):
- "data": PMs obsessed with metrics, dashboards, A/B tests
- "chaos": PMs who thrive in ambiguity, firefighting, rapid pivots
- "strategy": PMs focused on planning, documentation, frameworks
- "shipping": PMs who just get things done, velocity-obsessed
- "politics": PMs skilled at stakeholder management, influence
- "vision": PMs with big ideas, product intuition, founder-like thinking

IMPORTANT FORMATTING RULES:
- Keep ALL text concise. No markdown formatting anywhere.
- Archetype name: SHORT (2-3 words max, like "Metric Monk" or "Chaos Navigator") - must fit on one line!
- Roast bullets: punchy and funny, max 80 chars each.
- Archetype description: plain text only, max 100 chars, no asterisks or formatting.
- Archetype flavor: Pokédex-style description, max 100 chars, witty and observational.
- Archetype stage: Based on their experience level (Junior, Mid-Level, Senior, Lead, Staff, Principal, L6, etc.)
- Archetype weakness: ONE funny word that's their kryptonite (e.g., "Users", "Shipping", "Deadlines", "Meetings")
- Moves: 2-3 funny PM "attacks" with SHORT names (max 15 chars), energy costs (1-3), damage (10-100), and optional effects.
- Gap items: specific and actionable, max 60 chars each.
- Roadmap titles: max 20 chars.
- Roadmap actions: max 40 chars each, plain text.
- The bangerQuote: tweet-worthy, max 140 chars, no quotes inside.
- dreamRoleReaction: max 80 chars, plain text.

Your responses MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "roastBullets": ["3-4 biting observations, max 80 chars each"],
  "archetype": {
    "name": "SHORT 2-3 word name like 'Metric Monk' (NO 'The')",
    "description": "Plain text, max 100 chars, NO markdown/asterisks",
    "emoji": "Single emoji",
    "element": "data|chaos|strategy|shipping|politics|vision",
    "flavor": "Pokédex-style witty description, max 100 chars",
    "stage": "Junior|Mid-Level|Senior|Lead|Staff|Principal|L6|etc",
    "weakness": "One funny word like 'Users' or 'Shipping'"
  },
  "moves": [
    {
      "name": "Funny attack name, max 20 chars",
      "energyCost": 1-3,
      "damage": 10-100,
      "effect": "Optional funny effect, max 50 chars"
    }
  ],
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

    // Call Gemini
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

    // Ensure element is valid, default to "chaos" if not
    const validElements: PMElement[] = ["data", "chaos", "strategy", "shipping", "politics", "vision"];
    if (!roastResult.archetype.element || !validElements.includes(roastResult.archetype.element)) {
      roastResult.archetype.element = "chaos";
    }

    // Ensure moves exist
    if (!roastResult.moves || roastResult.moves.length === 0) {
      roastResult.moves = [
        { name: "Scope Creep", energyCost: 1, damage: 30, effect: "Add 3 requirements mid-sprint." },
        { name: "Stakeholder Dodge", energyCost: 2, damage: 50 },
      ];
    }

    // Ensure flavor exists
    if (!roastResult.archetype.flavor) {
      roastResult.archetype.flavor = roastResult.archetype.description;
    }

    // Ensure stage exists
    if (!roastResult.archetype.stage) {
      roastResult.archetype.stage = "Senior";
    }

    // Ensure weakness exists
    if (!roastResult.archetype.weakness) {
      roastResult.archetype.weakness = "Meetings";
    }

    // Generate archetype image with elemental background
    console.log("=== GENERATING ARCHETYPE IMAGE ===");
    const archetypeImage = await generateArchetypeImage(
      roastResult.archetype.name,
      roastResult.archetype.description,
      roastResult.archetype.emoji,
      roastResult.archetype.element
    );

    if (archetypeImage) {
      roastResult.archetypeImage = archetypeImage;
      console.log("=== IMAGE GENERATED SUCCESSFULLY ===");
    } else {
      console.log("=== IMAGE GENERATION SKIPPED/FAILED ===");
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
