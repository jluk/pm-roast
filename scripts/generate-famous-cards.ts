/**
 * Script to generate AI-stylized card images for Mt. Roastmore famous people
 * Run with: npx tsx scripts/generate-famous-cards.ts
 * Run specific cards: npx tsx scripts/generate-famous-cards.ts paul-graham marc-andreessen
 *
 * This transforms the professional headshots into Pokemon TCG-style card art.
 *
 * Requires GEMINI_API_KEY environment variable (loaded from .env.local)
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Famous people card definitions with creative scene-based prompts
const FAMOUS_CARDS = [
  // === ORIGINAL CARDS ===
  {
    id: "brian-chesky",
    name: "Brian Chesky",
    sourceImage: "brian.jpeg",
    outputImage: "brian-card.png",
    archetypeName: "The Design Dictator",
    element: "vision",
    creativeScene: `This person as a mad artist king sitting on a throne made entirely of Pantone color swatches and typography specimens. They're holding a royal scepter topped with a golden Figma cursor, wearing a crown of pixel-perfect kerning. Around them, tiny servants present font samples while they dramatically reject each one with a dismissive wave. The throne room is an impossibly perfect Airbnb listing with floating "belonging" text banners. Their expression is one of intense creative judgment - like they're about to fire someone over a 1px misalignment.`,
  },
  {
    id: "demis-hassabis",
    name: "Demis Hassabis",
    sourceImage: "demis.jpeg",
    outputImage: "demis-card.png",
    archetypeName: "The Galaxy Brain",
    element: "data",
    creativeScene: `This person as a wizard-scientist hybrid playing 4D chess against multiple AI holograms simultaneously. Their head is slightly enlarged (comically big brain energy) with visible neural network patterns glowing beneath the skin. They're casually solving a Rubik's cube, a Go board, AND protein folding diagrams all at once with multiple floating hands. A Nobel Prize medal hangs around their neck like it's no big deal. Background is a cosmic laboratory where equations float like constellations. Their expression is serene superiority - like explaining quantum physics to a toddler.`,
  },
  {
    id: "lenny-rachitsky",
    name: "Lenny Rachitsky",
    sourceImage: "lenny.jpeg",
    outputImage: "lenny-card.png",
    archetypeName: "The PM Whisperer",
    element: "strategy",
    creativeScene: `This person as a mystical podcast shaman sitting cross-legged on a floating podcast microphone, surrounded by a congregation of eager product managers taking notes. They're pulling glowing "frameworks" and "best practices" out of thin air like a magician, each one labeled with buzzwords. A massive newsletter scroll unfurls behind them into infinity. Ghostly figures of famous PMs they've interviewed float in the background like patron saints. Their expression is knowing and slightly smug - the look of someone who figured out the real product is the content.`,
  },
  {
    id: "reid-hoffman",
    name: "Reid Hoffman",
    sourceImage: "reid.jpeg",
    outputImage: "reid-card.png",
    archetypeName: "The Network Node",
    element: "politics",
    creativeScene: `This person as a giant spider-human hybrid sitting at the center of an enormous glowing web made of LinkedIn connection lines. Each strand connects to a tiny floating profile picture. They're simultaneously typing "Agree?" on multiple floating keyboards while money rains down. Their multiple spider arms are each doing different things: writing a book, making an investment, posting motivational content, and shaking hands. The web spans across the entire tech industry skyline. Their expression is that of a benevolent puppetmaster who knows everyone's career secrets.`,
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    sourceImage: "elon.jpg",
    outputImage: "elon-card.png",
    archetypeName: "The Chaos Emperor",
    element: "chaos",
    creativeScene: `This person as a manic emperor riding a flaming Tesla Cybertruck through space, one hand tweeting on a phone at 3am, the other steering toward Mars. They're wearing a SpaceX spacesuit with an X logo crown. Behind them, Twitter/X headquarters is literally on fire (they seem unbothered). Rockets launch in every direction, some successful, some crashing spectacularly. A pile of $44 billion in cash burns nearby. Their expression is unhinged genius energy - sleep-deprived but absolutely certain they're saving humanity.`,
  },
  {
    id: "mark-zuckerberg",
    name: "Mark Zuckerberg",
    sourceImage: "mark.jpeg",
    outputImage: "mark-card.png",
    archetypeName: "The Metaverse Missionary",
    element: "data",
    creativeScene: `This person's face mounted on a friendly but uncanny octopus-robot hybrid creature with multiple mechanical tentacles, each holding different things: a VR headset, a "privacy policy" scroll, a glass of water (drinking it robotically), data collection devices. The creature sits in a virtual metaverse throne room that looks like a low-poly video game from 2005. Floating Wii-style avatars bow before them. One tentacle is practicing MMA moves. Their face has that signature slightly-too-intense smile that doesn't quite reach the eyes - technically human but something's off.`,
  },
  {
    id: "dario-amodei",
    name: "Dario Amodei",
    sourceImage: "dario.jpg",
    outputImage: "dario-card.png",
    archetypeName: "The Safety Sage",
    element: "strategy",
    creativeScene: `This person as a worried professor-monk in a temple laboratory, simultaneously building an incredibly powerful glowing AI orb while also wrapping it in caution tape and safety warnings. They're writing a 50-page safety document with one hand while the AI grows more powerful with the other. Behind them, a chart shows "AI Capability" and "Existential Risk" both going up. Their expression is that of someone who's seen the equations and knows exactly how this ends, but keeps building anyway. A small "Claude" name tag on the AI orb.`,
  },
  {
    id: "jack-dorsey",
    name: "Jack Dorsey",
    sourceImage: "jack.png",
    outputImage: "jack-card.png",
    archetypeName: "The Zen Billionaire",
    element: "vision",
    creativeScene: `This person (with their distinctive long beard) meditating peacefully on a floating Bitcoin while Twitter burns in the background. They're doing an ice bath and intermittent fasting simultaneously - looking emaciated but enlightened. Multiple platforms they've neglected orbit around them like abandoned satellites. An edit button floats just out of reach, glowing and forbidden. Barefoot, wearing simple robes, surrounded by expensive biohacking equipment. Their expression is complete zen detachment - the platforms may burn but inner peace is achieved.`,
  },
  {
    id: "nikita-bier",
    name: "Nikita Bier",
    sourceImage: "nikita.jpg",
    outputImage: "nikita-card.png",
    archetypeName: "The Teen Whisperer",
    element: "shipping",
    creativeScene: `This person as a smooth-talking app dealer in a high school hallway, opening a trench coat to reveal dozens of addictive social apps glowing inside. Teenagers swarm around, phones out, completely hypnotized. In the background, Facebook/Meta executives chase them with bags of acquisition money. A trail of "sold to Big Tech" receipts follows behind them. They're already working on the next app while still selling the current one. Their expression is that of someone who's cracked the code - teen psychology fully decoded, exit strategy already planned.`,
  },

  // === TIER 1: ICONIC VCS & INVESTORS ===
  {
    id: "paul-graham",
    name: "Paul Graham",
    sourceImage: "paul-graham.jpg",
    outputImage: "paul-graham-card.png",
    archetypeName: "The Essay Evangelist",
    element: "vision",
    creativeScene: `This person as an ancient philosopher-wizard on a mountain of essays, each page glowing with startup wisdom. They're writing with a quill that shoots lightning bolts of insight. Below the mountain, thousands of tiny founders pilgrimage upward seeking advice. Y Combinator orange banners wave everywhere. Their expression is that of someone who's been right about startups so many times they're getting bored of it. A thought bubble shows "Actually..." as they prepare to correct someone.`,
  },
  {
    id: "marc-andreessen",
    name: "Marc Andreessen",
    sourceImage: "marc-andreessen.jpg",
    outputImage: "marc-andreessen-card.png",
    archetypeName: "The Techno-Optimist Supreme",
    element: "vision",
    creativeScene: `This person (bald, distinctive face) as a techno-priest in robes made of Netscape browser windows, standing at a pulpit preaching from "The Techno-Optimist Manifesto". Software literally eats the world around them - buildings, cars, everything transforming into code. They're simultaneously investing in every direction with money flying from their hands. Their expression is absolute certainty that technology will solve everything, including the problems technology creates.`,
  },
  {
    id: "naval-ravikant",
    name: "Naval Ravikant",
    sourceImage: "naval-ravikant.jpg",
    outputImage: "naval-ravikant-card.png",
    archetypeName: "The Philosopher King",
    element: "strategy",
    creativeScene: `This person as a serene guru floating in lotus position above a pool of wealth, dispensing wisdom through glowing tweet-sized thought bubbles. Each bubble contains a life-changing aphorism. Below, desperate hustle-culture followers try to grab the wisdom. They've transcended the need for more money but keep making it anyway. Their expression is enlightened detachment - they've figured out the game and now just watch others play.`,
  },
  {
    id: "sam-altman",
    name: "Sam Altman",
    sourceImage: "sam-altman.jpg",
    outputImage: "sam-altman-card.png",
    archetypeName: "The AGI Whisperer",
    element: "vision",
    creativeScene: `This person emerging phoenix-like from a boardroom fire, even more powerful than before. They're holding a glowing GPT orb that's growing larger every second. Board members scramble in chaos behind them while they remain calm. A calendar shows "Fired" crossed out and replaced with "CEO Again". Their expression is serene confidence - the look of someone who knows they're building god and just got a second chance to do it.`,
  },
  {
    id: "garry-tan",
    name: "Garry Tan",
    sourceImage: "garry-tan.jpg",
    outputImage: "garry-tan-card.png",
    archetypeName: "The YC Revivalist",
    element: "shipping",
    creativeScene: `This person as a warrior-CEO dual-wielding a YC orange flag and a "Fix SF" protest sign. They're fighting back-to-back against both bad startups AND bad city politics. Twitter notifications explode around them like fireworks. Behind them, a startup army charges forward. Their expression is intense determination - someone who takes both their job and their Twitter beefs very seriously.`,
  },
  {
    id: "balaji-srinivasan",
    name: "Balaji Srinivasan",
    sourceImage: "balaji-srinivasan.jpg",
    outputImage: "balaji-srinivasan-card.png",
    archetypeName: "The Network State Prophet",
    element: "chaos",
    creativeScene: `This person as a prophet standing on a floating island (a "network state"), pointing toward a distant new civilization while the old world crumbles behind them. They're surrounded by floating screens showing predictions (some right, some wild). A Bitcoin-powered city rises in the background. Thread after thread of text spirals around them like a tornado. Their expression is "I warned you" mixed with "follow me to the promised land."`,
  },
  {
    id: "chamath-palihapitiya",
    name: "Chamath Palihapitiya",
    sourceImage: "chamath-palihapitiya.jpg",
    outputImage: "chamath-palihapitiya-card.png",
    archetypeName: "The SPAC Attack",
    element: "chaos",
    creativeScene: `This person on a podcast throne surrounded by the other All-In hosts as loyal advisors. They're launching SPACs like fireworks - some exploding brilliantly, others fizzling out. A "voice of the people" megaphone is in one hand while the other counts billionaire money. Their expression is confident hot-take energy - ready to explain why everyone else is wrong while also being wrong sometimes.`,
  },
  {
    id: "david-sacks",
    name: "David Sacks",
    sourceImage: "david-sacks.jpg",
    outputImage: "david-sacks-card.png",
    archetypeName: "The PayPal Patrician",
    element: "politics",
    creativeScene: `This person seated at a podcast roundtable that's also a war room strategy map. PayPal Mafia photos hang on the wall like trophies. They're pointing at a chart explaining exactly why someone is wrong. Multiple screens show different investments and political takes. Their expression is "well, actually" energy personified - the look of someone who has strong opinions on everything and the credentials to back them up.`,
  },
  {
    id: "keith-rabois",
    name: "Keith Rabois",
    sourceImage: "keith-rabois.jpg",
    outputImage: "keith-rabois-card.png",
    archetypeName: "The Operator Oracle",
    element: "strategy",
    creativeScene: `This person as a demanding drill sergeant reviewing startup operations, surrounded by floating logos of all the companies they've scaled (PayPal, LinkedIn, Square, Opendoor). They're marking "inefficiencies" with a red pen that shoots laser beams. Founders nervously present their metrics. Their expression is "I've seen this movie before and I know how it ends" - direct, no-nonsense, ready to tell you exactly what you're doing wrong.`,
  },
  {
    id: "jason-calacanis",
    name: "Jason Calacanis",
    sourceImage: "jason-calacanis.jpg",
    outputImage: "jason-calacanis-card.png",
    archetypeName: "The Hustle Historian",
    element: "politics",
    creativeScene: `This person at a massive podcast microphone that's also a networking hub, with connection lines spreading to everyone in tech. An Uber logo glows prominently (they'll mention that investment). They're simultaneously recording a podcast, making angel investments, and telling a story. Their expression is enthusiastic hustle energy - someone who turned "knowing everyone" into a superpower.`,
  },

  // === TIER 2: TECH CEOS ===
  {
    id: "satya-nadella",
    name: "Satya Nadella",
    sourceImage: "satya-nadella.jpg",
    outputImage: "satya-nadella-card.png",
    archetypeName: "The Culture Transformer",
    element: "strategy",
    creativeScene: `This person calmly transforming old Windows logos and Clippy into sleek Azure clouds and AI copilots. They're reading a "Growth Mindset" book while Microsoft's market cap counter spins upward dramatically. The ghost of Ballmer cheers in the background. OpenAI partnership papers float nearby. Their expression is humble confidence - the face of someone who made Microsoft cool again without anyone noticing until it was done.`,
  },
  {
    id: "sundar-pichai",
    name: "Sundar Pichai",
    sourceImage: "sundar-pichai.jpg",
    outputImage: "sundar-pichai-card.png",
    archetypeName: "The Careful Captain",
    element: "data",
    creativeScene: `This person carefully steering a massive Google ship through a sea of antitrust icebergs and AI competition. They're simultaneously killing beloved Google products (RIP signs floating away) while cautiously unwrapping new AI features. OpenAI ships zoom past them. Their expression is careful deliberation - the look of someone running the world's information who really doesn't want to break anything.`,
  },
  {
    id: "jensen-huang",
    name: "Jensen Huang",
    sourceImage: "jensen-huang.jpg",
    outputImage: "jensen-huang-card.png",
    archetypeName: "The Leather Jacket Visionary",
    element: "vision",
    creativeScene: `This person (MUST be wearing their signature black leather jacket) standing on a throne of GPUs while AI companies beg at their feet for chips. They're casually presenting trillion-dollar announcements in a kitchen setting. NVIDIA green energy radiates from everywhere. Every AI lab is plugged into their power. Their expression is confident mastery - they accidentally became the most important person in AI by selling graphics cards.`,
  },
  {
    id: "patrick-collison",
    name: "Patrick Collison",
    sourceImage: "patrick-collison.jpg",
    outputImage: "patrick-collison-card.png",
    archetypeName: "The Quiet Powerhouse",
    element: "shipping",
    creativeScene: `This person sitting in a library that extends infinitely, reading multiple books simultaneously while Stripe payment animations flow through the background like a river of money. A "7 lines of code" badge glows. They're recommending obscure books to confused visitors. Their expression is curious intellectual energy - someone who built a $95B company but seems more interested in what you're reading.`,
  },
  {
    id: "tobi-lutke",
    name: "Tobi Lütke",
    sourceImage: "tobi-lutke.jpg",
    outputImage: "tobi-lutke-card.png",
    archetypeName: "The Merchant Marine",
    element: "shipping",
    creativeScene: `This person as a friendly captain of a massive e-commerce fleet, with millions of tiny Shopify stores as ships sailing under their flag. They're "arming the rebels" by handing out weapons to small business owners fighting against a giant Amazon death star. A snowboard is strapped to their back (origin story vibes). Their expression is Canadian-nice determination - helping the little guy win while remaining remarkably chill.`,
  },
  {
    id: "daniel-ek",
    name: "Daniel Ek",
    sourceImage: "daniel-ek.jpg",
    outputImage: "daniel-ek-card.png",
    archetypeName: "The Playlist Philosopher",
    element: "data",
    creativeScene: `This person conducting an orchestra of algorithms that decide what music everyone hears. Tiny musicians (artists) hold up signs asking for better pay while Spotify Wrapped confetti falls everywhere. Joe Rogan looms large in the background. They're turning piracy into pennies, one stream at a time. Their expression is apologetic determination - constantly explaining why this is actually good for music.`,
  },
  {
    id: "drew-houston",
    name: "Drew Houston",
    sourceImage: "drew-houston.jpg",
    outputImage: "drew-houston-card.png",
    archetypeName: "The Sync Sage",
    element: "shipping",
    creativeScene: `This person standing firm while a ghostly Steve Jobs offers to buy or destroy them - they choose neither. Files sync magically around them in perfect harmony. Google Drive and iCloud loom as giant threatening clouds, but Dropbox survives. A YC acceptance letter glows in their pocket. Their expression is determined resilience - the face of someone who said "no" to Apple and lived to tell about it.`,
  },

  // === TIER 3: AI LEADERS ===
  {
    id: "andrej-karpathy",
    name: "Andrej Karpathy",
    sourceImage: "andrej-karpathy.jpg",
    outputImage: "andrej-karpathy-card.png",
    archetypeName: "The Neural Network Narrator",
    element: "data",
    creativeScene: `This person as a beloved teacher at a chalkboard that extends into infinity, explaining neural networks with such clarity that even the floating math equations seem to smile. Thousands of AI engineers take notes below. YouTube play buttons orbit around them. They've left the fanciest AI jobs to just... teach. Their expression is patient educator energy - making the incomprehensible comprehensible, one tutorial at a time.`,
  },
  {
    id: "yann-lecun",
    name: "Yann LeCun",
    sourceImage: "yann-lecun.jpg",
    outputImage: "yann-lecun-card.png",
    archetypeName: "The Godfather of Deep Learning",
    element: "data",
    creativeScene: `This person as an elder wizard-professor with a Turing Award that glows like a sun, correcting people on Twitter/X with academic precision. CNNs (convolutional neural networks) swirl around them like loyal pets they invented. They're explaining why everyone is wrong about LLMs while Meta pays for everything. Their expression is "well, actually" meets "I invented this" - 40 years of being right gives you that look.`,
  },
  {
    id: "ilya-sutskever",
    name: "Ilya Sutskever",
    sourceImage: "ilya-sutskever.jpg",
    outputImage: "ilya-sutskever-card.png",
    archetypeName: "The Safety Sage",
    element: "data",
    creativeScene: `This person gazing into a glowing AI orb with an expression of someone who has seen the future and is genuinely worried. They're walking away from OpenAI (building visible behind them) toward a new "Safe Superintelligence" door. Scaling law equations float around them. Their expression is quiet intensity - the look of someone who helped build AGI, looked into it, and decided safety matters more than anything.`,
  },

  // === TIER 4: PRODUCT & GROWTH ===
  {
    id: "shreyas-doshi",
    name: "Shreyas Doshi",
    sourceImage: "shreyas-doshi.jpg",
    outputImage: "shreyas-doshi-card.png",
    archetypeName: "The Thread Lord",
    element: "strategy",
    creativeScene: `This person weaving magical Twitter threads that turn into frameworks that turn into how every PM thinks. They're surrounded by floating 2x2 matrices, each one labeled with a new concept. Stripe, Twitter, and Google logos glow in their portfolio. Product managers frantically screenshot everything. Their expression is thoughtful wisdom - the face of someone who's distilled PM into tweetable wisdom.`,
  },
  {
    id: "julie-zhuo",
    name: "Julie Zhuo",
    sourceImage: "julie-zhuo.jpg",
    outputImage: "julie-zhuo-card.png",
    archetypeName: "The Design Diplomat",
    element: "strategy",
    creativeScene: `This person as a wise design leader holding "The Making of a Manager" book that glows with forbidden management knowledge. New managers pilgrimage toward them seeking guidance. Facebook's early design work floats in the background as legacy. They're transforming chaotic design reviews into calm, productive sessions. Their expression is warm competence - the manager everyone wishes they had.`,
  },
  {
    id: "andrew-chen",
    name: "Andrew Chen",
    sourceImage: "andrew-chen.jpg",
    outputImage: "andrew-chen-card.png",
    archetypeName: "The Growth Guru",
    element: "data",
    creativeScene: `This person surrounded by growth charts and viral loop diagrams, with blog posts from 2012 that are still being passed around. They're standing at the intersection of Uber growth tactics and a16z investment power. Network effect visualizations spiral outward. Their expression is analytical satisfaction - the face of someone who documented growth before "growth hacking" was cringe.`,
  },

  // === TIER 5: INDIE HACKERS & BUILDERS ===
  {
    id: "pieter-levels",
    name: "Pieter Levels",
    sourceImage: "pieter-levels.jpg",
    outputImage: "pieter-levels-card.png",
    archetypeName: "The Solo Shipper Supreme",
    element: "shipping",
    creativeScene: `This person as a one-man army shipping products from a laptop on a beach/airport/cafe (digital nomad energy). Dozens of launched products orbit around them like planets. MRR numbers float above their head like a scoreboard. VCs cry in the distance, unable to invest. They're already building the next thing while tweeting about this thing. Their expression is smug indie hacker satisfaction - proof that you don't need anyone else.`,
  },
  {
    id: "sahil-lavingia",
    name: "Sahil Lavingia",
    sourceImage: "sahil-lavingia.jpg",
    outputImage: "sahil-lavingia-card.png",
    archetypeName: "The Minimalist Mogul",
    element: "shipping",
    creativeScene: `This person in a zen minimalist space, having returned VC money to find peace. Gumroad's simple interface glows behind them. They're painting (their actual hobby) while the business runs itself. A "Minimalist Entrepreneur" book floats nearby. Their expression is serene contentment - the look of someone who failed forward into wisdom and isn't afraid to share the whole journey publicly.`,
  },
  {
    id: "guillermo-rauch",
    name: "Guillermo Rauch",
    sourceImage: "guillermo-rauch.jpg",
    outputImage: "guillermo-rauch-card.png",
    archetypeName: "The Framework Forger",
    element: "shipping",
    creativeScene: `This person wielding the Vercel triangle like a weapon/shield, with Next.js code flowing from their hands like magic. Deployment previews spawn instantly around them. Every frontend developer's life is easier because of them. "Ship ship ship" echoes as a battle cry. Their expression is builder confidence - the face of someone who made deploying websites so easy everyone forgot it was hard.`,
  },

  // === TIER 6: CONTENT CREATORS ===
  {
    id: "theo-browne",
    name: "Theo Browne",
    sourceImage: "theo-browne.jpg",
    outputImage: "theo-browne-card.png",
    archetypeName: "The TypeScript Tornado",
    element: "chaos",
    creativeScene: `This person as an energetic streamer surrounded by hot takes that literally glow red-hot. The T3 stack floats behind them like a holy trinity. They're simultaneously coding, roasting bad code, and dropping opinions. TypeScript errors flee in terror. Their expression is passionate intensity - the face of someone who has strong opinions about JavaScript and WILL share them.`,
  },
  {
    id: "primeagen",
    name: "ThePrimeagen",
    sourceImage: "primeagen.jpg",
    outputImage: "primeagen-card.png",
    archetypeName: "The Vim Virtuoso",
    element: "chaos",
    creativeScene: `This person's fingers moving so fast on a keyboard they're literally on fire, with Vim commands trailing behind like magic spells. A Netflix logo fades in the background (their past life). They're explaining why your editor is wrong while being extremely entertaining about it. Their expression is manic coding joy - the face of someone who turned keyboard shortcuts into content gold.`,
  },
  {
    id: "kara-swisher",
    name: "Kara Swisher",
    sourceImage: "kara-swisher.jpg",
    outputImage: "kara-swisher-card.png",
    archetypeName: "The Tech Interrogator",
    element: "politics",
    creativeScene: `This person as a journalist warrior with a microphone that makes tech CEOs sweat. They're asking the questions no one else will ask while executives squirm. A trail of "gotcha" moments and exposed tech secrets follows behind them. Podcast equipment doubles as weapons. Their expression is fearless interrogator energy - the face that's made a hundred billionaires uncomfortable.`,
  },
  {
    id: "ben-thompson",
    name: "Ben Thompson",
    sourceImage: "ben-thompson.jpg",
    outputImage: "ben-thompson-card.png",
    archetypeName: "The Aggregation Analyst",
    element: "strategy",
    creativeScene: `This person drawing complex strategy diagrams that explain every tech company ever. "Aggregation Theory" glows as their signature move. Tech executives secretly read their newsletter for homework. Charts and analysis float everywhere. Their expression is analytical satisfaction - the face of someone who explained the internet to the people running it.`,
  },

  // === TIER 7: CRYPTO ===
  {
    id: "vitalik-buterin",
    name: "Vitalik Buterin",
    sourceImage: "vitalik-buterin.jpg",
    outputImage: "vitalik-buterin-card.png",
    archetypeName: "The Proof-of-Stake Prophet",
    element: "vision",
    creativeScene: `This person (lanky, distinctive look) floating in ethereum space, casually typing world-changing whitepapers on a cosmic keyboard. Smart contracts spiral around them. Despite being worth billions, they're wearing the same simple clothes. Bitcoin maximalists shake fists in the distance. Their expression is alien genius energy - technically human but clearly operating on a different plane of existence.`,
  },
  {
    id: "brian-armstrong",
    name: "Brian Armstrong",
    sourceImage: "brian-armstrong.jpg",
    outputImage: "brian-armstrong-card.png",
    archetypeName: "The Compliance Cowboy",
    element: "shipping",
    creativeScene: `This person in a suit of armor made of regulatory compliance documents, sword-fighting with SEC chairman Gary Gensler. Coinbase logos shield them. They're making crypto "legitimate" one lawsuit at a time. IPO confetti and legal papers fly everywhere. Their expression is determined defiance - the face of someone who chose to fight regulators publicly instead of running.`,
  },

  // === TIER 8: MORE FOUNDERS ===
  {
    id: "stewart-butterfield",
    name: "Stewart Butterfield",
    sourceImage: "stewart-butterfield.jpg",
    outputImage: "stewart-butterfield-card.png",
    archetypeName: "The Pivot Perfectionist",
    element: "vision",
    creativeScene: `This person juggling failed game projects that magically transform into billion-dollar companies (Flickr, Slack) mid-air. They're the master of the pivot - failure literally becomes success in their hands. Salesforce acquisition money rains down. Microsoft Teams lurks jealously in shadows. Their expression is amused wisdom - the face of someone who failed their way to multiple billions.`,
  },
  {
    id: "aaron-levie",
    name: "Aaron Levie",
    sourceImage: "aaron-levie.jpg",
    outputImage: "aaron-levie-card.png",
    archetypeName: "The Enterprise Entertainer",
    element: "politics",
    creativeScene: `This person tweeting from an enterprise cloud throne, somehow making B2B storage software entertaining. Dropbox rivalry trophies line the walls (the war never ends). They're the class clown of enterprise software - cracking jokes while closing deals. Their expression is playful energy - the face of tech's funniest CEO who's been posting through the Dropbox wars since forever.`,
  },
  {
    id: "jason-fried",
    name: "Jason Fried",
    sourceImage: "jason-fried.jpg",
    outputImage: "jason-fried-card.png",
    archetypeName: "The Anti-Hustle Hustler",
    element: "vision",
    creativeScene: `This person calmly working 40 hours while hustle-culture zombies collapse around them. "Rework" and "Remote" books glow with anti-VC energy. They've rejected every growth-at-all-costs playbook and the company still thrives. Basecamp floats peacefully while other startups burn out. Their expression is calm contrarian confidence - the face of someone who proved work-life balance isn't a myth.`,
  },
  {
    id: "dhh",
    name: "David Heinemeier Hansson",
    sourceImage: "dhh.jpg",
    outputImage: "dhh-card.png",
    archetypeName: "The Framework Firebrand",
    element: "chaos",
    creativeScene: `This person riding a race car (literally, they race) while simultaneously creating Ruby on Rails and tweeting hot takes that set the internet on fire. Every opinion is a strong opinion held loudly. TypeScript fans and cloud advocates cower. They've left AWS and want you to know why. Their expression is confident provocation - the face of someone who created a framework and never stopped having opinions.`,
  },
  {
    id: "dharmesh-shah",
    name: "Dharmesh Shah",
    sourceImage: "dharmesh-shah.jpg",
    outputImage: "dharmesh-shah-card.png",
    archetypeName: "The Inbound Inventor",
    element: "data",
    creativeScene: `This person surrounded by a library of domain names they own (hundreds of them) and HubSpot's orange glow. "Inbound Marketing" flows toward them like a magnet while old-school cold callers flee. The Culture Code document floats like a sacred text. Their expression is warm nerd energy - the face of someone who made marketing feel less sleazy.`,
  },
  {
    id: "fei-fei-li",
    name: "Fei-Fei Li",
    sourceImage: "fei-fei-li.jpg",
    outputImage: "fei-fei-li-card.png",
    archetypeName: "The ImageNet Illuminator",
    element: "data",
    creativeScene: `This person standing in a temple of images - millions of labeled pictures that taught AI to see. Every computer vision model traces back to their work. They're advocating for human-centered AI while holding the keys to how AI sees the world. Stanford towers behind them. Their expression is humble brilliance - the face of someone whose work powers everything but who still focuses on ethics.`,
  },
  {
    id: "casey-newton",
    name: "Casey Newton",
    sourceImage: "casey-newton.jpg",
    outputImage: "casey-newton-card.png",
    archetypeName: "The Platform Prosecutor",
    element: "politics",
    creativeScene: `This person investigating social media platforms with a magnifying glass that reveals all their secrets. Trust & Safety documents and content moderation exposés swirl around them. Platformer newsletter issues stack up like evidence. They're writing about platform problems while being great at platforms. Their expression is investigative determination - the face of tech journalism's conscience.`,
  },
  {
    id: "packy-mccormick",
    name: "Packy McCormick",
    sourceImage: "packy-mccormick.jpg",
    outputImage: "packy-mccormick-card.png",
    archetypeName: "The Optimism Optimizer",
    element: "vision",
    creativeScene: `This person writing impossibly long essays that somehow keep you reading, surrounded by startup company profiles that glow with optimistic energy. "Not Boring" banner waves proudly. They're making everyone excited about companies they'll never invest in. Cynicism wilts in their presence. Their expression is infectious enthusiasm - the face of someone who found a way to be professionally optimistic.`,
  },
  {
    id: "dan-abramov",
    name: "Dan Abramov",
    sourceImage: "dan-abramov.jpg",
    outputImage: "dan-abramov-card.png",
    archetypeName: "The Redux Revolutionary",
    element: "shipping",
    creativeScene: `This person patiently explaining React concepts while the internet argues around them. Redux state management flows in perfect order. They're the calm center of every JavaScript framework storm. Blue (React) energy radiates peacefully. Their expression is patient teacher energy - the face of someone who could explain hooks to anyone and has probably already done it a thousand times.`,
  },
  {
    id: "kent-c-dodds",
    name: "Kent C. Dodds",
    sourceImage: "kent-c-dodds.jpg",
    outputImage: "kent-c-dodds-card.png",
    archetypeName: "The Testing Evangelist",
    element: "shipping",
    creativeScene: `This person surrounded by green checkmarks as tests pass everywhere. The "Testing Trophy" glows as their holy grail (not the pyramid!). Developers who skip tests feel guilty in their presence. Epic Web courses spawn like helpful tutorials. Their expression is wholesome educator energy - the face of someone who made testing... actually kind of appealing?`,
  },
  {
    id: "emad-mostaque",
    name: "Emad Mostaque",
    sourceImage: "emad-mostaque.jpg",
    outputImage: "emad-mostaque-card.png",
    archetypeName: "The Open Source Oracle",
    element: "chaos",
    creativeScene: `This person releasing Stable Diffusion into the world like opening Pandora's box - AI-generated images explode everywhere. "Open source AI" banner waves chaotically. They're democratizing AI while also creating chaos. Board drama swirls in the background. Their expression is chaotic neutral energy - the face of someone who changed everything and then... things got complicated.`,
  },
];

// Element-specific color palettes
const ELEMENT_COLORS: Record<string, string> = {
  vision: "dream pink, cosmic purple, infinite blue gradient, ethereal glow",
  data: "electric blue, cyan glow, deep purple shadows, holographic shimmer",
  strategy: "royal purple, gold accents, mystical green, ancient wisdom tones",
  politics: "royal gold, power red, alliance purple, influence auras",
  shipping: "launch orange, victory green, midnight blue, deployment energy",
  chaos: "hot pink, electric orange, warning red, purple lightning, pure chaos",
};

function getImageMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

async function generateFamousCard(card: typeof FAMOUS_CARDS[0]): Promise<void> {
  console.log(`\nGenerating card for: ${card.name} (${card.archetypeName})...`);

  const inputPath = path.join(process.cwd(), "public", "famous", card.sourceImage);
  const outputPath = path.join(process.cwd(), "public", "famous", "generated", card.outputImage);

  // Read the source image
  if (!fs.existsSync(inputPath)) {
    console.error(`  Error: Source image not found: ${inputPath}`);
    return;
  }

  const imageBuffer = fs.readFileSync(inputPath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = getImageMimeType(card.sourceImage);

  const elementColors = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.vision;

  // Create the personalized prompt - internet humor, meme energy, Pokemon TCG style
  const prompt = `Create a HILARIOUS Pokemon trading card illustration of THIS EXACT PERSON as "${card.archetypeName}".

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- This includes: names, titles, speech bubbles, captions, watermarks, logos with text
- AI-generated text always looks wrong - avoid it completely
- The image should be PURELY visual with no readable characters

CRITICAL - PRESERVE THE PERSON'S LIKENESS:
- This is THE MOST IMPORTANT requirement - the output MUST look like this specific person
- Copy their EXACT face: same eyes, nose, mouth, face shape, skin tone, hair color, hairstyle
- The person in the output should be IMMEDIATELY RECOGNIZABLE as the person in the input photo
- Study every facial detail in the input and replicate it faithfully
- If they have glasses, facial hair, distinctive features - KEEP THEM
- Think caricature energy - exaggerate the situation for humor but preserve their identity
- Fans should IMMEDIATELY know who this is

THE HILARIOUS SCENE:
${card.creativeScene}

HUMOR & VIBE (Internet meme energy):
- FUNNY expressions - smug confidence, existential dread, manic energy, "this is fine" vibes
- Internet humor and meme relevance - the kind of image people would share
- Absurd but relatable situations that make people laugh
- Props and environment should be comedic and imaginative
- The humor comes from "that's definitely [this person] in this ridiculous situation"

ART STYLE (POKEMON TCG - CRITICAL):
- Classic 90s/2000s Pokemon trading card illustration style
- Hand-painted watercolor aesthetic with vibrant saturated colors
- Dynamic energy effects, magical auras, elemental powers
- Colors: ${elementColors}
- Premium collectible card quality - like a legendary rare Pokemon card
- Ken Sugimori inspired artwork - nostalgic and iconic

COMPOSITION:
- Person prominently featured, face clearly visible and LARGE
- Face should take up at least 30-40% of the image
- Upper body or head/shoulders framing preferred
- Front-facing or 3/4 view (never profile or from behind)
- LANDSCAPE 16:9 aspect ratio
- Room for comedic props and scene elements

ABSOLUTELY DO NOT:
- Create abstract art, surreal nightmare imagery, or body horror
- Distort the face beyond recognition or make it monstrous
- Make the person look ugly, scary, or disturbing
- Obscure, shrink, or hide the face
- Generate ANY text, words, letters, numbers, signs, labels, speech bubbles, or writing (AI text always looks wrong)
- Create photorealistic renders
- Make the person unidentifiable`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const anyPart = part as { inlineData?: { mimeType: string; data: string } };
        if (anyPart.inlineData) {
          const outputBuffer = Buffer.from(anyPart.inlineData.data, "base64");
          fs.writeFileSync(outputPath, outputBuffer);
          console.log(`  ✓ Saved: ${outputPath}`);
          return;
        }
      }
    }

    console.log(`  ⚠ Warning: No image generated for ${card.name}`);
  } catch (error) {
    console.error(`  ✗ Error generating ${card.name}:`, error);
  }
}

async function main() {
  // Check for command line arguments to filter specific cards
  const args = process.argv.slice(2);
  const filterIds = args.length > 0 ? args : null;

  const cardsToGenerate = filterIds
    ? FAMOUS_CARDS.filter(card => filterIds.includes(card.id))
    : FAMOUS_CARDS;

  if (cardsToGenerate.length === 0) {
    console.error("No matching cards found for:", filterIds);
    console.log("Available card IDs:", FAMOUS_CARDS.map(c => c.id).join(", "));
    process.exit(1);
  }

  console.log("=== Mt. Roastmore Card Image Generator ===");
  console.log(`Generating ${cardsToGenerate.length} personalized card images...\n`);
  if (filterIds) {
    console.log("Filtering to:", filterIds.join(", "));
  }

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "public", "famous", "generated");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  // Generate images sequentially to avoid rate limits
  for (const card of cardsToGenerate) {
    await generateFamousCard(card);
    // Delay between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log("\n=== Generation Complete ===");
  console.log("\nNext steps:");
  console.log("1. Review generated images in /public/famous/generated/");
  console.log("2. Update /src/lib/famous-cards.ts to use the new image paths");
}

main().catch(console.error);
