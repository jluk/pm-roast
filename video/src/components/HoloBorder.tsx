import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../lib/constants';

interface HoloBorderProps {
  width: number;
  height: number;
  borderWidth?: number;
  children: React.ReactNode;
}

export const HoloBorder: React.FC<HoloBorderProps> = ({
  width,
  height,
  borderWidth = 6,
  children,
}) => {
  const frame = useCurrentFrame();

  // Animate gradient angle from 0 to 360 degrees over 60 frames (2 seconds)
  const angle = interpolate(frame % 60, [0, 60], [0, 360]);

  const rainbowGradient = `linear-gradient(${angle}deg,
    #ff0000,
    #ff8000,
    #ffff00,
    #00ff00,
    #00ffff,
    #0080ff,
    #8000ff,
    #ff0080,
    #ff0000
  )`;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: 16,
        padding: borderWidth,
        background: rainbowGradient,
        boxShadow: `0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(255, 255, 255, 0.2)`,
      }}
    >
      <div
        style={{
          width: width - borderWidth * 2,
          height: height - borderWidth * 2,
          borderRadius: 12,
          overflow: 'hidden',
          background: COLORS.background,
        }}
      >
        {children}
      </div>
    </div>
  );
};
