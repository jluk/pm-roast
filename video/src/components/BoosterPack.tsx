import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../lib/constants';

interface BoosterPackProps {
  type: 'chaos' | 'sv';
  x: number;
  y: number;
  isSelected?: boolean;
  animationStart?: number;
}

export const BoosterPack: React.FC<BoosterPackProps> = ({
  type,
  x,
  y,
  isSelected = false,
  animationStart = 0,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - animationStart;

  const packColors = {
    chaos: {
      primary: '#ef4444',
      secondary: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.5)',
      emoji: '',
      label: 'CHAOS PACK',
    },
    sv: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      glow: 'rgba(59, 130, 246, 0.5)',
      emoji: '',
      label: 'SV PACK',
    },
  };

  const config = packColors[type];

  // Shimmer animation
  const shimmerPosition = interpolate(
    relativeFrame % 60,
    [0, 60],
    [-100, 200]
  );

  // Selection scale
  const scale = isSelected
    ? interpolate(relativeFrame, [0, 10], [1, 1.15], { extrapolateRight: 'clamp' })
    : 1;

  // Glow intensity for selected
  const glowIntensity = isSelected ? 40 : 20;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: 200,
        height: 280,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${config.primary}, ${config.secondary})`,
        boxShadow: `0 0 ${glowIntensity}px ${config.glow}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      {/* Shimmer effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${shimmerPosition}%`,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          transform: 'skewX(-20deg)',
        }}
      />

      {/* Pack content */}
      <div style={{ fontSize: 64, zIndex: 1 }}>{config.emoji}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: 2,
          zIndex: 1,
        }}
      >
        {config.label}
      </div>

      {/* Border */}
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: `2px solid rgba(255,255,255,0.3)`,
        }}
      />
    </div>
  );
};
