/**
 * Mobile interaction tests for FamousCardsGallery
 *
 * Tests verify:
 * 1. Mobile detection based on viewport width
 * 2. Tap-to-flip behavior on mobile (first tap flips, second tap opens modal)
 * 3. Responsive grid layout classes
 * 4. Card dimensions remain consistent during interactions
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { FamousCardsGallery } from "@/components/FamousCardsGallery";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => {
  const React = require("react");

  // Helper to filter out framer-motion specific props
  const filterMotionProps = (props: any) => {
    const {
      animate, initial, exit, transition, whileHover, whileTap, whileFocus,
      whileDrag, whileInView, variants, layout, layoutId, drag, dragConstraints,
      dragElastic, dragMomentum, onDrag, onDragStart, onDragEnd, onAnimationStart,
      onAnimationComplete, onUpdate, ...rest
    } = props;
    return rest;
  };

  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <div ref={ref} {...filterMotionProps(props)}>{children}</div>
      )),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <button ref={ref} {...filterMotionProps(props)}>{children}</button>
      )),
      span: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <span ref={ref} {...filterMotionProps(props)}>{children}</span>
      )),
      svg: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <svg ref={ref} {...filterMotionProps(props)}>{children}</svg>
      )),
      path: React.forwardRef((props: any, ref: any) => (
        <path ref={ref} {...filterMotionProps(props)} />
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useMotionValue: (initial: any) => ({
      get: () => initial,
      set: jest.fn(),
      onChange: jest.fn(),
    }),
    useTransform: () => 0,
  };
});

// Mock child components that have complex dependencies
jest.mock("@/components/PokemonCard", () => ({
  PokemonCard: ({ userName, archetypeName, score, compact }: any) => (
    <div data-testid="pokemon-card" data-compact={compact} data-username={userName}>
      <span>{userName}</span>
      <span>{archetypeName}</span>
      <span>{score}</span>
    </div>
  ),
}));

jest.mock("@/components/CardBack", () => ({
  CardBack: ({ rarity, roastSummary }: any) => (
    <div data-testid="card-back" data-rarity={rarity}>
      <span>{roastSummary?.archetypeName}</span>
      <span>{roastSummary?.bangerQuote}</span>
    </div>
  ),
}));

jest.mock("@/components/HoloCard", () => ({
  HoloCard: ({ children }: any) => <div data-testid="holo-card">{children}</div>,
  getCardRarity: (score: number) => {
    if (score >= 95) return "gold";
    if (score >= 90) return "rainbow";
    if (score >= 85) return "ultra";
    if (score >= 75) return "rare";
    if (score >= 60) return "uncommon";
    return "common";
  },
}));

// Mock the famous cards data with minimal test data
// Valid PMElement values: "data" | "chaos" | "strategy" | "shipping" | "politics" | "vision"
jest.mock("@/lib/famous-cards", () => ({
  FAMOUS_CARDS: [
    {
      id: "test-card-1",
      name: "Test PM 1",
      title: "CEO",
      company: "TestCorp",
      imageUrl: "/test1.png",
      score: 85,
      archetypeName: "The Tester",
      archetypeEmoji: "🧪",
      archetypeDescription: "Tests everything",
      element: "data",
      moves: [
        { name: "Test Move", energyCost: 2, damage: 50, effect: "Test effect" },
      ],
      stage: "Elite",
      weakness: "Bugs",
      flavor: "Test flavor text",
      bangerQuote: "Test quote",
      naturalRival: "QA Engineers",
      roastBullets: ["Roast 1", "Roast 2", "Roast 3"],
    },
    {
      id: "test-card-2",
      name: "Test PM 2",
      title: "CPO",
      company: "TestInc",
      imageUrl: "/test2.png",
      score: 90,
      archetypeName: "The Builder",
      archetypeEmoji: "🔨",
      archetypeDescription: "Builds stuff",
      element: "shipping",
      moves: [
        { name: "Build Move", energyCost: 3, damage: 60, effect: "Build effect" },
      ],
      stage: "Legendary",
      weakness: "Scope",
      flavor: "Build flavor text",
      bangerQuote: "Build quote",
      naturalRival: "Project Managers",
      roastBullets: ["Build Roast 1", "Build Roast 2"],
    },
    {
      id: "test-card-3",
      name: "Test PM 3",
      title: "PM",
      company: "TestLLC",
      imageUrl: "/test3.png",
      score: 75,
      archetypeName: "The Analyst",
      archetypeEmoji: "📊",
      archetypeDescription: "Analyzes data",
      element: "data",
      moves: [
        { name: "Analyze Move", energyCost: 1, damage: 30, effect: "Analyze effect" },
      ],
      stage: "Senior",
      weakness: "Intuition",
      flavor: "Analyze flavor text",
      bangerQuote: "Analyze quote",
      naturalRival: "Gut-feel PMs",
      roastBullets: ["Analyze Roast 1"],
    },
    {
      id: "test-card-4",
      name: "Test PM 4",
      title: "VP",
      company: "TestGmbH",
      imageUrl: "/test4.png",
      score: 95,
      archetypeName: "The Visionary",
      archetypeEmoji: "🔮",
      archetypeDescription: "Sees the future",
      element: "vision",
      moves: [
        { name: "Vision Move", energyCost: 4, damage: 80, effect: "Vision effect" },
      ],
      stage: "Mythical",
      weakness: "Present",
      flavor: "Vision flavor text",
      bangerQuote: "Vision quote",
      naturalRival: "Realists",
      roastBullets: ["Vision Roast 1", "Vision Roast 2", "Vision Roast 3", "Vision Roast 4"],
    },
    // Add more cards to trigger second row
    {
      id: "test-card-5",
      name: "Test PM 5",
      title: "Director",
      company: "TestAG",
      imageUrl: "/test5.png",
      score: 80,
      archetypeName: "The Strategist",
      archetypeEmoji: "♟️",
      archetypeDescription: "Plans ahead",
      element: "strategy",
      moves: [
        { name: "Strategy Move", energyCost: 2, damage: 45, effect: "Strategy effect" },
      ],
      stage: "Elite",
      weakness: "Tactics",
      flavor: "Strategy flavor text",
      bangerQuote: "Strategy quote",
      naturalRival: "Tacticians",
      roastBullets: ["Strategy Roast 1", "Strategy Roast 2"],
    },
    {
      id: "test-card-6",
      name: "Test PM 6",
      title: "Lead PM",
      company: "TestSA",
      imageUrl: "/test6.png",
      score: 88,
      archetypeName: "The Diplomat",
      archetypeEmoji: "🤝",
      archetypeDescription: "Manages stakeholders",
      element: "politics",
      moves: [
        { name: "Diplomat Move", energyCost: 2, damage: 40, effect: "Diplomat effect" },
      ],
      stage: "Elite",
      weakness: "Conflict",
      flavor: "Diplomat flavor text",
      bangerQuote: "Diplomat quote",
      naturalRival: "Direct Communicators",
      roastBullets: ["Diplomat Roast 1", "Diplomat Roast 2"],
    },
    {
      id: "test-card-7",
      name: "Test PM 7",
      title: "Staff PM",
      company: "TestBV",
      imageUrl: "/test7.png",
      score: 82,
      archetypeName: "The Executor",
      archetypeEmoji: "⚡",
      archetypeDescription: "Gets things done",
      element: "chaos",
      moves: [
        { name: "Execute Move", energyCost: 1, damage: 35, effect: "Execute effect" },
      ],
      stage: "Elite",
      weakness: "Planning",
      flavor: "Execute flavor text",
      bangerQuote: "Execute quote",
      naturalRival: "Planners",
      roastBullets: ["Execute Roast 1"],
    },
    {
      id: "test-card-8",
      name: "Test PM 8",
      title: "Principal PM",
      company: "TestPLC",
      imageUrl: "/test8.png",
      score: 92,
      archetypeName: "The Mentor",
      archetypeEmoji: "🎓",
      archetypeDescription: "Teaches others",
      element: "shipping",
      moves: [
        { name: "Mentor Move", energyCost: 3, damage: 55, effect: "Mentor effect" },
      ],
      stage: "Legendary",
      weakness: "Patience",
      flavor: "Mentor flavor text",
      bangerQuote: "Mentor quote",
      naturalRival: "Self-learners",
      roastBullets: ["Mentor Roast 1", "Mentor Roast 2", "Mentor Roast 3"],
    },
  ],
}));

// Helper to set viewport width
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

describe("FamousCardsGallery Mobile Interactions", () => {
  beforeEach(() => {
    // Reset to desktop by default
    setViewportWidth(1024);
  });

  describe("Mobile Detection", () => {
    it("should detect mobile viewport (< 768px)", async () => {
      setViewportWidth(375); // iPhone width

      render(<FamousCardsGallery />);

      // On mobile, cards should show "Tap to flip" hint
      await waitFor(() => {
        const tapHints = screen.getAllByText("Tap to flip");
        expect(tapHints.length).toBeGreaterThan(0);
      });
    });

    it("should detect desktop viewport (>= 768px)", async () => {
      setViewportWidth(1024); // Desktop width

      render(<FamousCardsGallery />);

      // On desktop, "Tap to flip" should not be visible
      await waitFor(() => {
        const tapHints = screen.queryAllByText("Tap to flip");
        expect(tapHints.length).toBe(0);
      });
    });

    it("should update mobile state on viewport resize", async () => {
      // Start with desktop
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      // Initially no tap hints
      expect(screen.queryAllByText("Tap to flip").length).toBe(0);

      // Resize to mobile
      act(() => {
        setViewportWidth(375);
      });

      // Now tap hints should appear
      await waitFor(() => {
        const tapHints = screen.getAllByText("Tap to flip");
        expect(tapHints.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Mobile Tap Behavior", () => {
    it("should show tap hints on mobile and handle tap interaction", async () => {
      setViewportWidth(375);
      render(<FamousCardsGallery />);

      // Wait for component to detect mobile
      await waitFor(() => {
        expect(screen.getAllByText("Tap to flip").length).toBeGreaterThan(0);
      });

      // Find a card container and verify it's clickable
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      expect(cardContainers.length).toBeGreaterThan(0);

      // On mobile, first tap should not immediately open modal
      // (it should flip card first, then second tap opens modal)
      const firstCard = cardContainers[0];
      fireEvent.click(firstCard);

      // Verify the click was handled (no modal opened on first tap)
      // Note: With mocked framer-motion, we can't test actual rotation
      // but we verify the interaction doesn't crash
      expect(screen.queryByText("Mt. Roastmore Legend")).not.toBeInTheDocument();
    });

    it("should not flip card on hover (mobile) - hover is ignored", async () => {
      setViewportWidth(375);
      render(<FamousCardsGallery />);

      await waitFor(() => {
        expect(screen.getAllByText("Tap to flip").length).toBeGreaterThan(0);
      });

      // Find card container
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      const firstCardContainer = cardContainers[0];

      // On mobile, hover should be ignored (tap-only behavior)
      fireEvent.mouseEnter(firstCardContainer);
      fireEvent.mouseLeave(firstCardContainer);

      // Verify the component still works after hover events
      expect(screen.getAllByText("Tap to flip").length).toBeGreaterThan(0);
    });
  });

  describe("Desktop Hover Behavior", () => {
    it("should respond to hover on desktop (no tap hints shown)", async () => {
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      // On desktop, there should be no "Tap to flip" hints
      await waitFor(() => {
        expect(screen.queryAllByText("Tap to flip").length).toBe(0);
      });

      // Find card container by cursor-pointer class
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      expect(cardContainers.length).toBeGreaterThan(0);

      const firstCardContainer = cardContainers[0];

      // Hover events should be handled on desktop
      fireEvent.mouseEnter(firstCardContainer);
      // Note: With mocked framer-motion, we can't test actual visual flip
      // but we verify hover events don't crash and are processed
      fireEvent.mouseLeave(firstCardContainer);

      // Component should still be functional
      expect(document.querySelectorAll(".group.cursor-pointer").length).toBeGreaterThan(0);
    });

    it("should open modal on click (desktop)", async () => {
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      const firstCardContainer = cardContainers[0];

      // On desktop, click opens modal directly
      fireEvent.click(firstCardContainer);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText("Mt. Roastmore Legend")).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Grid Layout", () => {
    it("should render first row grid with responsive classes", () => {
      render(<FamousCardsGallery />);

      // Find the grid container for first row
      const gridContainers = document.querySelectorAll(".grid");

      // First grid should have responsive column classes
      const firstGrid = gridContainers[0];
      expect(firstGrid).toHaveClass("grid-cols-1");
      expect(firstGrid).toHaveClass("sm:grid-cols-2");
      expect(firstGrid).toHaveClass("md:grid-cols-4");
    });

    it("should render second row grid with responsive classes after pack opened", async () => {
      render(<FamousCardsGallery />);

      // Click the booster pack to reveal second row
      const ripButton = screen.getByText(/Rip Open Pack/i);
      fireEvent.click(ripButton);

      // Wait for second row to appear
      await waitFor(() => {
        const gridContainers = document.querySelectorAll(".grid");
        // After pack opened, there should be a second grid
        expect(gridContainers.length).toBeGreaterThanOrEqual(2);
      });

      // Find the second row grid (after reveal)
      const gridContainers = document.querySelectorAll(".grid");
      const secondGrid = gridContainers[gridContainers.length - 1];

      // Second grid should also have responsive column classes
      expect(secondGrid).toHaveClass("grid-cols-1");
      expect(secondGrid).toHaveClass("sm:grid-cols-2");
      expect(secondGrid).toHaveClass("md:grid-cols-4");
    });
  });

  describe("Card Container Dimensions", () => {
    it("should have responsive max-width classes on card containers", () => {
      render(<FamousCardsGallery />);

      // Find card wrapper divs with max-w classes
      const cardWrappers = document.querySelectorAll(".max-w-\\[300px\\]");
      expect(cardWrappers.length).toBeGreaterThan(0);

      // Each wrapper should have responsive max-width
      cardWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass("max-w-[300px]");
        expect(wrapper).toHaveClass("sm:max-w-none");
      });
    });

    it("should maintain consistent card container structure on interaction", async () => {
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      // Find card containers
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      expect(cardContainers.length).toBeGreaterThan(0);

      const firstCardContainer = cardContainers[0] as HTMLElement;

      // Card container should have perspective style for 3D effect
      expect(firstCardContainer.style.perspective).toBe("1000px");

      // Hover interaction
      fireEvent.mouseEnter(firstCardContainer);
      fireEvent.mouseLeave(firstCardContainer);

      // Container should still have same structure after interaction
      expect(firstCardContainer.style.perspective).toBe("1000px");
      expect(firstCardContainer.classList.contains("group")).toBe(true);
      expect(firstCardContainer.classList.contains("cursor-pointer")).toBe(true);
    });
  });

  describe("Expanded Card View (Modal)", () => {
    it("should open expanded view on card click (desktop)", async () => {
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      // Find and click a card
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      const firstCardContainer = cardContainers[0];

      if (firstCardContainer) {
        fireEvent.click(firstCardContainer);

        // Modal should open with card details
        await waitFor(() => {
          expect(screen.getByText("Mt. Roastmore Legend")).toBeInTheDocument();
        });
      }
    });

    it("should have responsive card dimensions in expanded view", async () => {
      setViewportWidth(375);
      render(<FamousCardsGallery />);

      // Wait for mobile detection
      await waitFor(() => {
        expect(screen.getAllByText("Tap to flip").length).toBeGreaterThan(0);
      });

      // On mobile, first tap flips, second tap opens modal
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      const firstCardContainer = cardContainers[0];

      // First click - flip (doesn't open modal)
      fireEvent.click(firstCardContainer);

      // Second click - open modal
      fireEvent.click(firstCardContainer);
      await waitFor(() => {
        expect(screen.getByText("Mt. Roastmore Legend")).toBeInTheDocument();
      });

      // Find the card container in expanded view - should have responsive classes
      const expandedCardContainer = document.querySelector(".max-w-\\[320px\\]");
      expect(expandedCardContainer).toBeInTheDocument();
      expect(expandedCardContainer).toHaveClass("sm:max-w-[400px]");
    });

    it("should close expanded view on escape key", async () => {
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      // Open modal
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      fireEvent.click(cardContainers[0]);

      await waitFor(() => {
        expect(screen.getByText("Mt. Roastmore Legend")).toBeInTheDocument();
      });

      // Press escape
      fireEvent.keyDown(window, { key: "Escape" });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText("Mt. Roastmore Legend")).not.toBeInTheDocument();
      });
    });

    it("should close expanded view on backdrop click", async () => {
      setViewportWidth(1024);
      render(<FamousCardsGallery />);

      // Open modal
      const cardContainers = document.querySelectorAll(".group.cursor-pointer");
      fireEvent.click(cardContainers[0]);

      await waitFor(() => {
        expect(screen.getByText("Mt. Roastmore Legend")).toBeInTheDocument();
      });

      // Click backdrop (the fixed overlay)
      const backdrop = document.querySelector(".fixed.inset-0.z-50");
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText("Mt. Roastmore Legend")).not.toBeInTheDocument();
      });
    });
  });

  describe("Booster Pack Interaction", () => {
    it("should show booster pack initially", () => {
      render(<FamousCardsGallery />);

      expect(screen.getByText(/Rip Open Pack/i)).toBeInTheDocument();
      expect(screen.getByText("PM ROAST")).toBeInTheDocument();
      expect(screen.getByText("Booster Pack")).toBeInTheDocument();
    });

    it("should reveal second row cards when pack is opened", async () => {
      render(<FamousCardsGallery />);

      const ripButton = screen.getByText(/Rip Open Pack/i);
      fireEvent.click(ripButton);

      // Wait for pack animation to complete and cards to reveal
      await waitFor(
        () => {
          // Should show "legends revealed" text after opening
          expect(screen.getByText(/legends revealed/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });
});
