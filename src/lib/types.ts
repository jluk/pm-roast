export type DreamRole =
  | "founder"
  | "cpo-startup"
  | "cpo-enterprise"
  | "l6-faang"
  | "l7-faang"
  | "vp-product"
  | "ic-senior";

export type RoleCategory = "executive" | "bigtech" | "startup" | "ic";

export interface DreamRoleInfo {
  label: string;
  description: string;
  category: RoleCategory;
  emoji: string;
}

export const DREAM_ROLES: Record<DreamRole, DreamRoleInfo> = {
  founder: {
    label: "Founder / CEO",
    description: "Start my own company",
    category: "executive",
    emoji: "🚀",
  },
  "vp-product": {
    label: "VP of Product",
    description: "Executive leadership",
    category: "executive",
    emoji: "👔",
  },
  "l7-faang": {
    label: "L7+ at FAANG",
    description: "Principal/Director at big tech",
    category: "bigtech",
    emoji: "🏢",
  },
  "l6-faang": {
    label: "L6 at FAANG",
    description: "Staff PM at big tech",
    category: "bigtech",
    emoji: "💼",
  },
  "cpo-startup": {
    label: "CPO at Series B",
    description: "Lead product at a hot startup",
    category: "startup",
    emoji: "🔥",
  },
  "cpo-enterprise": {
    label: "CPO at Enterprise",
    description: "Lead product at scale",
    category: "startup",
    emoji: "📈",
  },
  "ic-senior": {
    label: "Senior IC PM",
    description: "Deep craft, high impact",
    category: "ic",
    emoji: "🎯",
  },
};

export const ROLE_CATEGORIES: Record<RoleCategory, { label: string; color: string; bgColor: string; borderColor: string }> = {
  executive: {
    label: "Executive Track",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  bigtech: {
    label: "Big Tech",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  startup: {
    label: "Startup",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  ic: {
    label: "IC Track",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
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

export type Step = "upload" | "goals" | "analyzing" | "results" | "error";
