import { Composition } from 'remotion';
import { TwitterTeaser } from './TwitterTeaser';
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS, DURATION_FRAMES } from './lib/constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TwitterTeaser"
        component={TwitterTeaser}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
