import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, LOADER_STAGES, SCENE_TIMINGS } from '../lib/constants';

export const LoaderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start, end } = SCENE_TIMINGS.loader;

  if (frame < start || frame > end) {
    return null;
  }

  const relativeFrame = frame - start;
  const sceneDuration = end - start; // 120 frames
  const stageCount = LOADER_STAGES.length; // 6
  const framesPerStage = sceneDuration / stageCount; // 20 frames per stage

  // Determine current stage
  const currentStageIndex = Math.min(
    Math.floor(relativeFrame / framesPerStage),
    stageCount - 1
  );
  const currentStage = LOADER_STAGES[currentStageIndex];

  // Progress within current stage
  const stageProgress = (relativeFrame % framesPerStage) / framesPerStage;

  // Overall progress bar
  const overallProgress = relativeFrame / sceneDuration;

  // Card entrance animation
  const cardScale = spring({
    frame: relativeFrame % framesPerStage,
    fps,
    config: { stiffness: 200, damping: 15 },
  });

  // Fade in/out for scene
  const sceneOpacity = interpolate(
    relativeFrame,
    [0, 10, sceneDuration - 15, sceneDuration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Mini card shimmer position
  const shimmerX = interpolate(relativeFrame % 30, [0, 30], [-50, 150]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        opacity: sceneOpacity,
      }}
    >
      {/* Mini card display */}
      <div
        style={{
          width: 240,
          height: 340,
          borderRadius: 16,
          background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 0 40px rgba(99, 102, 241, 0.3)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          transform: `scale(${cardScale})`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Shimmer effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${shimmerX}%`,
            width: '40%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
            transform: 'skewX(-20deg)',
          }}
        />

        {/* Stage emoji */}
        <div style={{ fontSize: 64, zIndex: 1 }}>{currentStage.emoji}</div>

        {/* Stage label */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: COLORS.white,
            zIndex: 1,
          }}
        >
          {currentStage.label}
        </div>

        {/* Stage dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
          }}
        >
          {LOADER_STAGES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i <= currentStageIndex ? COLORS.accent : '#333',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 300,
          height: 6,
          borderRadius: 3,
          background: '#222',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${overallProgress * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${COLORS.accent}, #818cf8)`,
            borderRadius: 3,
          }}
        />
      </div>

      {/* Analyzing text */}
      <div
        style={{
          fontSize: 24,
          color: COLORS.textMuted,
          fontWeight: 500,
        }}
      >
        Analyzing your career DNA...
      </div>
    </div>
  );
};
