import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BoosterPack } from '../components/BoosterPack';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { COLORS, SCENE_TIMINGS } from '../lib/constants';

export const PackOpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start, end } = SCENE_TIMINGS.packOpen;

  if (frame < start || frame > end) {
    return null;
  }

  const relativeFrame = frame - start;

  // Packs slide in from sides
  const slideProgress = spring({
    frame: relativeFrame,
    fps,
    config: { stiffness: 80, damping: 15 },
  });

  const chaosPackX = interpolate(slideProgress, [0, 1], [-200, 640]);
  const svPackX = interpolate(slideProgress, [0, 1], [2120, 1280]);

  // "Choose your pack" text
  const textOpacity = interpolate(relativeFrame, [30, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Selection happens at frame 90 (3 seconds in)
  const selectionFrame = 90;
  const isSelected = relativeFrame >= selectionFrame;
  const svSelected = isSelected; // We'll select SV pack

  // Explosion/burst at selection
  const burstFrame = start + selectionFrame;

  // Non-selected pack fades and moves out
  const chaosOpacity = interpolate(
    relativeFrame,
    [selectionFrame, selectionFrame + 20],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const chaosSlideOut = interpolate(
    relativeFrame,
    [selectionFrame, selectionFrame + 20],
    [0, -300],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Selected pack moves to center and scales up
  const svCenterX = interpolate(
    relativeFrame,
    [selectionFrame, selectionFrame + 30],
    [1280, 960],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out entire scene
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
        opacity: sceneOpacity,
      }}
    >
      {/* Choose your pack text */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          width: '100%',
          textAlign: 'center',
          opacity: textOpacity,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
          }}
        >
          Choose Your Pack
        </h2>
      </div>

      {/* Chaos Pack */}
      <div
        style={{
          opacity: chaosOpacity,
          transform: `translateX(${chaosSlideOut}px)`,
        }}
      >
        <BoosterPack
          type="chaos"
          x={chaosPackX}
          y={540}
          animationStart={start}
        />
      </div>

      {/* SV Pack */}
      <BoosterPack
        type="sv"
        x={isSelected ? svCenterX : svPackX}
        y={540}
        isSelected={svSelected}
        animationStart={start}
      />

      {/* Confetti burst on selection */}
      <ConfettiBurst
        startFrame={burstFrame}
        duration={45}
        particleCount={50}
        centerX={svCenterX}
        centerY={540}
      />

      {/* "SV PACK SELECTED" text after selection */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: 150,
            width: '100%',
            textAlign: 'center',
            opacity: interpolate(
              relativeFrame,
              [selectionFrame + 10, selectionFrame + 25],
              [0, 1],
              { extrapolateRight: 'clamp' }
            ),
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#3b82f6',
              margin: 0,
              letterSpacing: 4,
            }}
          >
            NERDY PULL!
          </p>
        </div>
      )}
    </div>
  );
};
