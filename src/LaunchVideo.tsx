import React from 'react';
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';
import {
  Background,
  BG,
  CLAMP,
  CORAL,
  CYAN,
  INK,
  MUTED,
  mono,
  ProgressRail,
  sans,
  Scene,
  useSpringIn,
  VIOLET,
} from './Background';

/* ------------------------------------------------------------------ */
/* 01 — Intro                                                          */
/* ------------------------------------------------------------------ */

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const letters = 'REMOTION'.split('');
  const subtitle = spring({
    frame,
    fps,
    delay: 36,
    durationInFrames: 26,
    config: {damping: 20, stiffness: 90},
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 96,
          width: '100%',
          textAlign: 'center',
          fontFamily: mono,
          fontSize: 20,
          letterSpacing: '0.44em',
          color: MUTED,
          opacity: interpolate(frame, [0, 16], [0, 1], CLAMP),
        }}
      >
        REACT · FRAMES · MP4
      </div>

      <AbsoluteFill
        style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}
      >
        <div style={{display: 'flex'}}>
          {letters.map((letter, i) => {
            const p = spring({
              frame,
              fps,
              delay: i * 3,
              durationInFrames: 28,
              config: {damping: 13, stiffness: 110, mass: 0.7},
            });
            return (
              <span
                key={i}
                style={{
                  fontFamily: sans,
                  fontWeight: 800,
                  fontSize: 208,
                  lineHeight: 1,
                  color: INK,
                  display: 'inline-block',
                  transform: `translateY(${interpolate(p, [0, 1], [150, 0])}px) rotate(${interpolate(p, [0, 1], [-7, 0])}deg)`,
                  opacity: p,
                  textShadow: '0 0 90px rgba(124,92,255,0.45)',
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        <div
          style={{
            height: 6,
            width: 880,
            marginTop: 28,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${VIOLET}, ${CYAN})`,
            transform: `scaleX(${spring({
              frame,
              fps,
              delay: 20,
              durationInFrames: 22,
              config: {damping: 18},
            })})`,
          }}
        />

        <div
          style={{
            marginTop: 36,
            fontSize: 42,
            fontFamily: sans,
            color: '#C9D0F0',
            opacity: subtitle,
            transform: `translateY(${interpolate(subtitle, [0, 1], [24, 0])}px)`,
          }}
        >
          A video is a function of images over time.
        </div>
      </AbsoluteFill>

      <ProgressRail label="01 — INTRO" />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 02 — The core idea                                                  */
/* ------------------------------------------------------------------ */

type Token = {t: string; c: string};
const KEY = '#C792EA';
const FN = '#82AAFF';
const STR = '#FFCB6B';
const TXT = '#C9D0F0';
const OP = '#89DDFF';

const CODE: Token[][] = [
  [{t: 'const ', c: KEY}, {t: 'frame', c: TXT}, {t: ' = ', c: TXT}, {t: 'useCurrentFrame', c: FN}, {t: '();', c: TXT}],
  [{t: 'const ', c: KEY}, {t: '{ fps }', c: TXT}, {t: ' = ', c: TXT}, {t: 'useVideoConfig', c: FN}, {t: '();', c: TXT}],
  [],
  [{t: 'const ', c: KEY}, {t: 'scale', c: TXT}, {t: ' = ', c: TXT}, {t: 'spring', c: FN}, {t: '({ frame, fps });', c: TXT}],
  [],
  [{t: 'return', c: KEY}, {t: ' (', c: TXT}],
  [{t: '  <', c: OP}, {t: 'div', c: CORAL}, {t: ' style', c: KEY}, {t: '={{ scale }}>', c: TXT}],
  [{t: '    <', c: OP}, {t: 'h1', c: CORAL}, {t: '>', c: OP}, {t: 'Hello, video.', c: STR}, {t: '</', c: OP}, {t: 'h1', c: CORAL}, {t: '>', c: OP}],
  [{t: '  </', c: OP}, {t: 'div', c: CORAL}, {t: '>', c: OP}],
  [{t: ');', c: TXT}],
];

const CodePanel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: 820,
        borderRadius: 20,
        background: 'rgba(10,14,28,0.88)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {[CORAL, '#FFCB6B', '#7BD88F'].map((c) => (
          <div key={c} style={{width: 14, height: 14, borderRadius: 99, background: c, opacity: 0.85}} />
        ))}
        <div style={{marginLeft: 12, fontFamily: mono, fontSize: 17, color: MUTED}}>
          LaunchVideo.tsx
        </div>
      </div>

      <div style={{padding: '28px 30px', fontFamily: mono, fontSize: 25, lineHeight: 1.62}}>
        {CODE.map((line, i) => {
          const appear = spring({
            frame,
            fps: 30,
            delay: 12 + i * 6,
            durationInFrames: 18,
            config: {damping: 20, stiffness: 120},
          });
          if (line.length === 0) {
            return <div key={i} style={{height: 25}} />;
          }
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 20,
                opacity: appear,
                transform: `translateX(${interpolate(appear, [0, 1], [-14, 0])}px)`,
                whiteSpace: 'pre',
              }}
            >
              <span style={{width: 18, color: '#3D4766', fontSize: 19, textAlign: 'right'}}>
                {i + 1}
              </span>
              <span>
                {line.map((token, j) => (
                  <span key={j} style={{color: token.c}}>
                    {token.t}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** One independent frame preview: same component, frozen on frame `f`. */
const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = (frame % 60) / 60 * Math.PI * 2;

  const rx = 104;
  const ry = 68;

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: rx * 2 + 46,
          height: ry * 2 + 40,
          marginLeft: -(rx + 23),
          marginTop: -(ry + 20),
          borderRadius: '50%',
          border: '1px dashed rgba(255,255,255,0.16)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
          boxShadow: '0 0 34px rgba(124,92,255,0.9)',
          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * rx}px, ${Math.sin(angle) * ry}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 13,
          height: 13,
          borderRadius: 3,
          background: CORAL,
          opacity: 0.9,
          transform: `translate(-50%, -50%) translate(${Math.cos(angle + Math.PI) * 44}px, ${Math.sin(angle + Math.PI) * 30}px) rotate(${frame * 6}deg)`,
        }}
      />
    </div>
  );
};

const FilmFrame: React.FC<{f: number; index: number}> = ({f, index}) => {
  const frame = useCurrentFrame();
  const appear = spring({
    frame,
    fps: 30,
    delay: 44 + index * 9,
    durationInFrames: 26,
    config: {damping: 15, stiffness: 110},
  });

  return (
    <div
      style={{
        width: 320,
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [50, 0])}px)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 214,
          borderRadius: 14,
          background: '#080C1A',
          border: '1px solid rgba(255,255,255,0.10)',
          overflow: 'hidden',
        }}
      >
        <Freeze frame={f}>
          <Orbit />
        </Freeze>
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: mono,
          fontSize: 17,
          color: MUTED,
        }}
      >
        frame = {f}
      </div>
    </div>
  );
};

const CoreIdea: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{padding: '118px 96px 110px'}}>
      <div style={{marginBottom: 40}}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 56,
            fontWeight: 700,
            color: INK,
            letterSpacing: '-0.01em',
          }}
        >
          Same component. Different frame number.
        </div>
        <div style={{marginTop: 14, fontFamily: sans, fontSize: 27, color: MUTED}}>
          Remotion renders your React tree once per frame, then screenshots it.
        </div>
      </div>

      <div style={{display: 'flex', gap: 56, alignItems: 'flex-start', justifyContent: 'space-between'}}>
        <CodePanel />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 320px',
            gap: 24,
            opacity: interpolate(frame, [30, 42], [0, 1], CLAMP),
          }}
        >
          {[0, 20, 40, 60].map((f, i) => (
            <FilmFrame key={f} f={f} index={i} />
          ))}
        </div>
      </div>

      <ProgressRail label="02 — CORE IDEA" />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 03 — Render                                                         */
/* ------------------------------------------------------------------ */

const TerminalLine: React.FC<{
  text: string;
  color: string;
  start: number;
  size?: number;
}> = ({text, color, start, size = 30}) => {
  const frame = useCurrentFrame();
  const chars = Math.round(
    interpolate(frame, [start, start + 22], [0, text.length], CLAMP),
  );

  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: size,
        color,
        whiteSpace: 'pre',
        minHeight: size * 1.5,
      }}
    >
      {text.slice(0, chars)}
      {chars > 0 && chars < text.length ? (
        <span style={{opacity: 1}}>▌</span>
      ) : null}
    </div>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpringIn(4, {damping: 20, stiffness: 80});
  const head = useSpringIn(0, {damping: 22, stiffness: 70});

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingTop: 40,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: 46,
          opacity: head,
          transform: `translateY(${interpolate(head, [0, 1], [34, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 66,
            fontWeight: 700,
            color: INK,
            letterSpacing: '-0.01em',
          }}
        >
          Component in. MP4 out.
        </div>
        <div style={{marginTop: 14, fontFamily: sans, fontSize: 27, color: MUTED}}>
          Headless Chrome paints every frame, FFmpeg stitches them together.
        </div>
      </div>

      <div
        style={{
          width: 1180,
          borderRadius: 22,
          background: 'rgba(8,12,24,0.9)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 50px 140px rgba(0,0,0,0.6)',
          padding: '34px 40px',
          opacity: card,
          transform: `translateY(${interpolate(card, [0, 1], [60, 0])}px)`,
        }}
      >
        <div style={{display: 'flex', gap: 10, marginBottom: 26}}>
          {[CORAL, '#FFCB6B', '#7BD88F'].map((c) => (
            <div key={c} style={{width: 15, height: 15, borderRadius: 99, background: c, opacity: 0.85}} />
          ))}
          <div style={{marginLeft: 12, fontFamily: mono, fontSize: 17, color: MUTED}}>
            powershell — remotion-lab
          </div>
        </div>

        <TerminalLine text="npx create-video@latest" color="#E8ECFF" start={10} />
        <TerminalLine text="npx remotion render LaunchVideo out/launch.mp4" color="#E8ECFF" start={26} />
        <div style={{height: 16}} />
        <TerminalLine
          text="✔ out/launch.mp4   1920x1080 · 30fps · 360 frames · 12s"
          color="#7BD88F"
          start={50}
          size={24}
        />
      </div>

      <div
        style={{
          marginTop: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          opacity: interpolate(frame, [64, 78], [0, 1], CLAMP),
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 34,
            color: '#fff',
          }}
        >
          R
        </div>
        <div style={{fontFamily: sans, fontSize: 40, color: INK}}>
          Render. Ship. Repeat.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 120,
          fontFamily: mono,
          fontSize: 20,
          letterSpacing: '0.24em',
          color: MUTED,
          opacity: interpolate(frame, [78, 92], [0, 1], CLAMP),
        }}
      >
        REMOTION.DEV
      </div>

      <ProgressRail label="03 — RENDER" />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Root composition                                                    */
/* ------------------------------------------------------------------ */

export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Background />
      <Scene from={0} to={110}>
        <Intro />
      </Scene>
      <Scene from={110} to={250}>
        <CoreIdea />
      </Scene>
      <Scene from={250} to={360}>
        <Outro />
      </Scene>

      <Audio src={staticFile('soundtrack.wav')} volume={0.5} />
    </AbsoluteFill>
  );
};

export const Poster: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Background />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{fontFamily: mono, fontSize: 22, letterSpacing: '0.44em', color: MUTED}}>
          REACT · FRAMES · MP4
        </div>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 210,
            color: INK,
            letterSpacing: '-0.01em',
            textShadow: '0 0 100px rgba(124,92,255,0.5)',
            marginTop: 8,
          }}
        >
          REMOTION
        </div>
        <div
          style={{
            width: 880,
            height: 6,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${VIOLET}, ${CYAN})`,
            marginTop: 10,
          }}
        />
        <div style={{marginTop: 36, fontFamily: sans, fontSize: 42, color: '#C9D0F0'}}>
          A video is a function of images over time.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
