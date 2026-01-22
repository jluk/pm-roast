import { AbsoluteFill } from 'remotion';
import { COLORS } from './lib/constants';
import { IntroScene } from './scenes/IntroScene';
import { LoaderScene } from './scenes/LoaderScene';
import { PackOpenScene } from './scenes/PackOpenScene';
import { CardRevealScene } from './scenes/CardRevealScene';
import { HoloShowcaseScene } from './scenes/HoloShowcaseScene';
import { CTAScene } from './scenes/CTAScene';

export const TwitterTeaser: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: 'Geist, system-ui, sans-serif',
      }}
    >
      <IntroScene />
      <LoaderScene />
      <PackOpenScene />
      <CardRevealScene />
      <HoloShowcaseScene />
      <CTAScene />
    </AbsoluteFill>
  );
};
