# pm-roast
upload your linkedin, get honest feedback

# 🎯 The Vibe
A high-end, minimalist "Linear-style" web app that acts as a brutally honest AI career coach. 
It uses the wisdom of 200+ world-class PMs (from Lenny’s Podcast transcripts) to "roast" a user's resume and provide a "Roadmap to the Top 1%."

Vibe: Witty, data-driven, slightly elitist, but actually insightful.

# 🛠 Feature List
1. The "Ego Check" (Input)
Resume/LinkedIn Upload: Users upload a PDF or paste their LinkedIn URL.

Context Selector: Users choose their "Dream Role" (e.g., "Founder," "CPO at a Series B," "L6 at Google"). Based on selection generate an honest reaction, i.e. "seriously, that's your dream?".

2. The "Lenny Roast" (Analysis)
Transcript RAG: AI scans the Lenny Transcripts to find relevant guest advice.

Roast: Generate 3-4 biting but accurate bullet points about the user’s career.

Example: "You’ve spent 3 years at a 'Feature Factory.' Brian Chesky would say you’re a project manager, not a product person."

The "Archetype" Assignment: Assigns the user a persona like "The Safe-Bet Specialist," "The Growth Hacker (In Denial)," or "The Loom Video CEO." Generate a linkedin-style cringe image to represent the archetype assigned as a badge of shame.

3. The "Top 1% Roadmap" (Output)
The Gap Analysis: Shows exactly what’s missing (e.g., "Lack of zero-to-one experience").

The 6-Month Plan: A tactical, month-by-month roadmap to fix their career.

Curated Playlists: Links to 3 specific Lenny’s Podcast episodes based on their weaknesses.

4. The "Viral Loop" (Share to X)
The "PM Card": Generates a beautiful, shareable PNG/SVG card (similar to FIFA cards) containing:

The user's profile picture from LinkedIn - if available.

The User's Archetype.

One "Banger" quote from the roast.

A "Career Score" (0-100) based on "Lenny’s Frameworks."

One-Click Post: A "Share to X" button with a pre-written viral thread starter tagging @lennysan and @[GuestName].

# 🏗 Technical Requirements
Frontend
Framework: Next.js (App Router), Tailwind CSS, Shadcn/UI.

Animations: Framer Motion (for that "high-end" feel during the "scanning" phase).

Image Generation: Use satori or html-to-image to generate the shareable "PM Card."

Backend/AI
Model: Claude 3.7 Sonnet (best for vibecoding and nuance).

Data Source: Use the .txt or .json transcripts from the GitHub repo as a knowledge base.

System Prompt: "You are Lenny Rachitsky's AI twin. You have read every transcript. You are helpful but don't pull punches. You hate fluff like 'stakeholder management' and love 'impact,' 'product taste,' and 'rigor.'"

# 🎨 Design System
Background: Dark mode (#09090b).

Accent: "Lenny Yellow" (#FFD700) or "Product Green."

Font: Geist Sans or Inter.

Components: Minimalist cards with subtle borders and "glowing" hover effects.

# 🚀 The "Viral" Prompt (Use this for the X Flow)
"Just got roasted by PM AI. Apparently, I’m a 'Middle-Manager Generalist' with a 42% chance of making CPO. 💀

I got a 6-month roadmap to fix it. Build your own here: [YourURL]"
