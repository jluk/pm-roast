import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { RoastResult, DreamRole, DREAM_ROLES, PMElement } from "@/lib/types";
import { storeCard } from "@/lib/card-storage";
import { ELEMENT_SETTINGS } from "@/lib/image-generation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Dynamic import for pdf-parse (CommonJS module)
async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  return pdfParse(buffer);
}

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

// Funny office scenarios for each element type
const FUNNY_SCENARIOS: Record<PMElement, string[]> = {
  data: [
    "frantically pointing at a holographic dashboard showing impossible metrics while coffee spills everywhere",
    "surrounded by floating pie charts and bar graphs, looking confused at one that clearly doesn't add up",
    "presenting to invisible stakeholders with a laser pointer, charts literally exploding with data",
    "buried under a mountain of spreadsheets, only their face visible, still smiling maniacally",
    "riding a giant bar chart like a surfboard through a sea of numbers",
  ],
  chaos: [
    "juggling flaming laptops while standing on a spinning office chair",
    "conducting an orchestra of panicking coworkers with a coffee mug as a baton",
    "surrounded by sticky notes forming a tornado, looking completely zen",
    "putting out multiple small fires (literally) while casually sipping coffee",
    "skateboarding through a collapsing Jira board, giving a thumbs up",
  ],
  strategy: [
    "playing 4D chess against themselves while a whiteboard full of frameworks looms behind them",
    "building an elaborate house of cards labeled 'Q3 Roadmap' with intense focus",
    "meditating in front of a massive flowchart that connects to everything including the coffee machine",
    "drawing on a whiteboard that extends infinitely in all directions",
    "arranging miniature people on a strategy board like a benevolent (or malevolent) deity",
  ],
  shipping: [
    "literally pushing a giant 'SHIP IT' button while everything around them is on fire",
    "riding a rocket-powered shopping cart through a warehouse of features",
    "arm-wrestling a giant bug while deployment scripts run in the background",
    "crossing a finish line tape while dragging an entire product behind them",
    "speedrunning through a maze of code reviews with a stopwatch",
  ],
  politics: [
    "shaking hands with everyone in a circle simultaneously like a many-armed deity",
    "playing poker with stakeholders, holding cards that just say 'ALIGNMENT'",
    "navigating a literal maze of org charts with a compass and torch",
    "puppet-mastering a meeting room full of action figures in suits",
    "balancing on a tightrope between two angry emoji-faced executives",
  ],
  vision: [
    "standing on a mountain peak, pointing at a glowing 'FUTURE' that nobody else can see",
    "painting the sky with a giant brush while standing on clouds",
    "wearing VR goggles and gesturing wildly at things only they can see",
    "gazing into a crystal ball that shows a roadmap stretching to infinity",
    "surfing on a wave of lightbulbs, each one a different 'brilliant idea'",
  ],
};

