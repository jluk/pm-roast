import { interpolate, useCurrentFrame } from 'remotion';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
  rotation: number;
}

interface ConfettiBurstProps {
  startFrame: number;
  duration?: number;
  particleCount?: number;
  centerX?: number;
  centerY?: number;
}

const CONFETTI_COLORS = [
  '#ff0000',
  '#ff8000',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0080ff',
  '#8000ff',
  '#ff0080',
  '#ffd700',
];

// Deterministic random based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  startFrame,
  duration = 45,
  particleCount = 40,
  centerX = 960,
  centerY = 540,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > duration) {
    return null;
  }

  // Generate particles deterministically
  const particles: ConfettiParticle[] = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: centerX,
    y: centerY,
    angle: (i / particleCount) * Math.PI * 2 + seededRandom(i) * 0.5,
    speed: 8 + seededRandom(i + 100) * 12,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 8 + seededRandom(i + 200) * 12,
    rotation: seededRandom(i + 300) * 360,
  }));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle) => {
        const progress = relativeFrame / duration;
        const distance = particle.speed * relativeFrame;
        const gravity = 0.3 * relativeFrame * relativeFrame * 0.01;

        const x = particle.x + Math.cos(particle.angle) * distance;
        const y = particle.y + Math.sin(particle.angle) * distance + gravity;

        const opacity = interpolate(progress, [0, 0.7, 1], [1, 1, 0]);
        const scale = interpolate(progress, [0, 0.2, 1], [0, 1, 0.5]);
        const rotation = particle.rotation + relativeFrame * 10;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: seededRandom(particle.id + 400) > 0.5 ? '50%' : '2px',
              opacity,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};
