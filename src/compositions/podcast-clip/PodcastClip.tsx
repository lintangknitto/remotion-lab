import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';
import {assetSrc} from '../../lib/assets';
import {FilmGrain, Vignette} from '../../components/effects';
import {CLAMP} from '../../components/effects/util';
import {TimedCaption} from './TimedCaption';
import {Waveform} from './Waveform';
import type {PodcastClipProps} from './types';

const SEGMENT_MS = 5200;

const timecode = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Vertical podcast clip: b-roll, spectrum from the real audio, captions driven
 * by word timings, progress bar. All content is props — swap them per episode.
 */
export const PodcastClip: React.FC<PodcastClipProps> = ({
  show,
  episode,
  speaker,
  audio,
  audioTrimBefore = 0,
  broll,
  words,
  accent = '#7C5CFF',
  music,
  peaks,
  sfx = [],
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();

  const ms = (frame / fps) * 1000;
  const durationMs = (durationInFrames / fps) * 1000;
  const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1));

  const segment = Math.min(broll.length - 1, Math.floor(ms / SEGMENT_MS));
  const next = Math.min(broll.length - 1, segment + 1);
  const local = (ms % SEGMENT_MS) / SEGMENT_MS;
  const blend = interpolate(local, [0.7, 1], [0, 1], CLAMP);

  const kenBurns = (offset: number) =>
    interpolate(ms % (SEGMENT_MS * 2), [0, SEGMENT_MS * 2], [1.04 + offset, 1.14 + offset], {
      ...CLAMP,
    });

  return (
    <AbsoluteFill style={{backgroundColor: '#05060F'}}>
      <Img
        src={assetSrc('image.gradient.dark-01')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
      />

      <AbsoluteFill style={{padding: '72px 64px'}}>
        {/* header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <div
              style={{
                fontFamily: 'Segoe UI, Inter, system-ui, sans-serif',
                fontSize: 34,
                fontWeight: 800,
                color: '#F4F6FF',
                letterSpacing: '-0.01em',
              }}
            >
              {show}
            </div>
            <div
              style={{
                fontFamily: 'Cascadia Code, Consolas, monospace',
                fontSize: 20,
                color: '#8A93B2',
                marginTop: 6,
                letterSpacing: '0.16em',
              }}
            >
              {episode}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 18px 10px 12px',
              borderRadius: 99,
              background: 'rgba(10,14,28,0.72)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 99,
                background: `linear-gradient(135deg, ${accent}, #22D3EE)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Segoe UI, Inter, system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 22,
                color: '#fff',
              }}
            >
              {speaker.slice(0, 1)}
            </div>
            <div
              style={{
                fontFamily: 'Segoe UI, Inter, system-ui, sans-serif',
                fontSize: 22,
                color: '#F4F6FF',
              }}
            >
              {speaker}
            </div>
          </div>
        </div>

        {/* b-roll card */}
        <div
          style={{
            position: 'relative',
            marginTop: 34,
            height: 900,
            borderRadius: 28,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: `0 40px 120px ${accent}33`,
          }}
        >
          <Img
            src={assetSrc(broll[segment])}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(1.18) saturate(1.06)',
              transform: `scale(${kenBurns(0)})`,
            }}
          />
          {next !== segment ? (
            <Img
              src={assetSrc(broll[next])}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(1.18) saturate(1.06)',
                opacity: blend,
                transform: `scale(${kenBurns(0.02)})`,
              }}
            />
          ) : null}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(5,6,15,0.15) 0%, rgba(5,6,15,0) 45%, rgba(5,6,15,0.85) 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 28,
              bottom: 24,
              fontFamily: 'Cascadia Code, Consolas, monospace',
              fontSize: 18,
              letterSpacing: '0.18em',
              color: 'rgba(244,246,255,0.72)',
            }}
          >
            REC · B-ROLL
          </div>
        </div>

        {/* spectrum + captions live together so they never drift apart */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 48,
            paddingTop: 20,
          }}
        >
          <div style={{width: '100%'}}>
            {peaks?.length ? (
              <Waveform peaks={peaks} height={132} color="#F4F6FF" bars={64} gap={6} />
            ) : null}
          </div>

          <div style={{height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <TimedCaption
              words={words}
              startFrame={0}
              accent={accent}
              fontSize={62}
              maxWidth={940}
            />
          </div>
        </div>

        {/* progress + timecode */}
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
            <span
              style={{
                fontFamily: 'Cascadia Code, Consolas, monospace',
                fontSize: 18,
                color: '#8A93B2',
              }}
            >
              {timecode(ms)}
            </span>
            <span
              style={{
                fontFamily: 'Cascadia Code, Consolas, monospace',
                fontSize: 18,
                color: '#8A93B2',
              }}
            >
              {timecode(durationMs)}
            </span>
          </div>
          <div style={{height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.12)'}}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                borderRadius: 99,
                background: `linear-gradient(90deg, ${accent}, #22D3EE)`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      <FilmGrain opacity={0.22} />
      <Vignette opacity={0.55} />

      <Audio src={assetSrc(audio)} trimBefore={audioTrimBefore} />
      {music ? <Audio src={assetSrc(music)} loop volume={0.09} /> : null}
      {sfx.map((cue, i) => (
        <Sequence key={`${cue.id}-${i}`} from={Math.round((cue.atMs / 1000) * fps)} layout="none">
          <Audio src={assetSrc(cue.id)} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
