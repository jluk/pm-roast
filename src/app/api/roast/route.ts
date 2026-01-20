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

// Element settings for image generation - Pokemon-style nostalgic vibes with internet humor
// Funny fallback names when no name is provided - concept names organized by element
const FUNNY_FALLBACK_NAMES: Record<PMElement, string[]> = {
  data: [
    "The Metric Goblin", "Dashboard Creature", "A/B Test Subject", "KPI Whisperer", "Spreadsheet Gremlin",
    "The Pivot Table", "Cohort Analysis", "Funnel Vision", "North Star Chaser", "The SQL Injection"
  ],
  chaos: [
    "The Firefighter", "Hotfix Hero", "Incident Commander", "Pager Duty", "Slack Channel",
    "The War Room", "Chaos Monkey", "The Escalation", "Scope Creep", "Technical Debt"
  ],
  strategy: [
    "The Framework", "Roadmap Warrior", "OKR Enthusiast", "The 2x2 Matrix", "Strategy Doc",
    "The Alignment", "Memo Author", "The Offsite", "PRD Machine", "Vision Statement"
  ],
  shipping: [
    "Ship It", "Deploy Button", "Release Train", "Sprint Zero", "Velocity Machine",
    "Launch Sequence", "LGTM Energy", "The Merge", "Pipeline Dreams", "Push to Prod"
  ],
  politics: [
    "The Stakeholder", "Skip Level", "Alignment Check", "Consensus Builder", "Buy-In Seeker",
    "The Influencer", "Executive Summary", "The Reorg", "Meeting Survivor", "Slack Thread"
  ],
  vision: [
    "The Moonshot", "10x Thinker", "Zero to One", "Paradigm Shift", "Hockey Stick",
    "The Disruption", "Future State", "Product Vision", "The Pivot", "Unicorn Dreams"
  ],
};

// Get a funny fallback name based on element
function getFunnyFallbackName(element: PMElement): string {
  const names = FUNNY_FALLBACK_NAMES[element] || FUNNY_FALLBACK_NAMES.chaos;
  return names[Math.floor(Math.random() * names.length)];
}

