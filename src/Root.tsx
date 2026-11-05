import {Composition} from 'remotion';
import {SemaloopAd, DURATION, FPS} from './SemaloopAd';

export const RemotionRoot = () => (
  <Composition id="SemaloopAd" component={SemaloopAd} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
