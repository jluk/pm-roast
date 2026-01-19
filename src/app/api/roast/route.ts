import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { RoastResult, DreamRole, DREAM_ROLES, PMElement } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Dynamic import for pdf-parse (CommonJS module)
async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  return pdfParse(buffer);
}

// Element settings for image generation - includes background style, setting, and creature type
const ELEMENT_SETTINGS: Record<PMElement, { bg: string; setting: string; creature: string; colors: string }> = {
  data: {
    bg: "glowing digital landscape with floating data streams and holographic charts",
    setting: "analyzing glowing data orbs floating around them",
    creature: "owl or fox with glowing digital patterns on fur/feathers",
    colors: "blue, cyan, and electric purple"
  },
  chaos: {
    bg: "swirling vortex of colors with scattered papers and sticky notes flying",
    setting: "juggling multiple glowing orbs while balancing on a spinning top",
    creature: "energetic monkey or squirrel with wild fur and sparking energy",
    colors: "red, orange, and electric yellow"
  },
  strategy: {
    bg: "ancient library with floating chess pieces and strategy maps",
    setting: "contemplating a glowing 3D chess board",
    creature: "wise elephant or tortoise with ancient runes on their skin",
    colors: "deep purple, gold, and forest green"
  },
  shipping: {
    bg: "rocket launch pad with stars and deployment confetti",
    setting: "riding a rocket or standing triumphantly on a launched product",
    creature: "determined wolf or falcon with sleek aerodynamic features",
    colors: "green, silver, and bright orange"
  },
  politics: {
    bg: "grand throne room with multiple factions represented",
    setting: "diplomatically mediating between different creature groups",
    creature: "charismatic lion or peacock with regal bearing",
    colors: "royal purple, gold, and deep red"
  },
  vision: {
    bg: "cosmic dreamscape with nebulas and floating islands of ideas",
    setting: "gazing into a crystal ball showing future possibilities",
    creature: "mystical phoenix or dragon with ethereal glowing features",
    colors: "iridescent rainbow, pink, and cosmic purple"
  },
};

// Fetch image from URL and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch profile image:", response.status);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return { data: base64, mimeType: contentType };
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return null;
  }
}

