import React from 'react';
import {Composition, Still} from 'remotion';
import {LaunchVideo, Poster} from './LaunchVideo';
import {StudioProof} from './compositions/studio-proof/StudioProof';
import {CaptionDemo} from './compositions/caption-demo/CaptionDemo';
import {PodcastClip} from './compositions/podcast-clip/PodcastClip';
import {podcastDemo, podcastDemoDuration} from './compositions/podcast-clip/demo';
import {QaAnnotate} from './compositions/qa-annotate/QaAnnotate';
import {KnittoPromo} from './compositions/knitto-promo/KnittoPromo';
import {StyleProof} from './compositions/style-proof/StyleProof';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchVideo"
        component={LaunchVideo}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Still id="Poster" component={Poster} width={1920} height={1080} />
      <Composition
        id="StudioProof"
        component={StudioProof}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CaptionDemo"
        component={CaptionDemo}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PodcastClip"
        component={PodcastClip}
        defaultProps={podcastDemo}
        durationInFrames={podcastDemoDuration}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({props}) => {
          const last = props.words?.[props.words.length - 1];
          const ms = last ? last.endMs + 400 : 0;
          return {durationInFrames: Math.max(30, Math.round((ms / 1000) * 30))};
        }}
      />
      <Composition
        id="KnittoPromo"
        component={KnittoPromo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="StyleProof"
        component={StyleProof}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{family: 'qa', variant: '', genre: '', brand: '', seed: ''}}
      />
      <Composition
        id="QaAnnotate"
        component={QaAnnotate}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{videoSrc: 'qa/demo.mp4', items: [], durationSec: 4}}
        calculateMetadata={({props}) => ({
          durationInFrames: Math.max(30, Math.round((props.durationSec ?? 4) * 30)),
        })}
      />
    </>
  );
};
