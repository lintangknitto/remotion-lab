import React, {useMemo} from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {getProfile} from '../../styles/profiles/index';
import {resolveTheme} from '../../styles/resolve';
import {ThemeProvider} from '../../styles/react';
import {
  Callout,
  MentionChip,
  NoteChip,
  RefCanvas,
  Redline,
  SeverityTag,
  StatusPill,
  StepBadge,
  TimestampChip,
  type Severity,
  type Status,
  type Tone,
} from '../../components/qa/parts';

/**
 * Anotasi QA. Koordinat dalam PIKSEL kanvas referensi 1920x1080 (bukan fraksi);
 * RefCanvas menskalakannya ke ukuran video. Waktu (from/to) dalam detik.
 * Gaya (warna, font, bentuk) datang dari tema family `qa` lewat style system.
 */
type Timed = {from: number; to: number};

export type QaItem =
  | (Timed & {type: 'box'; x: number; y: number; w: number; h: number; tone?: Tone; label?: string; labelAt?: 'top' | 'bottom'; kind?: 'box' | 'circle' | 'spotlight'})
  | (Timed & {type: 'caption'; x: number; y: number; text: string; size?: number; tone?: Tone})
  | (Timed & {type: 'mention'; x: number; y: number; text: string; size?: number})
  | (Timed & {type: 'step'; x: number; y: number; step: number; total: number; title: string})
  | (Timed & {type: 'severity'; x: number; y: number; level: Severity})
  | (Timed & {type: 'status'; x: number; y: number; status: Status; size?: number})
  | (Timed & {type: 'timestamp'; x: number; y: number; seconds?: number; text?: string})
  | (Timed & {type: 'redline'; x1: number; y1: number; x2: number; y2: number; label?: string; tone?: Tone});

export type QaAnnotateProps = {
  /** path relatif ke public/, mis. "qa/demo.src.mp4" (disalin ke public/qa saat bake) */
  videoSrc: string;
  items: QaItem[];
  /** durasi video sumber (detik); dipakai calculateMetadata untuk durasi komposisi */
  durationSec?: number;
  /** varian tema family qa: dark | light | contrast */
  variant?: string;
};

const Pos: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
  <div style={{position: 'absolute', left: x, top: y}}>{children}</div>
);

const Item: React.FC<{it: QaItem}> = ({it}) => {
  switch (it.type) {
    case 'box':
      return <Callout x={it.x} y={it.y} w={it.w} h={it.h} tone={it.tone ?? 'danger'} label={it.label} labelAt={it.labelAt} kind={it.kind} />;
    case 'caption':
      return (
        <Pos x={it.x} y={it.y}>
          <NoteChip text={it.text} size={it.size} tone={it.tone} />
        </Pos>
      );
    case 'mention':
      return (
        <Pos x={it.x} y={it.y}>
          <MentionChip text={it.text} size={it.size} />
        </Pos>
      );
    case 'step':
      return (
        <Pos x={it.x} y={it.y}>
          <StepBadge step={it.step} total={it.total} title={it.title} />
        </Pos>
      );
    case 'severity':
      return (
        <Pos x={it.x} y={it.y}>
          <SeverityTag level={it.level} />
        </Pos>
      );
    case 'status':
      return (
        <Pos x={it.x} y={it.y}>
          <StatusPill status={it.status} size={it.size} />
        </Pos>
      );
    case 'timestamp':
      return (
        <Pos x={it.x} y={it.y}>
          <TimestampChip seconds={it.seconds} text={it.text} />
        </Pos>
      );
    case 'redline':
      return <Redline from={[it.x1, it.y1]} to={[it.x2, it.y2]} label={it.label} tone={it.tone} />;
  }
};

export const QaAnnotate: React.FC<QaAnnotateProps> = ({videoSrc, items, variant = 'dark'}) => {
  const {fps, width, height} = useVideoConfig();
  const theme = useMemo(() => resolveTheme(getProfile('qa'), {variant, genre: 'bug-report'}), [variant]);

  return (
    <ThemeProvider theme={theme}>
      <AbsoluteFill style={{backgroundColor: theme.color.bg}}>
        <OffthreadVideo src={staticFile(videoSrc)} style={{width, height, objectFit: 'contain'}} />
        <RefCanvas width={width} height={height}>
          {items.map((it, i) => (
            <Sequence key={i} from={Math.round(it.from * fps)} durationInFrames={Math.max(1, Math.round((it.to - it.from) * fps))} layout="none">
              <Item it={it} />
            </Sequence>
          ))}
        </RefCanvas>
      </AbsoluteFill>
    </ThemeProvider>
  );
};