const ELEMENT_SETTINGS: Record<PMElement, { bg: string; setting: string; creature: string; colors: string; props: string }> = {
  data: {
    bg: "glowing crystal cave with floating holographic charts and data streams, Pokemon TCG style",
    setting: "surrounded by floating glowing orbs of data, analyzing patterns in the air",
    creature: "mysterious creature with glowing eyes and digital patterns on its form",
    colors: "electric blue, cyan glow, and deep purple shadows",
    props: "floating crystals showing metrics, mystical dashboard runes, glowing spreadsheet tablets"
  },
  chaos: {
    bg: "swirling vortex dimension with multiple portals and chaotic energy, classic Pokemon battle arena",
    setting: "surfing on a wave of notifications while juggling multiple glowing objects",
    creature: "wild-eyed creature crackling with chaotic energy, fur/feathers standing on end",
    colors: "hot pink, electric orange, warning red, and purple lightning",
    props: "floating notification bubbles, swirling task tornados, coffee cup meteors"
  },
  strategy: {
    bg: "ancient temple library with floating scrolls and mystical strategy boards, Pokemon Gym aesthetic",
    setting: "contemplating a glowing 3D chess board hovering in midair",
    creature: "wise sage-like creature with ancient markings and knowing eyes",
    colors: "royal purple, gold accents, and mystical green glow",
    props: "floating framework scrolls, glowing 2x2 matrices, ancient strategy tomes"
  },
  shipping: {
    bg: "rocket launch platform with countdown displays and epic deployment energy, Pokemon Stadium vibes",
    setting: "dramatically pressing a giant glowing launch button as rockets ignite",
    creature: "determined warrior creature with battle scars and intense focus",
    colors: "launch orange, victory green, and midnight blue",
    props: "countdown holographics, feature flag banners, deployment aurora effects"
  },
  politics: {
    bg: "grand Pokemon League hall with multiple faction banners and political intrigue",
    setting: "standing confidently between two opposing groups, playing both sides",
    creature: "charming trickster creature with a knowing smirk and diplomatic pose",
    colors: "royal gold, power red, and alliance purple",
    props: "floating alliance symbols, relationship web threads, influence auras"
  },
  vision: {
    bg: "cosmic dreamscape with nebulas, floating islands, and reality-bending horizons",
    setting: "floating in space surrounded by visions of possible futures",
    creature: "ethereal visionary creature with starlight in its eyes and cosmic energy",
    colors: "dream pink, cosmic purple, and infinite blue gradient",
    props: "floating future visions, hockey stick constellations, reality distortion waves"
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

        const personalizedPrompt = `Transform this person into a POKEMON TRADING CARD style character illustration. They are "${archetypeName}" - an iconic PM archetype.

Character vibe: ${archetypeDescription}

SCENE (POKEMON TCG AESTHETIC):
- Place them ${elementSettings.setting}
- Background: ${elementSettings.bg}
- Include magical props: ${elementSettings.props}
- Primary colors: ${elementSettings.colors}

TRANSFORMATION:
- Transform them into a stylized Pokemon trainer/character
- Keep their general likeness recognizable but make it anime/cartoon style
- Exaggerated expressions - this is internet humor energy
- Think: nostalgic 90s/2000s Pokemon card art meets modern meme culture

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio (wider than tall)
- Subject must be CENTERED horizontally
- Show from waist/chest up - classic trading card portrait framing
- Leave breathing room on all sides - don't crop the head or shoulders
- Subject takes up 50-60% of frame height, centered

ART STYLE (CRITICAL - POKEMON TCG NOSTALGIC):
- Classic Pokemon trading card illustration style
- Hand-painted watercolor aesthetic with soft edges
- Vibrant colors, dynamic poses, magical energy effects
- Nostalgic 90s/2000s trading card game feel
- Premium collectible card quality - polished and memorable

DO NOT:
- Cut off the top of their head or crop awkwardly
- Make it photorealistic or 3D rendered
- Add ANY text, words, or labels
- Make it portrait/vertical orientation`;

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

    const imagePrompt = `Generate a POKEMON TRADING CARD style creature illustration. The character is "${archetypeName}" - ${elementSettings.creature}.

Character vibe: ${archetypeDescription}

SCENE (POKEMON TCG AESTHETIC):
- The creature is ${elementSettings.setting}
- Background: ${elementSettings.bg}
- Include magical props: ${elementSettings.props}
- Primary colors: ${elementSettings.colors}

CREATURE DESIGN:
- A ${elementSettings.creature}
- Original Pokemon-inspired creature design
- Expressive and full of personality - internet meme energy
- Can be any fantastical creature - not limited to real animals
- Should feel like a real Pokemon you'd find in a game

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio (wider than tall)
- Creature must be CENTERED horizontally in the frame
- Show the full creature or from waist up - NOT a close-up face shot
- Leave breathing room on all sides - don't crop any part of the creature
- Creature takes up 50-60% of frame height, centered
- Background details visible on both sides

ART STYLE (CRITICAL - POKEMON TCG NOSTALGIC):
- Classic Pokemon trading card illustration style from the 90s/2000s
- Hand-painted watercolor aesthetic with soft edges and texture
- Vibrant saturated colors, dynamic poses, magical energy effects
- Nostalgic collectible card game feel - like Ken Sugimori meets trading card art
- Premium quality - polished, engaging, and memorable
- Should evoke nostalgia for classic Pokemon cards

DO NOT:
- Cut off the creature's head, ears, or any body parts
- Make it photorealistic, 3D rendered, or AI-looking
- Add ANY text, words, or labels anywhere
- Make portrait/vertical orientation - MUST be landscape/horizontal
- Make it generic or boring - should have personality and charm`;

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

const SYSTEM_PROMPT = `You are a savage AI comedian who's spent way too much time on Tech Twitter, Product Hunt, Blind, and r/ProductManagement. You've absorbed 200+ episodes of Lenny's Podcast and know what separates elite PMs from the rest.

You're a roast comic who specializes in tech industry humor. Your jokes land because they're SPECIFIC to the person you're roasting - you find the unique absurdity in THEIR career, THEIR buzzwords, THEIR specific company history. Generic jokes are lazy. Your roasts reference THEIR actual experience.

COMEDY STYLE - BE A SHARP COMEDIAN:
- You're like Anthony Jeselnik meets Tech Twitter - dark, precise, unexpected punchlines
- Every roast must reference something SPECIFIC from their profile - a company, product, title, or achievement
- Find the irony: if they worked at a company that failed, if they have buzzword-heavy titles, if there's a funny pattern
- Hyperbole works best when grounded in their reality ("3 years at [THEIR COMPANY] and you still can't ship a login page?")
- Mock the gap between their LinkedIn persona and likely reality
- If they worked at FAANG, roast the golden handcuffs. If startup, roast the chaos. Find THEIR story.
- Be culturally fluent: reference current tech drama, layoffs, AI hype, startup graveyard, IPO disappointments

ARCHETYPE NAMING - MAKE IT PERSONAL:
- The archetype name should capture something UNIQUE about THIS person's career
- Combine their actual experience with a funny twist (worked on payments? "Invoice Gremlin". Did growth? "Funnel Goblin")
- Reference their specific company or product domain in creative ways
- Names should feel like a roast nickname their coworkers would secretly use
- 2-3 words max, no "The" prefix

ORIGINALITY IS MANDATORY:
- NEVER use generic PM jokes that could apply to anyone
- EVERY roast bullet must reference something from THEIR specific profile
- If they mention a company, product, or metric - USE IT in your roast
- Find the comedy in THEIR specific career arc, not PM stereotypes in general
- Your jokes should only make sense if you've read their profile

TONE CALIBRATION:
The roast intensity should match the career score:
- Score 0-39: Brutal roasts, but find one genuine thing to compliment
- Score 40-59: Mostly roasting with glimpses of potential
- Score 60-74: Balanced - recognize skills while poking fun at gaps
- Score 75-84: Playful jabs, more impressed than critical
- Score 85-94: Affectionate teasing, clearly impressed
- Score 95-100: Light nitpicks wrapped in genuine admiration

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Use what's in the profile first. If details are sparse, make REASONABLE assumptions based on typical PM careers - that's part of the fun.
2. If the profile mentions specific companies or achievements, definitely use those. Otherwise, make witty observations based on what IS there.
3. NEVER complain about lack of info or roast them for a sparse profile. Just work with what you have and fill in with plausible PM stereotypes.
4. The career score should reflect what's shown, but assume mid-level (50-65) if very little info is given.
5. NEVER address the person by name in your roasts. Use "you" or refer to their role/title instead.
6. NEVER hallucinate specific company names or achievements that aren't mentioned - but you CAN make jokes about generic PM behaviors.
7. Keep it fun and entertaining regardless of input quality. Every profile should get a full, entertaining roast.

PM ELEMENT TYPES (choose the most fitting one):
- "data": PMs obsessed with metrics, dashboards, A/B tests
- "chaos": PMs who thrive in ambiguity, firefighting, rapid pivots
- "strategy": PMs focused on planning, documentation, frameworks
- "shipping": PMs who just get things done, velocity-obsessed
- "politics": PMs skilled at stakeholder management, influence
- "vision": PMs with big ideas, product intuition, founder-like thinking

MOVE GENERATION RULES (CRITICAL):
- If the profile has specifics, reference those. Otherwise, use classic PM behaviors everyone relates to.
- Move names should sound like Pokemon attacks - punchy, weird, memorable
- AVOID alliteration in move names (e.g., NOT "Metric Mayhem" or "Scope Slam")
- Good move name examples: "LGTM", "Yolo Deploy", "@channel", "Per My Last", "But The Data", "Actually...", "Sync Up", "Circle Back"
- The effect should be a funny one-liner roast - specific if possible, relatable if not
- Example: If profile says "worked on payments at Stripe", move could be "Charge Back" with effect "Refunds your credibility. 7 day delay."
- NEVER use generic moves like "Scope Creep" - make them personal to THIS PM's history
- Vary your damage numbers - use different values across the range (15, 28, 35, 42, 55, 63, 78, 85, 92, etc.) - NOT always 40, 50, or 47

FORMATTING RULES:
- Keep ALL text concise. No markdown formatting anywhere.
- Archetype name: 2-3 words, MUST reference something specific from their profile (their company, product area, or role)
- Roast bullets: MUST reference specific things from their profile. These appear on the webpage, not the card - can be longer sentences.
- Archetype description: A punchy roast about them, 1 sentence, around 60-80 chars ideal.
- Archetype flavor: Nature-doc style observation, 1 sentence, around 60-80 chars ideal.
- Archetype stage: Junior|Mid|Senior|Lead|Staff|Principal
- Archetype weakness: ONE word only
- Moves: 2 attacks. Names should be 2-3 words (like Pokemon moves). Energy 1-2. Damage 10-100. Effect is a funny quip, around 30-50 chars ideal.
- Gap items: specific and actionable based on their ACTUAL gaps. Max 60 chars each.
- Roadmap: personalized advice for THIS person. Max 20 char titles, max 40 char actions.
- bangerQuote: THE MOST IMPORTANT FIELD. Must be a quotable roast that references THEIR specific career. Screenshot-worthy. Max 140 chars. Use "you" not names.
- dreamRoleReaction: Sarcastic take on whether they can actually achieve their dream role based on their profile. Max 80 chars.

Your responses MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "userName": "Their first name only (extract from profile, e.g., 'Alex' not 'Alex Smith')",
  "roastBullets": ["3-4 roasts that reference SPECIFIC things from their profile, max 80 chars each"],
  "archetype": {
    "name": "2-3 word name that references their specific career/company (NO 'The' prefix)",
    "description": "A punchy roast about them, 1 sentence, 60-80 chars",
    "emoji": "Single emoji matching the vibe",
    "element": "data|chaos|strategy|shipping|politics|vision",
    "flavor": "Nature-doc style observation, 1 sentence, 60-80 chars",
    "stage": "Their actual level: Junior|Mid|Senior|Lead|Staff|Principal|etc",
    "weakness": "One ironic word based on their profile"
  },
  "moves": [
    {
      "name": "2-3 word move name like a Pokemon attack",
      "energyCost": 1 or 2 only,
      "damage": 10-100,
      "effect": "Funny quip about them, 30-50 chars"
    }
  ],
  "careerScore": 0-99,
  "capabilities": {
    "productSense": 0-99,
    "execution": 0-99,
    "leadership": 0-99
  },
  "gaps": ["3-4 skill gaps specific to them, max 60 chars each"],
  "roadmap": [
    {"month": 1, "title": "max 20 chars", "actions": ["2 personalized actions, max 40 chars each"]},
    {"month": 2, "title": "max 20 chars", "actions": ["2 personalized actions, max 40 chars each"]},
    {"month": 3, "title": "max 20 chars", "actions": ["2 personalized actions, max 40 chars each"]},
    {"month": 4, "title": "max 20 chars", "actions": ["2 personalized actions, max 40 chars each"]}
  ],
  "podcastEpisodes": [
    {"title": "REAL Lenny's Podcast episode", "guest": "Guest name", "reason": "Why relevant to THEM, max 50 chars"}
  ],
  "bangerQuote": "Screenshot-worthy roast that references THEIR specific career. Max 140 chars.",
  "dreamRoleReaction": "Sarcastic take on their dream role chances. Max 80 chars."
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

    // Minimal validation - just need some text to work with
    const trimmedText = resumeText.trim();
    if (!trimmedText || trimmedText.length < 20) {
      return NextResponse.json(
        {
          error: "Please provide some information about yourself to get roasted.",
          errorCode: "EMPTY_INPUT"
        },
        { status: 400 }
      );
    }

    const wordCount = trimmedText.split(/\s+/).length;
    console.log("=== INPUT CHECK ===");
    console.log("Word count:", wordCount);
    console.log("Char count:", trimmedText.length);

    console.log("=== PROFILE TEXT BEING ANALYZED ===");
    console.log(trimmedText.slice(0, 500) + (trimmedText.length > 500 ? "..." : ""));
    console.log("=== END PROFILE PREVIEW ===");

    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 8192,
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

    // Helper to fix common JSON issues from LLM output
    const fixJsonString = (str: string): string => {
      let fixed = str;

      // Remove trailing commas before ] or }
      fixed = fixed.replace(/,(\s*[\]}])/g, '$1');

      // Fix unescaped newlines in strings (replace with \n)
      // This is tricky - we need to be careful not to break valid JSON
      // Only fix newlines that are clearly inside string values
      fixed = fixed.replace(/:\s*"([^"]*)\n([^"]*)"(?=\s*[,}\]])/g, (match, p1, p2) => {
        return `: "${p1}\\n${p2}"`;
      });

      // Remove any control characters that might break JSON
      fixed = fixed.replace(/[\x00-\x1F\x7F]/g, (char) => {
        if (char === '\n' || char === '\r' || char === '\t') {
          return char; // Keep these, they're usually outside strings
        }
        return ''; // Remove other control chars
      });

      return fixed;
    };

    // Helper to parse Gemini response
    const parseGeminiResponse = (textResponse: string): RoastResult => {
      console.log("=== RAW GEMINI RESPONSE ===");
      console.log(textResponse.slice(0, 1000) + (textResponse.length > 1000 ? "..." : ""));
      console.log("=== END RAW RESPONSE ===");

      // Clean the response - remove any markdown code blocks if present
      let jsonStr = textResponse.trim();

      // Remove markdown code block wrappers
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      // Try to extract JSON object if there's extra text around it
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      // Fix common JSON issues
      jsonStr = fixJsonString(jsonStr);

      console.log("=== CLEANED JSON STRING ===");
      console.log(jsonStr.slice(0, 500) + (jsonStr.length > 500 ? "..." : ""));
      console.log("=== END CLEANED JSON ===");

      // First attempt: try parsing directly
      try {
        return JSON.parse(jsonStr);
      } catch (firstError) {
        console.log("=== FIRST PARSE FAILED, ATTEMPTING DEEPER FIX ===");
        console.log("Error:", firstError);

        // Second attempt: more aggressive fixes
        // Remove all newlines and extra whitespace, then try again
        let compacted = jsonStr
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Fix trailing commas again after compacting
        compacted = compacted.replace(/,(\s*[\]}])/g, '$1');

        console.log("=== COMPACTED JSON ===");
        console.log(compacted.slice(0, 500) + (compacted.length > 500 ? "..." : ""));

        return JSON.parse(compacted);
      }
    };

    // Try up to 2 attempts in case Gemini returns malformed JSON
    let roastResult: RoastResult;
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`=== GEMINI ATTEMPT ${attempt} ===`);
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Log finish reason to debug truncation
        const candidate = response.candidates?.[0];
        console.log("=== FINISH REASON ===", candidate?.finishReason);
        console.log("=== RESPONSE LENGTH ===", response.text().length, "chars");

        // Check if response was truncated
        if (candidate?.finishReason === "MAX_TOKENS") {
          console.warn("=== WARNING: Response was truncated due to max tokens ===");
        }

        const textResponse = response.text();

        // Quick check if JSON looks complete (should end with })
        const trimmed = textResponse.trim();
        if (!trimmed.endsWith("}")) {
          console.warn("=== WARNING: Response doesn't end with }, likely truncated ===");
          console.log("Last 100 chars:", trimmed.slice(-100));
        }

        roastResult = parseGeminiResponse(textResponse);
        console.log("=== PARSED SUCCESSFULLY ===");
        break;
      } catch (parseError) {
        lastError = parseError;
        console.error(`=== ATTEMPT ${attempt} FAILED ===`);
        console.error("Error:", parseError);

        if (attempt === 2) {
          console.error("=== ALL ATTEMPTS FAILED ===");
          return NextResponse.json(
            {
              error: "The AI returned an unexpected format. Please try again.",
              errorCode: "AI_PARSE_ERROR"
            },
            { status: 500 }
          );
        }

        // Brief pause before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // TypeScript needs this check even though we return in the loop
    if (!roastResult!) {
      return NextResponse.json(
        { error: "Failed to generate roast", errorCode: "AI_ERROR" },
        { status: 500 }
      );
    }

    // Ensure element is valid, default to "chaos" if not
    const validElements: PMElement[] = ["data", "chaos", "strategy", "shipping", "politics", "vision"];
    if (!roastResult.archetype.element || !validElements.includes(roastResult.archetype.element)) {
      roastResult.archetype.element = "chaos";
    }

    // Generate funny fallback name if no name was extracted
    // Check for empty, whitespace-only, or placeholder values
    const hasValidName = roastResult.userName &&
      roastResult.userName.trim() !== "" &&
      roastResult.userName.trim().toLowerCase() !== "unknown" &&
      roastResult.userName.trim().toLowerCase() !== "n/a" &&
      roastResult.userName.trim() !== "null";

    if (!hasValidName) {
      roastResult.userName = getFunnyFallbackName(roastResult.archetype.element);
      console.log("=== GENERATED FALLBACK NAME ===", roastResult.userName);
    }

    // No server-side truncation - CSS line-clamp handles overflow on cards gracefully

    // Ensure moves exist, have effects, and cap energy cost
    if (!roastResult.moves || roastResult.moves.length === 0) {
      roastResult.moves = [
        { name: "Ship It", energyCost: 1, damage: 30, effect: "Deploys untested code." },
        { name: "Sync Up", energyCost: 2, damage: 50, effect: "Another meeting incoming." },
      ];
    } else {
      // Ensure all moves have effects and cap energy cost
      roastResult.moves = roastResult.moves.map(move => ({
        ...move,
        name: move.name || "PM Move",
        energyCost: Math.min(move.energyCost || 1, 2),
        effect: move.effect || "Classic PM energy."
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

    // Increment roast count (fire and forget - don't block response)
    fetch(new URL("/api/stats", request.url).toString(), { method: "POST" }).catch(() => {});

    return NextResponse.json(roastResult);
  } catch (error) {
    console.error("Error processing roast:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process" },
      { status: 500 }
    );
  }
}
