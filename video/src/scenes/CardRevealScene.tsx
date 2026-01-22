import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HoloBorder } from '../components/HoloBorder';
import { COLORS, FEATURED_CARDS, SCENE_TIMINGS } from '../lib/constants';

export const CardRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start, end } = SCENE_TIMINGS.cardReveal;

  if (frame < start || frame > end) {
    return null;
  }

  const relativeFrame = frame - start;

  // Cards appear with stagger (15 frames = 0.5s between each)
  const staggerDelay = 15;
  const cardWidth = 300;
  const cardHeight = 420;
  const gap = 40;
  const totalWidth = 4 * cardWidth + 3 * gap;
  const startX = (1920 - totalWidth) / 2;

  // Scene fade in/out
  const sceneOpacity = interpolate(
    relativeFrame,
    [0, 15, 160, 180],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

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
      {/* Cards container */}
      <div
        style={{
          display: 'flex',
          gap,
        }}
      >
        {FEATURED_CARDS.map((card, index) => {
          const cardStartFrame = index * staggerDelay;
          const cardRelativeFrame = relativeFrame - cardStartFrame;

          if (cardRelativeFrame < 0) {
            return (
              <div
                key={card.id}
                style={{ width: cardWidth, height: cardHeight }}
              />
            );
          }

          // Card flip animation (rotateY from 180 to 0)
          const flipProgress = spring({
            frame: cardRelativeFrame,
            fps,
            config: { stiffness: 100, damping: 12 },
          });

          const rotateY = interpolate(flipProgress, [0, 1], [180, 0]);

          // Scale bounce
          const scale = spring({
            frame: cardRelativeFrame,
            fps,
            config: { stiffness: 150, damping: 10 },
          });

          // Fly in from bottom
          const translateY = interpolate(
            cardRelativeFrame,
            [0, 20],
            [200, 0],
            { extrapolateRight: 'clamp' }
          );

          // Opacity
          const cardOpacity = interpolate(cardRelativeFrame, [0, 10], [0, 1], {
            extrapolateRight: 'clamp',
          });

          // High score cards get holo border
          const isHolo = card.score >= 90;

          const cardContent = (
            <Img
              src={staticFile(card.image)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          );

          return (
            <div
              key={card.id}
              style={{
                width: cardWidth,
                height: cardHeight,
                opacity: cardOpacity,
                transform: `translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
                perspective: 1000,
              }}
            >
              {isHolo ? (
                <HoloBorder width={cardWidth} height={cardHeight}>
                  {cardContent}
                </HoloBorder>
              ) : (
                <div
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: `0 10px 40px rgba(0,0,0,0.5)`,
                  }}
                >
                  {cardContent}
                </div>
              )}

              {/* Card name and score badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -50,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  opacity: interpolate(cardRelativeFrame, [20, 35], [0, 1], {
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.white,
                    margin: 0,
                  }}
                >
                  {card.name}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: card.score >= 90 ? COLORS.gold : COLORS.textMuted,
                    margin: 0,
                    marginTop: 4,
                  }}
                >
                  {card.score} pts - {card.rarity}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
