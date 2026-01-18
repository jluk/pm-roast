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

export interface RoastResult {
  // The biting roast bullets
  roastBullets: string[];

  // The archetype assignment
  archetype: {
    name: string;
    description: string;
    emoji: string;
  };

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