// Generate archetype image using Gemini - with profile photo if available
async function generateArchetypeImage(
  archetypeName: string,
  archetypeDescription: string,
  emoji: string,
  element: PMElement,
  profilePicUrl?: string | null,
  profileImageBase64?: { data: string; mimeType: string } | null,
  context?: {
    userName?: string;
    weakness?: string;
    stage?: string;
    moveName?: string;
    dreamRole?: string;
    company?: string;
  }
): Promise<string | null> {
  try {
    const elementSettings = ELEMENT_SETTINGS[element];

    // Pick a random funny scenario for this element
    const scenarios = FUNNY_SCENARIOS[element];
    const funnyScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    // Build personalized details string
    const personalDetails: string[] = [];
    if (context?.company) personalDetails.push(`works at ${context.company}`);
    if (context?.stage) personalDetails.push(`${context.stage}-level energy`);
    if (context?.weakness) personalDetails.push(`clearly afraid of "${context.weakness}"`);
    if (context?.dreamRole) personalDetails.push(`dreams of being ${context.dreamRole}`);

    const personalContext = personalDetails.length > 0
      ? `\n\nPERSONAL DETAILS TO INCORPORATE:\n- ${personalDetails.join('\n- ')}`
      : '';

    // If we have a profile photo (either uploaded directly or from URL), use it for personalized generation
    let profileImage: { data: string; mimeType: string } | null = profileImageBase64 || null;

    // If no direct upload but we have a URL, fetch it
    if (!profileImage && profilePicUrl) {
      console.log("=== FETCHING PROFILE IMAGE FROM URL ===");
      console.log("Profile URL:", profilePicUrl);
      profileImage = await fetchImageAsBase64(profilePicUrl);
    }

    if (profileImage) {
      console.log("=== GENERATING PERSONALIZED IMAGE FROM PROFILE PHOTO ===");
      console.log("Profile image source:", profileImageBase64 ? "direct upload" : "URL fetch");
      console.log("Profile image size:", profileImage.data.length);

      const personalizedPrompt = `Create a FUNNY illustration of THIS EXACT PERSON as "${archetypeName}" in a hilarious situation.

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- AI-generated text always looks wrong - avoid it completely

CRITICAL - PRESERVE THE PERSON'S LIKENESS:
- This is THE MOST IMPORTANT requirement - the output MUST look like this specific person
- Copy their EXACT face: same eyes, nose, mouth, face shape, skin tone, hair color, hairstyle
- The person in the output should be IMMEDIATELY RECOGNIZABLE as the person in the input photo
- Study every facial detail in the input and replicate it faithfully
- If they have glasses, facial hair, distinctive features - KEEP THEM
- Think of this as drawing a caricature portrait - exaggerate for humor but preserve identity

THE FUNNY SITUATION:
Place this person in this comedic scene: ${funnyScenario}

Their character: ${archetypeDescription}
${personalContext}

CREATIVE HUMOR (while keeping their likeness):
- Show THEIR face reacting to absurd PM/tech situations
- Exaggerated expressions are great: stress, panic, manic joy, existential dread, fake confidence
- Put them in ridiculous but relatable work scenarios
- Props and environment create the joke, their recognizable face sells it
- The humor comes from "that's definitely [person] dealing with [absurd situation]"

ART STYLE:
- Illustrated/painted style (NOT photorealistic, NOT abstract)
- Vibrant, colorful, fun - like a premium trading card illustration
- Colors: ${elementSettings.colors}
- Background setting: ${elementSettings.bg}
- Clear, focused composition - not busy or chaotic
- The person should be the obvious subject, not lost in effects

COMPOSITION:
- Person prominently featured, face clearly visible and LARGE
- Upper body or head/shoulders framing
- Front-facing or 3/4 view (never profile or from behind)
- ${elementSettings.props}
- LANDSCAPE 16:9 aspect ratio

CRITICAL - THIS IS AN ILLUSTRATION, NOT A CARD:
- Generate ONLY the artwork/illustration - NOT a complete trading card
- Do NOT add any card borders, frames, rounded corners, or card-like elements
- Do NOT make it look like a Pokemon card, trading card, or any card format
- The output should be a clean illustration that fills the entire frame
- No decorative borders or card UI elements

ABSOLUTELY DO NOT:
- Create abstract art, surreal imagery, or unrecognizable outputs
- Change the person's fundamental appearance or make them generic
- Obscure, shrink, or hide the face
- Make the face small or distant in the frame
- Generate ANY text, words, letters, numbers, signs, labels, or writing (AI text always looks wrong)
- Create photorealistic renders
- Make the person unidentifiable
- Add card borders, frames, or make it look like a trading card`;

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

    // Fallback: Generate Pokemon-style creature without profile photo
    console.log("=== GENERATING POKEMON-STYLE CREATURE IMAGE ===");

    const imagePrompt = `Generate a HILARIOUS Pokemon trading card style creature illustration. The character is "${archetypeName}" - a ${elementSettings.creature}.

THE SCENE (MAKE IT FUNNY):
Show the creature ${funnyScenario}

Character vibe: ${archetypeDescription}
${personalContext}

HUMOR IS MANDATORY:
- This creature should be doing something RELATABLE and FUNNY
- Expressions: stressed, confused, manic confidence, or existential dread
- Absurd office/tech situations that make people laugh
- Props: laptops, coffee cups, sticky notes, whiteboards, Jira boards
- Think: Pokemon meets corporate satire

CREATURE DESIGN:
- Original Pokemon-inspired creature (${elementSettings.creature})
- Anthropomorphized enough to do office activities
- Expressive face showing the chaos of PM life
- Can hold objects, gesture, have human-like reactions
- Should feel like a REAL Pokemon doing REAL PM work

POKEMON TCG AESTHETIC:
- Classic 90s/2000s Pokemon card illustration style
- Hand-painted watercolor look
- Vibrant colors: ${elementSettings.colors}
- Background: ${elementSettings.bg}
- Magical energy effects
- Premium collectible quality

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE 16:9 aspect ratio
- Full scene visible - show the funny situation
- Creature centered but room for comedic props
- Don't crop the creature or important elements

CRITICAL - NO TEXT:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing
- AI-generated text always looks wrong - avoid it completely

CRITICAL - THIS IS AN ILLUSTRATION, NOT A CARD:
- Generate ONLY the artwork/illustration - NOT a complete trading card
- Do NOT add any card borders, frames, rounded corners, or card-like elements
- Do NOT make it look like a Pokemon card format with borders
- Fill the entire frame with the scene - no decorative card UI

DO NOT:
- Make it boring, generic, or just standing there
- Cut off the creature or comedic elements
- Make it photorealistic or 3D rendered
- Generate any text, words, labels, or writing of any kind
- Make it portrait orientation
- Add card borders, frames, or trading card elements`;

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

// Dream role requirements - what it takes to reach each role
const DREAM_ROLE_REQUIREMENTS: Record<DreamRole, { skills: string[]; experience: string; redFlags: string[]; greenFlags: string[] }> = {
  founder: {
    skills: ["0-to-1 product building", "fundraising/pitching", "team building", "market intuition", "resilience", "wearing multiple hats"],
    experience: "Prior startup experience, shipped products from scratch, comfortable with extreme ambiguity and risk",
    redFlags: ["Only big company experience", "Never shipped a 0-to-1 product", "Risk-averse career moves", "No side projects"],
    greenFlags: ["Previous founder experience", "Built products from scratch", "Entrepreneurial side projects", "Comfortable with failure"]
  },
  "vp-product": {
    skills: ["Org building", "executive communication", "cross-functional leadership", "strategy at scale", "hiring/mentoring PMs", "board-level storytelling"],
    experience: "Led multiple PM teams (10+), shipped products at scale (millions of users), managed managers, influenced company strategy",
    redFlags: ["Never managed managers", "No experience at scale", "Only IC work", "Haven't built PM teams"],
    greenFlags: ["Built PM orgs from scratch", "Led cross-company initiatives", "Experience at multiple stages", "Track record of developing PMs"]
  },
  cpo: {
    skills: ["Company-wide product vision", "board communication", "P&L ownership", "market positioning", "M&A product strategy", "building world-class PM orgs"],
    experience: "VP-level experience, owned significant business outcomes ($100M+), reported to CEO, shaped company direction",
    redFlags: ["No VP experience", "Never owned P&L", "No board exposure", "Limited strategic scope"],
    greenFlags: ["VP of Product experience", "Owned major revenue lines", "CEO-level relationship", "Industry thought leadership"]
  },
  "director-faang": {
    skills: ["Technical depth", "stakeholder management at scale", "navigating big company politics", "L6→L7 performance narratives", "cross-org influence"],
    experience: "Staff PM or Senior PM at top-tier company, owned major product areas, navigated promo process, influenced cross-functional teams",
    redFlags: ["No big tech experience", "Only small company scope", "Lacks technical depth", "Poor at internal politics"],
    greenFlags: ["Current Staff PM at big tech", "Led major launches", "Strong promo narrative", "Cross-org influence"]
  },
  "staff-faang": {
    skills: ["Technical excellence", "IC leadership", "driving alignment without authority", "strong PM fundamentals", "deep domain expertise"],
    experience: "Senior PM with strong track record, demonstrated IC impact at scale, owned significant features/products",
    redFlags: ["Junior PM experience only", "No measurable impact", "Weak technical skills", "Poor cross-functional collaboration"],
    greenFlags: ["Senior PM at good companies", "Clear impact metrics", "Technical credibility", "Strong IC brand"]
  },
  "senior-pm": {
    skills: ["PM fundamentals", "stakeholder management", "data-driven decisions", "shipping consistently", "user research basics"],
    experience: "2-4 years PM experience, owned features end-to-end, worked with eng/design, shipped multiple times",
    redFlags: ["Brand new to PM", "Never shipped anything", "No cross-functional experience", "Lacks PM vocabulary"],
    greenFlags: ["Shipped multiple features", "Clear PM growth trajectory", "Good stakeholder feedback", "Data literacy"]
  },
  vc: {
    skills: ["Pattern recognition across startups", "market analysis", "founder evaluation", "network building", "deal sourcing", "portfolio support"],
    experience: "Operating experience at successful startups, strong network, track record of good judgment calls, content/thought leadership",
    redFlags: ["No operating experience", "Weak network", "No content presence", "Never evaluated startups"],
    greenFlags: ["Successful operator background", "Strong founder network", "Visible thought leadership", "Angel investing experience"]
  },
  "cult-leader": {
    skills: ["Content creation", "personal branding", "community building", "hot takes that land", "consistent publishing", "engagement farming"],
    experience: "Built audience in some capacity, unique POV, content that resonates, willingness to be public",
    redFlags: ["No content presence", "Generic takes", "Shy about self-promotion", "No unique angle"],
    greenFlags: ["Growing audience", "Viral content history", "Unique perspective", "Consistent publishing cadence"]
  }
};

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
- Score 0-29: Absolutely brutal. They clearly wandered into PM by accident.
- Score 30-49: Harsh roasts with a glimmer of hope. Maybe they'll figure it out.
- Score 50-64: The vast majority of PMs live here. Competent but nothing special.
- Score 65-79: Actually impressive. They've shipped real things that matter.
- Score 80-89: Elite tier. Reserved for proven leaders with multiple successes.
- Score 90-99: EXCEPTIONAL. Almost never give this. Requires: shipped iconic products, led 50+ person orgs, or measurably changed an industry.

SCORING GUIDELINES (BE RIGOROUS - 90+ IS NEARLY IMPOSSIBLE):
- Entry-level/Associate PM: 25-40
- Generic PM at unknown company: 35-50
- PM at a decent startup: 40-55
- PM at FAANG (just being there isn't impressive): 45-60
- Senior PM with some shipped products: 50-65
- Lead/Principal PM with notable launches: 60-75
- Director/VP who's built real teams: 65-80
- Executive who's scaled products to millions: 75-88
- Only score 90+ if they: founded a unicorn, shipped a product used by 100M+ people, or are literally a PM legend (Shreyas Doshi, Marty Cagan tier)

The default score for an average PM should be 45-55. Most people are average. Be honest about it.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Work with whatever info you have - even just a name and headline is ENOUGH. Make reasonable assumptions based on the company/role mentioned.
2. If they mention Google, roast Big Tech PM life. If they mention a startup, roast startup chaos. If they just have a title, roast that title's typical behaviors.
3. ABSOLUTELY NEVER mention, reference, or joke about having limited info or a sparse profile. This is the #1 rule. Treat every profile as if it's complete.
4. If details are sparse, lean into universal PM stereotypes that match their level/company type. Everyone can relate to these.
5. BE HARSH WITH SCORES. Most PMs are mediocre. That's okay. It's funnier if you're honest about it.
6. NEVER address the person by name in your roasts. Use "you" or refer to their role/title instead.
7. You CAN reference the specific companies/titles that ARE mentioned, and you CAN make jokes about typical behaviors for that type of PM.
8. Every profile MUST get a full, entertaining, complete roast. No exceptions. No complaints. Just roast what's there creatively.

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

DREAM ROLE GAP ANALYSIS (CRITICAL - THIS IS THE CORE OF YOUR ROAST):
- You will be told their dream role. Your ENTIRE analysis should be framed around the gap between where they are NOW and what that dream role REQUIRES.
- The gaps should be the specific skills/experience they're MISSING to reach their dream role, not generic PM gaps.
- The roadmap should be a realistic path to close that gap - what they actually need to DO to get there.
- At least 1-2 roast bullets should mock the mismatch between their aspiration and their current profile.
- The bangerQuote should often reference their dream role delusion or the gap they need to close.
- dreamRoleReaction is your sarcastic verdict on their chances - be brutally honest about the gap.

FORMATTING RULES:
- Keep ALL text concise. No markdown formatting anywhere.
- Archetype name: 2-3 words, MUST reference something specific from their profile (their company, product area, or role)
- Roast bullets: MUST reference specific things from their profile. At least 1-2 should roast their dream role gap/delusion. These appear on the webpage, not the card - can be longer sentences.
- Archetype description: A punchy roast about them, 1 sentence, around 60-80 chars ideal.
- Archetype flavor: Nature-doc style observation, 1 sentence, around 60-80 chars ideal.
- Archetype stage: Junior|Mid|Senior|Lead|Staff|Principal
- Archetype weakness: 1-2 words MAXIMUM (e.g., "Meetings", "Ship Dates", "Excel", "User Research", "Deadlines"). Keep it punchy and ironic.
- Moves: 2 attacks. Names should be 2-3 words (like Pokemon moves). Energy 1-2. Damage 10-100. Effect is a funny quip, around 30-50 chars ideal.
- Gap items: MUST be skills/experience they need FOR THEIR SPECIFIC DREAM ROLE, not generic PM gaps. Be specific about what the dream role requires that they're missing. Max 60 chars each.
- Roadmap: A 4-month plan specifically designed to move them TOWARD THEIR DREAM ROLE. Each month should address a specific gap between current state and dream role requirements. Max 20 char titles, max 40 char actions.
- bangerQuote: THE MOST IMPORTANT FIELD. Must be a quotable roast that references THEIR specific career AND ideally their dream role gap. Screenshot-worthy. Max 140 chars. Use "you" not names.
- dreamRoleReaction: Sarcastic verdict on their dream role chances. Reference specific gaps. Be brutally honest. Max 80 chars.
- naturalRival: Their arch-nemesis - the person or concept that strikes fear in their PM heart. Should be funny and specific to their archetype/element. Examples: "An Engineer with a valid technical concern", "A designer with an opinion", "A 4:45 PM Friday bug report", "A stakeholder who actually read the PRD". Max 60 chars.

Your responses MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "userName": "Their first name only extracted from profile (just first name, not full name). Leave empty string if not found.",
  "roastBullets": ["3-4 roasts, at least 1-2 MUST mock the gap between their current state and dream role aspirations, max 80 chars each"],
  "archetype": {
    "name": "2-3 word name that references their specific career/company (NO 'The' prefix)",
    "description": "A punchy roast about them, 1 sentence, 60-80 chars",
    "emoji": "Single emoji matching the vibe",
    "element": "data|chaos|strategy|shipping|politics|vision",
    "flavor": "Nature-doc style observation, 1 sentence, 60-80 chars",
    "stage": "Their actual level: Junior|Mid|Senior|Lead|Staff|Principal|etc",
    "weakness": "1-2 word ironic weakness (max 2 words, e.g., 'Meetings', 'Ship Dates', 'Excel')"
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
  "gaps": ["3-4 SPECIFIC skills/experience they're MISSING to reach their DREAM ROLE (not generic PM gaps), max 60 chars each"],
  "roadmap": [
    {"month": 1, "title": "max 20 chars", "actions": ["2 actions specifically to close gap to DREAM ROLE, max 40 chars each"]},
    {"month": 2, "title": "max 20 chars", "actions": ["2 actions specifically to close gap to DREAM ROLE, max 40 chars each"]},
    {"month": 3, "title": "max 20 chars", "actions": ["2 actions specifically to close gap to DREAM ROLE, max 40 chars each"]},
    {"month": 4, "title": "max 20 chars", "actions": ["2 actions specifically to close gap to DREAM ROLE, max 40 chars each"]}
  ],
  "podcastEpisodes": [
    {"title": "REAL episode title from Lenny's Podcast YouTube channel", "guest": "Actual guest name from that episode", "reason": "Why relevant to THEIR path to DREAM ROLE, max 50 chars"}
  ],
  IMPORTANT FOR podcastEpisodes: ONLY recommend episodes that ACTUALLY EXIST on Lenny's Podcast YouTube channel (@LennysPodcast). Use real episode titles and real guest names. Popular guests include: Shreyas Doshi, Shishir Mehrotra, Marty Cagan, Gibson Biddle, Julie Zhuo, Lenny Rachitsky interviews, etc. If you cannot think of a real relevant episode, use {"title": "Browse Lenny's Podcast", "guest": "Various PM Leaders", "reason": "Explore episodes on product, growth, and career advice"}.
  "bangerQuote": "Screenshot-worthy roast, ideally referencing gap between current state and dream role. Max 140 chars.",
  "dreamRoleReaction": "Brutally honest verdict on their dream role chances given the gap. Reference what's missing. Max 80 chars.",
  "naturalRival": "Their arch-nemesis - funny person/concept they fear. Max 60 chars."
}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const profileText = formData.get("profileText") as string | null;
    const profilePicUrl = formData.get("profilePicUrl") as string | null;
    const profileImage = formData.get("profileImage") as File | null;
    const dreamRole = formData.get("dreamRole") as DreamRole;

    if (!dreamRole || !DREAM_ROLES[dreamRole]) {
      return NextResponse.json({ error: "Invalid dream role" }, { status: 400 });
    }

    // Convert uploaded profile image to base64 if provided
    let profileImageBase64: { data: string; mimeType: string } | null = null;
    if (profileImage) {
      console.log("=== PROCESSING UPLOADED PROFILE IMAGE ===");
      console.log("Image name:", profileImage.name);
      console.log("Image type:", profileImage.type);
      console.log("Image size:", profileImage.size);

      const imageBuffer = await profileImage.arrayBuffer();
      const base64Data = Buffer.from(imageBuffer).toString("base64");
      profileImageBase64 = {
        data: base64Data,
        mimeType: profileImage.type || "image/jpeg",
      };
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

    const roleReqs = DREAM_ROLE_REQUIREMENTS[dreamRole];

    const prompt = `${SYSTEM_PROMPT}

Analyze the following PM's profile/resume and provide a brutally honest roast.

=== THEIR DREAM ROLE ===
Dream Role: ${DREAM_ROLES[dreamRole].label} (${DREAM_ROLES[dreamRole].description})

What this role REQUIRES:
- Key skills needed: ${roleReqs.skills.join(", ")}
- Experience bar: ${roleReqs.experience}
- Red flags for this role: ${roleReqs.redFlags.join(", ")}
- Green flags for this role: ${roleReqs.greenFlags.join(", ")}

Your job is to analyze the GAP between their current profile and these requirements. The roast, gaps, and roadmap should ALL be framed around this specific dream role.
=== END DREAM ROLE ===

IMPORTANT: Use what's provided below. If the profile is sparse, make creative assumptions based on the company/title mentioned - that's half the fun.

=== START OF PROFILE ===
${resumeText}
=== END OF PROFILE ===

ANALYSIS INSTRUCTIONS:
1. Compare their profile to the dream role requirements above
2. Identify which red flags likely apply and which green flags they might be missing
3. Your gaps should be realistic for someone at their apparent level targeting their dream role
4. Your roadmap should be actionable steps to close the gap to that specific dream role
5. At least 1-2 roast bullets should mock the gap between their aspiration and reality
6. The dreamRoleReaction should be a brutally honest take on their chances

CRITICAL: Generate a COMPLETE, ENTERTAINING roast regardless of how much info is provided.
- If they're at Google, roast Big Tech PM life and golden handcuffs
- If they're at a startup, roast the chaos and "we're a family" culture
- If they're a founder, roast the hustle culture and "disruption"
- If they're famous (like Reid Hoffman), roast their public persona and empire
- Reference their actual company/title, then fill in with typical behaviors for that archetype

Never mention having limited info. Just roast confidently based on what IS there.

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

    // Ensure naturalRival exists
    if (!roastResult.naturalRival) {
      roastResult.naturalRival = "An engineer with a valid technical concern";
    }

    // Extract company from resume text for image personalization
    const companyMatch = resumeText.match(/(?:at|@)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\n|,|\.|$)/);
    const extractedCompany = companyMatch ? companyMatch[1].trim() : undefined;

    // Generate archetype image with elemental background (personalized if we have profile photo)
    console.log("=== GENERATING ARCHETYPE IMAGE ===");
    console.log("Profile pic URL:", profilePicUrl || "not provided");
    console.log("Profile image uploaded:", profileImageBase64 ? "yes" : "no");
    console.log("Context - Company:", extractedCompany, "Stage:", roastResult.archetype.stage, "Weakness:", roastResult.archetype.weakness);

    const archetypeImage = await generateArchetypeImage(
      roastResult.archetype.name,
      roastResult.archetype.description,
      roastResult.archetype.emoji,
      roastResult.archetype.element,
      profilePicUrl,
      profileImageBase64,
      {
        userName: roastResult.userName,
        weakness: roastResult.archetype.weakness,
        stage: roastResult.archetype.stage,
        moveName: roastResult.moves?.[0]?.name,
        dreamRole: DREAM_ROLES[dreamRole]?.label,
        company: extractedCompany,
      }
    );

    if (archetypeImage) {
      roastResult.archetypeImage = archetypeImage;
      console.log("=== IMAGE GENERATED SUCCESSFULLY ===");
    } else {
      console.log("=== IMAGE GENERATION SKIPPED/FAILED ===");
    }

    // Store the card in KV and get a permanent ID
    let cardId: string | null = null;
    try {
      cardId = await storeCard(roastResult, dreamRole);
      console.log("=== CARD STORED WITH ID:", cardId, "===");
    } catch (error) {
      // Log detailed error for monitoring - storage full or quota exceeded
      console.error("=== STORAGE FAILED ===");
      console.error("Error:", error instanceof Error ? error.message : error);
      console.error("This may indicate Upstash storage is full. Falling back to encoded URL sharing.");
      // Continue without cardId - fallback to encoded URL sharing
      // The roast still works, user just gets a longer URL
    }

    // Generate OG image in background (fire and forget - don't block response)
    if (cardId) {
      fetch(new URL("/api/og-generate", request.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          score: roastResult.careerScore,
          archetypeName: roastResult.archetype.name,
          archetypeImage: roastResult.archetypeImage,
          element: roastResult.archetype.element,
          userName: roastResult.userName,
          emoji: roastResult.archetype.emoji,
          description: roastResult.archetype.description,
          moves: roastResult.moves,
          stage: roastResult.archetype.stage,
          weakness: roastResult.archetype.weakness,
        }),
      }).catch((err) => console.error("OG generation failed:", err));
    }

    // Increment roast count (fire and forget - don't block response)
    fetch(new URL("/api/stats", request.url).toString(), { method: "POST" }).catch(() => {});

    return NextResponse.json({ ...roastResult, cardId });
  } catch (error) {
    console.error("Error processing roast:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process" },
      { status: 500 }
    );
  }
}
