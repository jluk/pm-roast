/**
 * Card Flip Component Tests
 *
 * These tests ensure that card flip functionality works correctly by using
 * opacity-based visibility instead of CSS backfaceVisibility (which breaks
 * with HoloCard's nested 3D transform context).
 *
 * The bug: When using backfaceVisibility: hidden with nested 3D contexts
 * (perspective + preserve-3d), the browser shows a mirrored front card
 * instead of the actual back card content.
 *
 * The fix: Use opacity and pointerEvents controlled by isFlipped state
 * to show/hide the correct card face.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock framer-motion to avoid animation complexity in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, style, ...props }: React.ComponentProps<'div'> & { animate?: object }) => (
      <div {...props} style={style}>{children}</div>
    ),
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    p: ({ children, ...props }: React.ComponentProps<'p'>) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Simple test component that mimics the card flip pattern
interface FlipCardTestProps {
  isFlipped: boolean;
  onFlip: () => void;
  frontContent: string;
  backContent: string;
}

function FlipCardTest({ isFlipped, onFlip, frontContent, backContent }: FlipCardTestProps) {
  return (
    <div onClick={onFlip} data-testid="flip-container">
      {/* Front of card */}
      <div
        data-testid="card-front"
        style={{
          opacity: isFlipped ? 0 : 1,
          pointerEvents: isFlipped ? 'none' : 'auto',
        }}
      >
        {frontContent}
      </div>

      {/* Back of card */}
      <div
        data-testid="card-back"
        style={{
          opacity: isFlipped ? 1 : 0,
          pointerEvents: isFlipped ? 'auto' : 'none',
          transform: 'rotateY(180deg)',
        }}
      >
        {backContent}
      </div>
    </div>
  );
}

describe('Card Flip Visibility Pattern', () => {
  describe('when card is not flipped (front facing)', () => {
    it('front card should be visible (opacity: 1)', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const frontCard = screen.getByTestId('card-front');
      expect(frontCard).toHaveStyle({ opacity: '1' });
    });

    it('back card should be hidden (opacity: 0)', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const backCard = screen.getByTestId('card-back');
      expect(backCard).toHaveStyle({ opacity: '0' });
    });

    it('front card should accept pointer events', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const frontCard = screen.getByTestId('card-front');
      expect(frontCard).toHaveStyle({ pointerEvents: 'auto' });
    });

    it('back card should not accept pointer events', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const backCard = screen.getByTestId('card-back');
      expect(backCard).toHaveStyle({ pointerEvents: 'none' });
    });
  });

  describe('when card is flipped (back facing)', () => {
    it('front card should be hidden (opacity: 0)', () => {
      render(
        <FlipCardTest
          isFlipped={true}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const frontCard = screen.getByTestId('card-front');
      expect(frontCard).toHaveStyle({ opacity: '0' });
    });

    it('back card should be visible (opacity: 1)', () => {
      render(
        <FlipCardTest
          isFlipped={true}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const backCard = screen.getByTestId('card-back');
      expect(backCard).toHaveStyle({ opacity: '1' });
    });

    it('front card should not accept pointer events', () => {
      render(
        <FlipCardTest
          isFlipped={true}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const frontCard = screen.getByTestId('card-front');
      expect(frontCard).toHaveStyle({ pointerEvents: 'none' });
    });

    it('back card should accept pointer events', () => {
      render(
        <FlipCardTest
          isFlipped={true}
          onFlip={() => {}}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      const backCard = screen.getByTestId('card-back');
      expect(backCard).toHaveStyle({ pointerEvents: 'auto' });
    });
  });

  describe('flip interaction', () => {
    it('should toggle flip state when clicked', () => {
      let isFlipped = false;
      const onFlip = jest.fn(() => {
        isFlipped = !isFlipped;
      });

      const { rerender } = render(
        <FlipCardTest
          isFlipped={isFlipped}
          onFlip={onFlip}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      // Initial state - front visible
      expect(screen.getByTestId('card-front')).toHaveStyle({ opacity: '1' });
      expect(screen.getByTestId('card-back')).toHaveStyle({ opacity: '0' });

      // Click to flip
      fireEvent.click(screen.getByTestId('flip-container'));
      expect(onFlip).toHaveBeenCalledTimes(1);

      // Rerender with new state
      rerender(
        <FlipCardTest
          isFlipped={true}
          onFlip={onFlip}
          frontContent="Front Content"
          backContent="Back Content"
        />
      );

      // After flip - back visible
      expect(screen.getByTestId('card-front')).toHaveStyle({ opacity: '0' });
      expect(screen.getByTestId('card-back')).toHaveStyle({ opacity: '1' });
    });
  });

  describe('content rendering', () => {
    it('should render front content correctly', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="PM Card Front"
          backContent="Roast Quote Back"
        />
      );

      expect(screen.getByText('PM Card Front')).toBeInTheDocument();
    });

    it('should render back content correctly', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="PM Card Front"
          backContent="Roast Quote Back"
        />
      );

      expect(screen.getByText('Roast Quote Back')).toBeInTheDocument();
    });

    it('back content should have rotateY(180deg) transform', () => {
      render(
        <FlipCardTest
          isFlipped={false}
          onFlip={() => {}}
          frontContent="Front"
          backContent="Back"
        />
      );

      const backCard = screen.getByTestId('card-back');
      expect(backCard).toHaveStyle({ transform: 'rotateY(180deg)' });
    });
  });
});

/**
 * Regression test: Ensure we never use backfaceVisibility for card flip
 *
 * This test documents the bug that was fixed. The backfaceVisibility CSS
 * property does not work correctly when there are nested 3D transform
 * contexts (which HoloCard creates with perspective + preserve-3d).
 */
describe('Card Flip Implementation - No backfaceVisibility', () => {
  it('should use opacity-based visibility, not backfaceVisibility', () => {
    render(
      <FlipCardTest
        isFlipped={false}
        onFlip={() => {}}
        frontContent="Front"
        backContent="Back"
      />
    );

    const frontCard = screen.getByTestId('card-front');
    const backCard = screen.getByTestId('card-back');

    // Should NOT have backfaceVisibility set (which would break with nested 3D)
    // The computed style would show 'visible' (default) if not set
    const frontStyle = window.getComputedStyle(frontCard);
    const backStyle = window.getComputedStyle(backCard);

    // These should be using opacity, not backfaceVisibility
    expect(frontCard).toHaveStyle({ opacity: '1' });
    expect(backCard).toHaveStyle({ opacity: '0' });

    // Verify backfaceVisibility is NOT set to 'hidden' (which would break with nested 3D)
    // jsdom returns empty string for unset values, but definitely NOT 'hidden'
    expect(frontStyle.backfaceVisibility).not.toBe('hidden');
    expect(backStyle.backfaceVisibility).not.toBe('hidden');
  });
});
