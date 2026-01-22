import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../lib/constants';
import { SCENE_TIMINGS } from '../lib/constants';

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start, end } = SCENE_TIMINGS.cta;

  if (frame < start || frame > end) {
    return null;
  }

  const relativeFrame = frame - start;

  // Main text animation
  const textScale = spring({
    frame: relativeFrame,
    fps,
    config: { stiffness: 120, damping: 12 },
  });

  const textOpacity = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // URL animation (delayed)
  const urlOpacity = interpolate(relativeFrame, [15, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const urlY = interpolate(relativeFrame, [15, 30], [20, 0], {
    extrapolateRight: 'clamp',
  });

  // Button glow pulse
  const glowIntensity = interpolate(
    Math.sin(relativeFrame * 0.3),
    [-1, 1],
    [20, 40]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}
    >
      {/* Get Your Card text */}
      <div
        style={{
          opacity: textOpacity,
          transform: `scale(${textScale})`,
        }}
      >
        <h2
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.white,
            margin: 0,
            textAlign: 'center',
          }}
        >
          Get Your Card
        </h2>
      </div>

      {/* CTA Button */}
      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
        }}
      >
        <div
          style={{
            padding: '20px 60px',
            borderRadius: 12,
            background: COLORS.accent,
            boxShadow: `0 0 ${glowIntensity}px ${COLORS.accent}`,
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: 1,
            }}
          >
            pmroast.com
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: COLORS.textMuted,
            margin: 0,
            marginTop: 16,
          }}
        >
          Free AI Career Coaching
        </p>
      </div>
    </div>
  );
};
