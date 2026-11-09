import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { TOTAL_FRAMES } from './data/scriptData';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GeoGlobeTales"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