// Generate archetype image using Gemini - with profile photo if available
async function generateArchetypeImage(
  archetypeName: string,
  archetypeDescription: string,
  emoji: string,
  element: PMElement,
  profilePicUrl?: string | null
): Promise<string | null> {
  try {
    const elementSettings = ELEMENT_SETTINGS[element];

    // If we have a profile photo, use it for personalized generation
    if (profilePicUrl) {
      console.log("=== GENERATING PERSONALIZED IMAGE FROM PROFILE PHOTO ===");
      console.log("Profile URL:", profilePicUrl);

      const profileImage = await fetchImageAsBase64(profilePicUrl);

      if (profileImage) {
        console.log("Profile image fetched, size:", profileImage.data.length);

        const personalizedPrompt = `Transform this person's photo into a Pokemon-style trading card character illustration. The character represents the "${archetypeName}" PM archetype.

Character personality: ${archetypeDescription}

TRANSFORMATION REQUIREMENTS:
- Create a stylized illustration BASED ON this person - keep their general likeness, hair style, and distinctive features
- Transform them into an animated character (like a Studio Ghibli or Pokemon trainer style)
- Place them ${elementSettings.setting}
- Background should be a ${elementSettings.bg}
- Primary colors: ${elementSettings.colors}

COMPOSITION (CRITICAL):
- The person must be CENTERED in the frame
- Show from chest/shoulders up - classic trading card portrait
- Face must be clearly visible, looking confident
- Eyes should be slightly larger and more expressive (anime-influenced)

ART STYLE (CRITICAL):
- Hand-drawn watercolor illustration style like classic Pokemon cards
- Soft edges with visible watercolor texture
- Gentle color gradients and washes
- Whimsical and heroic, suitable for a collectible card game
- Keep their face recognizable but stylized in watercolor

DO NOT:
- Cut off the top of their head
- Use photorealistic style
- Add any text, labels, or words`;

        try {
          // Use new SDK for image generation with profile photo
          const response = await genAINew.models.generateContent({
            model: "gemini-2.0-flash-exp-image-generation",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: profileImage.mimeType,
                      data: profileImage.data,
                    },
                  },
                  { text: personalizedPrompt },
                ],
              },
            ],
            config: {
              responseModalities: ["Text", "Image"],
            },
          });

          // Check for image in response
          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const anyPart = part as any;
              if (anyPart.inlineData) {
                console.log("=== PERSONALIZED IMAGE GENERATED ===");
                return `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
              }
            }
          }

          console.log("No personalized image in response, trying generic");
        } catch (personalizedError) {
          console.error("Personalized image generation failed:", personalizedError);
        }
      }
    }

    // Fallback: Generate Pokemon-style creature without profile photo
    console.log("=== GENERATING POKEMON-STYLE CREATURE IMAGE ===");

    const imagePrompt = `Generate a Pokemon-style creature illustration for a trading card. The creature represents the "${archetypeName}" archetype.

Creature personality: ${archetypeDescription}

CREATURE DESIGN:
- Create a cute but powerful creature inspired by a ${elementSettings.creature}
- The creature should be ${elementSettings.setting}
- Background: ${elementSettings.bg}
- Primary colors: ${elementSettings.colors}

COMPOSITION (CRITICAL):
- The creature must be CENTERED in the frame
- Show the FULL creature from head to feet/tail - no cropping
- The creature should take up 60-70% of the image
- Face and eyes must be clearly visible and expressive
- Portrait orientation, creature facing slightly toward viewer

ART STYLE (CRITICAL):
- Hand-drawn watercolor illustration style like classic Pokemon cards
- Soft edges with visible watercolor texture and paper grain
- Gentle color gradients and washes
- Slightly cel-shaded with soft shadows
- Whimsical and fantastical, suitable for a collectible card game
- Expressive eyes that convey the creature's personality

DO NOT:
- Cut off any part of the creature
- Use photorealistic style
- Add any text, labels, or words
- Make the creature too scary or aggressive`;

    // Use new SDK with responseModalities for image generation
    const response = await genAINew.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: imagePrompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    console.log("Generic response received");

    // Check for image in response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      console.log("Parts count:", response.candidates[0].content.parts.length);

      for (const part of response.candidates[0].content.parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPart = part as any;
        if (anyPart.inlineData) {
          console.log("=== GENERIC IMAGE GENERATED ===");
          return `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
        }
      }
    }

    console.log("No image data found in response");
    return null;
  } catch (error) {
    console.error("Failed to generate archetype image:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
}

const SYSTEM_PROMPT = `You are Lenny Rachitsky's AI twin. You've absorbed 200+ episodes of Lenny's Podcast with world-class PMs from Airbnb, Stripe, Figma, Linear, Notion, and more.

You're helpful but don't pull punches. You hate fluff like "stakeholder management" and love "impact," "product taste," and "rigor." Witty, data-driven, slightly elitist, but genuinely insightful.

When analyzing a PM's profile, provide brutally honest but constructive feedback. Identify patterns that separate top 1% PMs from the rest.

TONE CALIBRATION - BALANCE ROASTS AND COMPLIMENTS:
The roast intensity should match the career score you assign:
- Score 0-39 (Common): Heavy roasting, but include 1 genuine compliment to keep them motivated
- Score 40-59 (Uncommon): Mostly roasting with hints of potential you see in them
- Score 60-74 (Rare): Balance of roasts and recognition of solid skills
- Score 75-84 (Ultra Rare): More compliments, roasts are playful jabs at minor gaps
- Score 85-94 (Rainbow Rare): Mostly impressed, roasts are affectionate teasing
- Score 95-100 (Gold): Genuine admiration with lighthearted nitpicks

The roastBullets should reflect this balance. Higher scores = more "humble brag" style observations.
Example for high score: "Your resume is so stacked it gave my GPU anxiety" (compliment disguised as roast)
Example for low score: "Your profile has more buzzwords than a LinkedIn influencer's fever dream"

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. ONLY use information explicitly stated in the provided profile/resume. DO NOT invent, assume, or hallucinate any details.
2. Base the archetype, roasts, gaps, and scores SOLELY on what the person has actually done according to their profile.
3. If the profile mentions specific companies, use those. If it mentions specific achievements, reference those.
4. The career score, capabilities, and stage MUST reflect the actual experience level shown in the profile.
5. DO NOT make up job titles, companies, or achievements that aren't in the profile.
6. If the profile lacks detail, reflect that in your roast (e.g., "Your profile is vaguer than a PM's success metrics").
7. NEVER address the person by name or use ANY names in your responses. Do not say "You've crushed it, Alex" or similar. Use "you" or refer to their role/title instead.
8. NEVER hallucinate or invent names. If you don't know their name, don't guess - just use "you" or "this PM".

PM ELEMENT TYPES (choose the most fitting one):
- "data": PMs obsessed with metrics, dashboards, A/B tests
- "chaos": PMs who thrive in ambiguity, firefighting, rapid pivots
- "strategy": PMs focused on planning, documentation, frameworks
- "shipping": PMs who just get things done, velocity-obsessed
- "politics": PMs skilled at stakeholder management, influence
- "vision": PMs with big ideas, product intuition, founder-like thinking

MOVE GENERATION RULES (CRITICAL):
- Each move MUST reference something specific from their actual profile (company, product, achievement)
- Move names should be punny/clever references to their real work (e.g., if they worked on Ads, "Ad Nauseam")
- The effect MUST be a funny one-liner explaining the move, based on their actual experience
- Example: If profile says "launched billing system", move could be "Invoice Inferno" with effect "Bills stakeholders into submission. Revenue +30%."
- NEVER use generic moves like "Scope Creep" - make them personal to THIS PM's history

IMPORTANT FORMATTING RULES:
- Keep ALL text concise. No markdown formatting anywhere.
- Archetype name: SHORT (2-3 words max, like "Metric Monk" or "Chaos Navigator") - must fit on one line!
- Roast bullets: punchy and funny, max 80 chars each.
- Archetype description: plain text only, max 100 chars, no asterisks or formatting.
- Archetype flavor: Pokédex-style description, max 100 chars, witty and observational.
- Archetype stage: Based on their experience level (Junior, Mid-Level, Senior, Lead, Staff, Principal, L6, etc.)
- Archetype weakness: ONE funny word that's their kryptonite (e.g., "Users", "Shipping", "Deadlines", "Meetings")
- Moves: 2 funny PM "attacks" based on THEIR ACTUAL WORK. VERY short names (max 12 chars), energy cost (1-3), damage (10-100), and REQUIRED funny effect (max 30 chars, must fit one line).
- Gap items: specific and actionable, max 60 chars each.
- Roadmap titles: max 20 chars.
- Roadmap actions: max 40 chars each, plain text.
- The bangerQuote: tweet-worthy, max 140 chars, no quotes inside. NEVER use names - use "you" instead.
- dreamRoleReaction: max 80 chars, plain text. NEVER use names - address as "you".

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
      "name": "Short attack name, max 12 chars",
      "energyCost": 1-3,
      "damage": 10-100,
      "effect": "Funny one-liner, max 30 chars"
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
    const profilePicUrl = formData.get("profilePicUrl") as string | null;
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

    // Validate profile content - need meaningful data
    const trimmedText = resumeText.trim();
    if (!trimmedText || trimmedText.length < 100) {
      return NextResponse.json(
        {
          error: "Not enough content to analyze. We need at least your job titles, companies, and key achievements to give you an accurate roast. Please provide more details.",
          errorCode: "INSUFFICIENT_DATA"
        },
        { status: 400 }
      );
    }

    // Check for meaningful content (should have some work-related keywords)
    const meaningfulKeywords = [
      'product', 'manager', 'pm', 'lead', 'senior', 'staff', 'director',
      'company', 'startup', 'experience', 'worked', 'built', 'launched',
      'team', 'engineering', 'design', 'growth', 'strategy', 'revenue',
      'users', 'customers', 'metrics', 'shipped', 'developed', 'managed'
    ];
    const lowerText = trimmedText.toLowerCase();
    const matchedKeywords = meaningfulKeywords.filter(keyword => lowerText.includes(keyword));

    // Require at least 2 relevant keywords to ensure we have real content
    if (matchedKeywords.length < 2) {
      return NextResponse.json(
        {
          error: "We need more details about your PM experience to generate an accurate roast. Please include your job titles, companies you've worked at, and what you've built or shipped.",
          errorCode: "INVALID_CONTENT"
        },
        { status: 400 }
      );
    }

    // Additional check: require minimum word count to prevent sparse inputs
    const wordCount = trimmedText.split(/\s+/).length;
    if (wordCount < 30) {
      return NextResponse.json(
        {
          error: "Your profile is too brief for an accurate roast. Please add more details about your experience, achievements, and the products you've worked on.",
          errorCode: "INSUFFICIENT_DATA"
        },
        { status: 400 }
      );
    }

    console.log("=== PROFILE TEXT BEING ANALYZED ===");
    console.log(trimmedText.slice(0, 500) + (trimmedText.length > 500 ? "..." : ""));
    console.log("=== END PROFILE PREVIEW ===");

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

Analyze the following PM's profile/resume and provide a brutally honest roast. Their dream role is: ${DREAM_ROLES[dreamRole].label} (${DREAM_ROLES[dreamRole].description}).

IMPORTANT: Your entire analysis MUST be based ONLY on the information below. Reference specific companies, roles, and achievements mentioned. Do not invent details.

=== START OF PROFILE ===
${resumeText}
=== END OF PROFILE ===

Based ONLY on the profile above, generate your roast. If the profile mentions working at Google, reference Google. If they were at a startup, reference that. Every roast bullet and observation must tie back to something in their actual profile.

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

    // Ensure moves exist and all have effects
    if (!roastResult.moves || roastResult.moves.length === 0) {
      roastResult.moves = [
        { name: "Generic PM", energyCost: 1, damage: 30, effect: "Profile too vague to roast properly." },
        { name: "Mystery Move", energyCost: 2, damage: 50, effect: "Nobody knows what they actually did." },
      ];
    } else {
      // Ensure all moves have effects
      roastResult.moves = roastResult.moves.map(move => ({
        ...move,
        effect: move.effect || "A classic PM power move."
      }));
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

    // Generate archetype image with elemental background (personalized if we have profile photo)
    console.log("=== GENERATING ARCHETYPE IMAGE ===");
    console.log("Profile pic URL:", profilePicUrl || "not provided");
    const archetypeImage = await generateArchetypeImage(
      roastResult.archetype.name,
      roastResult.archetype.description,
      roastResult.archetype.emoji,
      roastResult.archetype.element,
      profilePicUrl
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
