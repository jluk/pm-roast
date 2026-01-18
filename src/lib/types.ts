export type DreamRole =
  | "founder"
  | "cpo-startup"
  | "cpo-enterprise"
  | "l6-faang"
  | "l7-faang"
  | "vp-product"
  | "ic-senior";

export const DREAM_ROLES: Record<DreamRole, { label: string; description: string }> = {
  founder: {
    label: "Founder / CEO",
    description: "Start my own company",
  },
  "cpo-startup": {
    label: "CPO at Series B",
    description: "Lead product at a hot startup",
  },
  "cpo-enterprise": {
    label: "CPO at Enterprise",
    description: "Lead product at scale",
  },
  "l6-faang": {
    label: "L6 at FAANG",
    description: "Staff PM at big tech",
  },
  "l7-faang": {
    label: "L7+ at FAANG",
    description: "Principal/Director at big tech",
  },
  "vp-product": {
    label: "VP of Product",
    description: "Executive leadership",
  },
  "ic-senior": {
    label: "Senior IC PM",
    description: "Deep craft, high impact",
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
}

export type Step = "upload" | "goals" | "analyzing" | "results";
