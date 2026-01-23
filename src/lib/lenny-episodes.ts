/**
 * Lenny's Podcast Episode Mapping
 *
 * Maps guest names to their actual Lenny's Podcast YouTube video URLs.
 * Video IDs verified from https://github.com/jluk/lennys-podcast-transcripts
 */

export interface LennyEpisode {
  videoId: string;
  title: string;
  guest: string;
}

// Map of guest names (lowercase) to their Lenny's Podcast episode(s)
// Video IDs verified from the transcripts repo
export const LENNY_EPISODES: Record<string, LennyEpisode> = {
  // Verified episodes from transcripts repo
  "brian chesky": {
    videoId: "4ef0juAMqoE",
    title: "The ultimate guide to founder mode",
    guest: "Brian Chesky"
  },
  "shreyas doshi": {
    videoId: "YP_QghPLG-8",
    title: "The art of product management",
    guest: "Shreyas Doshi"
  },
  "julie zhuo": {
    videoId: "c_w0LaFahxk",
    title: "From managing people to managing AI",
    guest: "Julie Zhuo"
  },
  "guillermo rauch": {
    videoId: "-QsTmu2CqhA",
    title: "Everyone's an engineer now: Inside v0's mission to create 100 million builders",
    guest: "Guillermo Rauch"
  },
  "drew houston": {
    videoId: "egdYKLBswgk",
    title: "Behind the founder",
    guest: "Drew Houston"
  },
  "marty cagan": {
    videoId: "9N4ZgNaWvI0",
    title: "Product management theater",
    guest: "Marty Cagan"
  },
  "tobi lütke": {
    videoId: "tq6vdDJQXvs",
    title: "Tobi Lütke's leadership playbook: First principles, infinite games, and maximizing human potential",
    guest: "Tobi Lütke"
  },
  "tobi lutke": {
    videoId: "tq6vdDJQXvs",
    title: "Tobi Lütke's leadership playbook: First principles, infinite games, and maximizing human potential",
    guest: "Tobi Lütke"
  },
  "stewart butterfield": {
    videoId: "kLe-zy5r0Mk",
    title: "Mental models for building products people love",
    guest: "Stewart Butterfield"
  },
  "dharmesh shah": {
    videoId: "dpw9Ue1HU48",
    title: "Zigging vs. zagging: How HubSpot built a $30B company",
    guest: "Dharmesh Shah"
  },
  "gibson biddle": {
    videoId: "QHEXQD3Lbr0",
    title: "How Netflix builds product",
    guest: "Gibson Biddle"
  },
};

// Get Lenny episode URL for a guest
export function getLennyEpisodeUrl(guestName: string): string | null {
  const normalizedName = guestName.toLowerCase().trim();
  const episode = LENNY_EPISODES[normalizedName];

  if (episode) {
    return `https://www.youtube.com/watch?v=${episode.videoId}`;
  }

  return null;
}

// Get Lenny episode info for a guest
export function getLennyEpisode(guestName: string): LennyEpisode | null {
  const normalizedName = guestName.toLowerCase().trim();
  return LENNY_EPISODES[normalizedName] || null;
}

// Check if a guest has been on Lenny's Podcast
export function hasLennyEpisode(guestName: string): boolean {
  const normalizedName = guestName.toLowerCase().trim();
  return normalizedName in LENNY_EPISODES;
}

// Generate YouTube search URL as fallback for unknown episodes
export function getLennySearchUrl(title: string, guest: string): string {
  const query = `Lenny's Podcast ${guest} ${title}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
