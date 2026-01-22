/**
 * Script to generate 50 famous tech Twitter influencer cards for Mt. Roastmore
 * Run with: npx tsx scripts/generate-50-famous-cards.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

// 50 Notable Tech Twitter Influencers
const FAMOUS_PEOPLE = [
  // VCs
  { id: "paul-graham", name: "Paul Graham", handle: "paulg", title: "Co-founder", company: "Y Combinator", element: "vision" },
  { id: "marc-andreessen", name: "Marc Andreessen", handle: "pmarca", title: "Co-founder", company: "a16z", element: "vision" },
  { id: "naval-ravikant", name: "Naval Ravikant", handle: "naval", title: "Co-founder", company: "AngelList", element: "strategy" },
  { id: "balaji-srinivasan", name: "Balaji Srinivasan", handle: "balaboratory", title: "Former CTO", company: "Coinbase", element: "chaos" },
  { id: "jason-calacanis", name: "Jason Calacanis", handle: "Jason", title: "Angel Investor", company: "LAUNCH", element: "politics" },
  { id: "garry-tan", name: "Garry Tan", handle: "garrytan", title: "CEO", company: "Y Combinator", element: "shipping" },
  { id: "keith-rabois", name: "Keith Rabois", handle: "rabois", title: "General Partner", company: "Founders Fund", element: "strategy" },
  { id: "chamath-palihapitiya", name: "Chamath Palihapitiya", handle: "chaaboratory", title: "CEO", company: "Social Capital", element: "chaos" },
  { id: "david-sacks", name: "David Sacks", handle: "DavidSacks", title: "General Partner", company: "Craft Ventures", element: "politics" },
  { id: "sam-altman", name: "Sam Altman", handle: "sama", title: "CEO", company: "OpenAI", element: "vision" },

  // Tech CEOs/Founders
  { id: "satya-nadella", name: "Satya Nadella", handle: "sataboratoryadella", title: "CEO", company: "Microsoft", element: "strategy" },
  { id: "sundar-pichai", name: "Sundar Pichai", handle: "sundarpichai", title: "CEO", company: "Google/Alphabet", element: "data" },
  { id: "jensen-huang", name: "Jensen Huang", handle: "nvidia", title: "CEO", company: "NVIDIA", element: "vision" },
  { id: "patrick-collison", name: "Patrick Collison", handle: "patrickc", title: "CEO", company: "Stripe", element: "shipping" },
  { id: "john-collison", name: "John Collison", handle: "collision", title: "President", company: "Stripe", element: "shipping" },
  { id: "tobi-lutke", name: "Tobi Lütke", handle: "toaboratory", title: "CEO", company: "Shopify", element: "shipping" },
  { id: "stewart-butterfield", name: "Stewart Butterfield", handle: "stewart", title: "Co-founder", company: "Slack", element: "vision" },
  { id: "daniel-ek", name: "Daniel Ek", handle: "eldsjal", title: "CEO", company: "Spotify", element: "data" },
  { id: "drew-houston", name: "Drew Houston", handle: "drewhouston", title: "CEO", company: "Dropbox", element: "shipping" },
  { id: "logan-green", name: "Logan Green", handle: "logangreen", title: "Co-founder", company: "Lyft", element: "chaos" },

  // AI Leaders
  { id: "ilya-sutskever", name: "Ilya Sutskever", handle: "ilyasut", title: "Co-founder", company: "SSI (ex-OpenAI)", element: "data" },
  { id: "andrej-karpathy", name: "Andrej Karpathy", handle: "karpathy", title: "AI Researcher", company: "Ex-Tesla/OpenAI", element: "data" },
  { id: "yann-lecun", name: "Yann LeCun", handle: "ylecun", title: "Chief AI Scientist", company: "Meta", element: "data" },
  { id: "fei-fei-li", name: "Fei-Fei Li", handle: "drfeifei", title: "Professor", company: "Stanford AI Lab", element: "data" },
  { id: "emad-mostaque", name: "Emad Mostaque", handle: "EMostaque", title: "Founder", company: "Stability AI", element: "chaos" },

  // Product/Growth People
  { id: "shreyas-doshi", name: "Shreyas Doshi", handle: "shreyas", title: "PM Advisor", company: "Ex-Stripe/Twitter", element: "strategy" },
  { id: "julie-zhuo", name: "Julie Zhuo", handle: "joulee", title: "Co-founder", company: "Sundial (Ex-Meta VP)", element: "strategy" },
  { id: "gibson-biddle", name: "Gibson Biddle", handle: "gibsonbiddle", title: "Former VP Product", company: "Netflix", element: "strategy" },
  { id: "casey-winters", name: "Casey Winters", handle: "onecaseman", title: "CPO", company: "Eventbrite", element: "data" },
  { id: "andrew-chen", name: "Andrew Chen", handle: "andrewchen", title: "General Partner", company: "a16z", element: "data" },

  // Tech Influencers/Builders
  { id: "pieter-levels", name: "Pieter Levels", handle: "levelsio", title: "Indie Hacker", company: "Nomad List / Photo AI", element: "shipping" },
  { id: "sahil-lavingia", name: "Sahil Lavingia", handle: "shl", title: "CEO", company: "Gumroad", element: "shipping" },
  { id: "guillermo-rauch", name: "Guillermo Rauch", handle: "raaboratoryhat", title: "CEO", company: "Vercel", element: "shipping" },
  { id: "dan-abramov", name: "Dan Abramov", handle: "dan_abramov", title: "Engineer", company: "Ex-Meta (React)", element: "shipping" },
  { id: "kent-c-dodds", name: "Kent C. Dodds", handle: "kentcdodds", title: "Educator", company: "EpicWeb.dev", element: "shipping" },
  { id: "theo-browne", name: "Theo Browne", handle: "t3dotgg", title: "CEO", company: "Ping Labs", element: "chaos" },
  { id: "fireship", name: "Jeff Delaney", handle: "firaboratoryship_dev", title: "Creator", company: "Fireship", element: "chaos" },
  { id: "primeagen", name: "ThePrimeagen", handle: "ThePrimeagen", title: "Content Creator", company: "Netflix/Ex-Netflix", element: "chaos" },

  // Crypto/Web3
  { id: "vitalik-buterin", name: "Vitalik Buterin", handle: "VitalikButerin", title: "Co-founder", company: "Ethereum", element: "vision" },
  { id: "brian-armstrong", name: "Brian Armstrong", handle: "brian_armstrong", title: "CEO", company: "Coinbase", element: "shipping" },
  { id: "cz-binance", name: "Changpeng Zhao", handle: "caboratory_binance", title: "Founder", company: "Binance", element: "chaos" },

  // Media/Content
  { id: "kara-swisher", name: "Kara Swisher", handle: "karaswisher", title: "Tech Journalist", company: "Pivot Podcast", element: "politics" },
  { id: "casey-newton", name: "Casey Newton", handle: "CaseyNewton", title: "Editor", company: "Platformer", element: "politics" },
  { id: "ben-thompson", name: "Ben Thompson", handle: "benthompson", title: "Founder", company: "Stratechery", element: "strategy" },
  { id: "packy-mccormick", name: "Packy McCormick", handle: "packyM", title: "Founder", company: "Not Boring", element: "vision" },

  // More Founders
  { id: "aaron-levie", name: "Aaron Levie", handle: "levie", title: "CEO", company: "Box", element: "politics" },
  { id: "jeff-weiner", name: "Jeff Weiner", handle: "jeffweiner", title: "Former CEO", company: "LinkedIn", element: "strategy" },
  { id: "dharmesh-shah", name: "Dharmesh Shah", handle: "dharmesh", title: "CTO & Co-founder", company: "HubSpot", element: "data" },
  { id: "jason-fried", name: "Jason Fried", handle: "jasonfried", title: "CEO", company: "37signals/Basecamp", element: "vision" },
  { id: "david-heinemeier-hansson", name: "DHH", handle: "dhh", title: "CTO", company: "37signals", element: "chaos" },
];

// Roast templates by element
const ROAST_TEMPLATES: Record<string, { archetypes: string[], weaknesses: string[], scenarios: string[] }> = {
  vision: {
    archetypes: ["The Prophet Complex", "The Thought Leader", "The Future Whisperer", "The Narrative Architect", "The Reality Distorter"],
    weaknesses: ["Present-day execution", "Quarterly earnings calls", "Technical implementation details", "Being wrong publicly"],
    scenarios: ["gazing at floating holographic roadmaps while ignoring the burning backlog behind them", "giving a TED talk to an audience of venture capitalists who are all on their phones", "standing on a mountain made of pitch decks, pointing dramatically at a hockey stick graph"],
  },
  data: {
    archetypes: ["The Metric Maniac", "The Dashboard Devotee", "The A/B Test Addict", "The Analytics Oracle", "The Spreadsheet Sorcerer"],
    weaknesses: ["Qualitative feedback", "Gut instinct", "Moving fast without data", "Making decisions with incomplete information"],
    scenarios: ["drowning in a sea of dashboards while desperately searching for statistical significance", "surrounded by floating charts and graphs that all seem to contradict each other", "performing a ritual sacrifice to the A/B testing gods"],
  },
  strategy: {
    archetypes: ["The Framework Fanatic", "The Matrix Master", "The Consultant Cosplayer", "The Strategic Overthinker", "The Meeting Maestro"],
    weaknesses: ["Actually doing the work", "Ambiguity", "Simple solutions", "Shipping without a doc"],
    scenarios: ["trapped inside an infinite 2x2 matrix of their own creation", "presenting a 47-slide strategy deck to an empty room", "meditating in a temple made entirely of McKinsey frameworks"],
  },
  shipping: {
    archetypes: ["The Deploy Demon", "The Ship-or-Die Zealot", "The Velocity Vampire", "The Iteration Incarnate", "The MVP Maximalist"],
    weaknesses: ["Long-term planning", "Documentation", "Technical debt", "User research"],
    scenarios: ["riding a rocket ship made of merged PRs through a cloud of deployment notifications", "juggling flaming feature flags while standing on a CI/CD pipeline", "captain of a ship made entirely of laptops sailing through a sea of GitHub issues"],
  },
  politics: {
    archetypes: ["The Stakeholder Slayer", "The Alignment Artist", "The Meeting Monarch", "The Influence Illusionist", "The Consensus Conjurer"],
    weaknesses: ["Direct confrontation", "Taking a strong stance", "Working alone", "Transparent communication"],
    scenarios: ["juggling multiple stakeholder puppets while somehow making them all feel heard", "playing 4D chess with org chart pieces while everyone else plays checkers", "holding court in a throne room made of Slack messages"],
  },
  chaos: {
    archetypes: ["The Controlled Demolition", "The Chaos Conductor", "The Disruption Disciple", "The This-Is-Fine Champion", "The Pivot Priest"],
    weaknesses: ["Stability", "Process", "Incremental improvement", "Status quo"],
    scenarios: ["surfing a wave of breaking changes while everything burns behind them", "conducting an orchestra of pure chaos where every instrument is on fire", "standing calmly in a tornado of notifications with a coffee cup labeled 'this is fine'"],
  },
};

// Generate a creative card for a person
function generateCard(person: typeof FAMOUS_PEOPLE[0], index: number) {
  const template = ROAST_TEMPLATES[person.element];
  const archetype = template.archetypes[index % template.archetypes.length];
  const weakness = template.weaknesses[index % template.weaknesses.length];
  const scenario = template.scenarios[index % template.scenarios.length];

  // Generate score based on perceived influence (randomized a bit)
  const baseScore = 70 + Math.floor(Math.random() * 25);

  const emojis: Record<string, string> = {
    vision: "🔮",
    data: "📊",
    strategy: "🧠",
    shipping: "🚀",
    politics: "🎭",
    chaos: "🔥",
  };

  return {
    id: person.id,
    name: person.name,
    title: person.title,
    company: person.company,
    imageUrl: `/famous/sv/${person.id}.jpg`,
    score: baseScore,
    archetypeName: archetype,
    archetypeEmoji: emojis[person.element],
    archetypeDescription: `Known for ${person.title.toLowerCase()} energy at ${person.company}`,
    element: person.element,
    moves: [
      { name: "Thread Storm", energyCost: 1, damage: 30, effect: "Gains 10K followers" },
      { name: "Hot Take", energyCost: 2, damage: 60, effect: "Ratio incoming" },
      { name: "Viral Moment", energyCost: 3, damage: 90, effect: "Quote tweets explode" },
    ],
    stage: baseScore >= 90 ? "Legendary" : baseScore >= 80 ? "Elite" : "Senior",
    weakness,
    flavor: `Building the future, one tweet at a time.`,
    bangerQuote: `Made ${person.company} famous or got famous from ${person.company}. Hard to tell which came first.`,
    naturalRival: "The algorithm",
    roastBullets: [
      `Has more followers than some countries have people`,
      `Their tweets move markets, for better or worse`,
      `Somehow always in the discourse`,
      `Touch grass? Never heard of it`,
    ],
    creativeScene: `This person ${scenario}`,
    handle: person.handle,
  };
}

// Download image from URL
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(filepath);
          downloadImage(redirectUrl, filepath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        resolve(false);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    });

    request.on('error', () => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      resolve(false);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log("=== Generating 50 Famous Tech Twitter Cards ===\n");

  const outputDir = path.join(process.cwd(), "public", "famous");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate card definitions
  const cards = FAMOUS_PEOPLE.map((person, index) => generateCard(person, index));

  // Output the card definitions as TypeScript
  console.log("Generated card definitions for:");
  cards.forEach((card, i) => {
    console.log(`${i + 1}. ${card.name} (@${card.handle}) - ${card.archetypeName}`);
  });

  // Write to a JSON file for review
  const jsonPath = path.join(process.cwd(), "scripts", "famous-cards-data.json");
  fs.writeFileSync(jsonPath, JSON.stringify(cards, null, 2));
  console.log(`\nCard data written to: ${jsonPath}`);

  // Generate TypeScript code
  const tsCode = `// Auto-generated famous cards
// Add these to src/lib/famous-cards.ts

${cards.map(card => `  {
    id: "${card.id}",
    name: "${card.name}",
    title: "${card.title}",
    company: "${card.company}",
    imageUrl: "/famous/sv/generated/${card.id}-card.png",
    score: ${card.score},
    archetypeName: "${card.archetypeName}",
    archetypeEmoji: "${card.archetypeEmoji}",
    archetypeDescription: "${card.archetypeDescription}",
    element: "${card.element}",
    moves: ${JSON.stringify(card.moves)},
    stage: "${card.stage}",
    weakness: "${card.weakness}",
    flavor: "${card.flavor}",
    bangerQuote: "${card.bangerQuote}",
    naturalRival: "${card.naturalRival}",
    roastBullets: ${JSON.stringify(card.roastBullets)},
  },`).join('\n')}
`;

  const tsPath = path.join(process.cwd(), "scripts", "famous-cards-generated.ts");
  fs.writeFileSync(tsPath, tsCode);
  console.log(`TypeScript code written to: ${tsPath}`);

  console.log("\n=== Next Steps ===");
  console.log("1. Download profile images for each person to /public/famous/sv/");
  console.log("2. Run generate-famous-cards.ts to create AI-stylized card images");
  console.log("3. Add the card definitions to src/lib/famous-cards.ts");
}

main().catch(console.error);
