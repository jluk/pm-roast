import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HoloBorder } from '../components/HoloBorder';
import { COLORS, FEATURED_CARDS, SCENE_TIMINGS } from '../lib/constants';

export const HoloShowcaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start, end } = SCENE_TIMINGS.holoShowcase;

  if (frame < start || frame > end) {
    return null;
  }

  const relativeFrame = frame - start;

  // Get the featured card (Demis - highest score)
  const featuredCard = FEATURED_CARDS[0];

  // Card scale animation
  const scale = spring({
    frame: relativeFrame,
    fps,
    config: { stiffness: 80, damping: 12 },
  });

  // Subtle rotation for showcase
  const rotation = interpolate(relativeFrame, [0, 90], [-3, 3]);

  // Scene fade
  const sceneOpacity = interpolate(
    relativeFrame,
    [0, 15, 75, 90],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Glow pulse
  const glowIntensity = interpolate(
    Math.sin(relativeFrame * 0.15),
    [-1, 1],
    [40, 80]
  );

  const cardWidth = 400;
  const cardHeight = 560;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* Main card */}
      <div
        style={{
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <HoloBorder width={cardWidth} height={cardHeight} borderWidth={8}>
          <Img
            src={staticFile(featuredCard.image)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </HoloBorder>
      </div>

      {/* "MYTHICAL" badge */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          opacity: interpolate(relativeFrame, [20, 35], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.gold,
            letterSpacing: 8,
            textShadow: `0 0 20px ${COLORS.gold}`,
          }}
        >
          MYTHICAL PULL
        </div>
      </div>

      {/* Card info */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          textAlign: 'center',
          opacity: interpolate(relativeFrame, [25, 40], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <h3
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
          }}
        >
          {featuredCard.name}
        </h3>
        <p
          style={{
            fontSize: 24,
            color: COLORS.gold,
            margin: 0,
            marginTop: 8,
          }}
        >
          {featuredCard.score} pts
        </p>
      </div>

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 350 + Math.sin(relativeFrame * 0.1 + i) * 20;
        const x = Math.cos(angle + relativeFrame * 0.02) * radius;
        const y = Math.sin(angle + relativeFrame * 0.02) * radius;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 + x,
              top: 540 + y,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: COLORS.gold,
              opacity: 0.6,
              boxShadow: `0 0 10px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </div>
  );
};
