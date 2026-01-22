import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, SCENE_TIMINGS } from '../lib/constants';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start, end } = SCENE_TIMINGS.intro;

  if (frame < start || frame > end) {
    return null;
  }

  const relativeFrame = frame - start;

  // Logo animation
  const logoScale = spring({
    frame: relativeFrame,
    fps,
    config: { stiffness: 100, damping: 12 },
  });

  const logoOpacity = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline animation (delayed)
  const taglineOpacity = interpolate(relativeFrame, [20, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const taglineY = interpolate(relativeFrame, [20, 35], [20, 0], {
    extrapolateRight: 'clamp',
  });

  // Fade out at end
  const fadeOut = interpolate(relativeFrame, [70, 89], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        opacity: fadeOut,
      }}
    >
      {/* PM ROAST logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <span style={{ fontSize: 72 }}></span>
        <h1
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: COLORS.white,
            letterSpacing: -2,
            margin: 0,
          }}
        >
          PM ROAST
        </h1>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 36,
            color: COLORS.textMuted,
            margin: 0,
            fontWeight: 500,
          }}
        >
          Brutally Honest Career Coaching
        </p>
      </div>

      {/* Accent underline */}
      <div
        style={{
          width: interpolate(relativeFrame, [30, 50], [0, 400], {
            extrapolateRight: 'clamp',
          }),
          height: 4,
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          borderRadius: 2,
          marginTop: 8,
        }}
      />
    </div>
  );
};
