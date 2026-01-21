export type DreamRole =
  | "founder"
  | "vp-product"
  | "cpo"
  | "director-faang"
  | "staff-faang"
  | "senior-pm"
  | "vc"
  | "cult-leader";

export interface DreamRoleInfo {
  label: string;
  description: string;
  emoji: string;
}

export const DREAM_ROLES: Record<DreamRole, DreamRoleInfo> = {
  founder: {
    label: "Founder / CEO",
    description: "Start my own company",
    emoji: "🚀",
  },
  "vp-product": {
    label: "VP of Product",
    description: "Lead product org at scale",
    emoji: "👔",
  },
  cpo: {
    label: "CPO",
    description: "Chief Product Officer",
    emoji: "🎯",
  },
  "director-faang": {
    label: "Director at Big Tech",
    description: "L7+ / Director level",
    emoji: "🏢",
  },
  "staff-faang": {
    label: "Staff PM at Big Tech",
    description: "L6 / Staff level",
    emoji: "💼",
  },
  "senior-pm": {
    label: "Senior PM",
    description: "Level up to senior",
    emoji: "📈",
  },
  vc: {
    label: "VC Partner",
    description: "Judge others' PRDs for a living",
    emoji: "💰",
  },
  "cult-leader": {
    label: "Thought Leader",
    description: "Mass LinkedIn following",
    emoji: "🧠",
  },
};

// PM Element types
export type PMElement = "data" | "chaos" | "strategy" | "shipping" | "politics" | "vision";

// PM Move for Pokemon-style attacks
export interface PMMove {
  name: string;
  energyCost: number;
  damage: number;
  effect?: string;
}

export interface RoastResult {
  // The biting roast bullets
  roastBullets: string[];

  // User's name extracted from profile
  userName?: string;

  // The archetype assignment
  archetype: {
    name: string;
    description: string;
    emoji: string;
    element: PMElement;
    flavor: string; // Pokédex-style flavor text
    stage: string; // e.g., "Junior", "Senior", "Staff", "Principal"
    weakness: string; // Funny one-word weakness
  };

  // PM moves (2-3 funny attacks)
  moves: PMMove[];

  // Generated archetype image (base64)
  archetypeImage?: string;

  // Career score (0-100)
  careerScore: number;

  // PM capability scores (0-99 each, FIFA style)
  capabilities: {
    productSense: number;
    execution: number;
    leadership: number;
  };

  // Gap analysis
  gaps: string[];

  // 6-month roadmap
  roadmap: {
    month: number;
    title: string;
    actions: string[];
  }[];

  // Recommended podcast episodes
  podcastEpisodes: {
    title: string;
    guest: string;
    reason: string;
  }[];

  // One banger quote for sharing
  bangerQuote: string;

  // Honest reaction to their dream role
  dreamRoleReaction: string;

  // Natural rival - their arch-nemesis (person or concept they fear)
  naturalRival: string;
}

export type Step = "upload" | "analyzing" | "results";
