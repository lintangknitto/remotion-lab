import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {bindPack} from '../../lib/pack';
import {withAlpha} from '../../styles/color';
import {getProfile} from '../../styles/profiles/index';
import {resolveTheme} from '../../styles/resolve';
import {knitto} from '../../styles/brands/knitto';
import {Photo, ThemeBackground, ThemeProvider, textStyle, useTheme} from '../../styles/react';
import {Badge, BigClaim, CtaButton, CutWipe, FactTag, FeatureChip, Logo, Ticker} from '../../components/ads/parts';

/**
 * Video promosi Knitto, 15 detik, vertikal 9:16.
 *
 * Gaya: family `ads`, genre `iklan` (pack ads/iklan: 9:16, potongan 10-24 frame),
 * brand Knitto yang DIUKUR dari knitto.co.id (navy #0f163f, terakota #c4592a, Open Sans).
 * Foto, logo, dan teks seluruhnya dari website (public/brand/knitto/). Audio dari slot pack.
 * Adegan 3 memakai varian terang (`clean`) supaya ada kontras antar adegan.
 */
const ph = (file: string) => `brand/knitto/photos/${file}`;
const PHOTO = {
  fabricHands: ph('03-homepage-main-slider-image-cotton-combed-enzywas.webp'),
  factory: ph('01-homepage-main-slider-image-diproduksi-dengan-mes.webp'),
  staff: ph('02-homepage-main-slider-image-belanja-semua-jenis-k.webp'),
  portal: ph('22-image-of-access-portal.png'),
  rolls: [
    ph('04-image-of-cotton-combed.png'),
    ph('05-image-of-cotton-combed-enzywash.png'),
    ph('09-image-of-cotton-combed-enzyme.jpg'),
    ph('08-image-of-heavy-cotton-roughfeel.png'),
    ph('06-image-of-cotton-carded.jpg'),
  ],
};

const SCENES = {a: 0, b: 84, c: 174, d: 294, e: 384, end: 450};
const TICKER = ['500+ JENIS KAIN', '+115 WARNA STOK', 'PRODUKSI PABRIK SENDIRI', 'ORDER ONLINE MUDAH'];

const profile = getProfile('ads');
const DARK = resolveTheme(profile, {brand: knitto, genre: 'iklan'});
const LIGHT = resolveTheme(profile, {brand: knitto, variant: 'clean', genre: 'iklan'});

/** Scrim vertikal: gelap di bawah (tempat teks), transparan di atas. */
const BottomScrim: React.FC<{strength?: number}> = ({strength = 0.92}) => {
  const t = useTheme();
  return <AbsoluteFill style={{background: `linear-gradient(0deg, ${withAlpha(t.color.bg, strength)} 12%, ${withAlpha(t.color.bg, strength * 0.55)} 48%, transparent 78%)`}} />;
};

/* ------------------------------------------------------------- adegan A: hook --- */
const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Photo src={PHOTO.fabricHands} zoom={1.22} focus={[0.66, 0.5]} />
    <BottomScrim />
    <div style={{position: 'absolute', left: 70, top: 96}}>
      <Logo width={140} ring />
    </div>
    <div style={{position: 'absolute', left: 70, bottom: 250}}>
      <BigClaim lines={['BAHAN KAOS', '*PREMIUM*']} size={132} delay={4} />
    </div>
  </AbsoluteFill>
);

/* --------------------------------------------------------- adegan B: pabrik --- */
const SceneFactory: React.FC = () => {
  const t = useTheme();
  return (
    <AbsoluteFill>
      <Photo src={PHOTO.factory} zoom={1.18} focus={[0.32, 0.5]} />
      <BottomScrim />
      <div style={{position: 'absolute', left: 70, bottom: 340}}>
        <BigClaim lines={['DIPRODUKSI DI', '*PABRIK SENDIRI*']} size={96} delay={3} />
        <div style={{marginTop: 34, color: t.color.text, ...textStyle(t, 'body', 46, t.type.strong), textShadow: `0 4px 20px ${withAlpha(t.color.bg, 0.7)}`}}>
          Mesin teknologi Eropa terbaru
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <Ticker items={TICKER} height={112} speed={6} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------- adegan C: montase kain (terang) --- */
const SHOT = 22; // frame per potongan, di dalam rentang pack (10-24)
const SceneRolls: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const idx = Math.min(PHOTO.rolls.length - 1, Math.floor(frame / SHOT));
  return (
    <AbsoluteFill style={{background: t.color.surface}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1080}}>
        {PHOTO.rolls.map((src, i) =>
          i === idx ? <Photo key={src} src={src} zoom={1.12} duration={SHOT + 4} fit="contain" focus={[0.5, 0.55]} /> : null,
        )}
      </div>
      <div style={{position: 'absolute', right: 60, top: 40}}>
        <Badge text="WARNA" sub="BARU" size={270} rotate={9} delay={10} />
      </div>
      <div style={{position: 'absolute', left: 70, top: 1110, right: 70}}>
        <BigClaim lines={['*500+*']} size={300} delay={6} />
        <div style={{marginTop: 10, color: t.color.text, ...textStyle(t, 'display', 92)}}>JENIS KAIN</div>
        <div style={{marginTop: 46, display: 'flex', gap: 34, alignItems: 'center'}}>
          <FactTag label="Stok siap" value="+115 WARNA" size={62} rotate={-3} tone="accent2" delay={24} />
        </div>
        <div style={{marginTop: 34, color: t.color.muted, ...textStyle(t, 'body', 40, t.type.strong)}}>Custom warna dengan pre-order</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- adegan D: portal order --- */
const SceneOrder: React.FC = () => {
  const t = useTheme();
  return (
    <AbsoluteFill>
      <ThemeBackground />
      <div style={{position: 'absolute', left: 70, top: 110}}>
        <BigClaim lines={['ORDER *ONLINE*', 'MUDAH']} size={116} delay={2} />
        <div style={{marginTop: 26, color: t.color.muted, ...textStyle(t, 'body', 42, t.type.strong)}}>Knitto Customer Portal</div>
      </div>
      <Img src={staticFile(PHOTO.portal)} style={{position: 'absolute', left: 150, top: 450, width: 900, height: 'auto'}} />
      <div style={{position: 'absolute', left: 70, top: 1400, display: 'flex', flexDirection: 'column', gap: 22}}>
        <FeatureChip text="Pricelist & e-catalog" index={0} delay={14} size={42} />
        <FeatureChip text="Cek stok tiap cabang" index={1} delay={14} size={42} />
        <FeatureChip text="Order tanpa mengantri" index={2} delay={14} size={42} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <Ticker items={TICKER} height={112} speed={6} />
      </div>
      <span style={{display: 'none'}}>{t.family}</span>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- adegan E: endcard --- */
const SceneEnd: React.FC = () => (
  <AbsoluteFill>
    <Photo src={PHOTO.staff} zoom={1.14} focus={[0.62, 0.45]} />
    <BottomScrim strength={0.96} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center'}}>
      <Logo width={190} />
    </div>
    <div style={{position: 'absolute', left: 70, right: 70, bottom: 250, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 44}}>
      <BigClaim lines={['MINIMUM ORDER', '*MULAI 1 KG*']} size={100} delay={2} />
      <CtaButton label="KNITTO.CO.ID" sub="Toko bahan kaos premium" size={66} delay={20} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
      <Ticker items={TICKER} height={112} speed={6} />
    </div>
  </AbsoluteFill>
);

/* ----------------------------------------------------------------- komposisi --- */
const pack = bindPack('ads/iklan');

export const KnittoPromo: React.FC = () => {
  const cuts = [SCENES.b, SCENES.c, SCENES.d, SCENES.e];
  return (
    <AbsoluteFill style={{backgroundColor: DARK.color.bg}}>
      <ThemeProvider theme={DARK}>
        <Sequence from={SCENES.a} durationInFrames={SCENES.b - SCENES.a}>
          <SceneHook />
        </Sequence>
        <Sequence from={SCENES.b} durationInFrames={SCENES.c - SCENES.b}>
          <SceneFactory />
        </Sequence>
        <Sequence from={SCENES.c} durationInFrames={SCENES.d - SCENES.c}>
          <ThemeProvider theme={LIGHT}>
            <SceneRolls />
          </ThemeProvider>
        </Sequence>
        <Sequence from={SCENES.d} durationInFrames={SCENES.e - SCENES.d}>
          <SceneOrder />
        </Sequence>
        <Sequence from={SCENES.e} durationInFrames={SCENES.end - SCENES.e}>
          <SceneEnd />
        </Sequence>
        {cuts.map((f) => (
          <CutWipe key={f} at={f} />
        ))}
      </ThemeProvider>

      {/* audio dari slot pack ads/iklan */}
      <Audio src={pack.src('music')} loop volume={0.42} />
      {[SCENES.a, ...cuts].map((f) => (
        <Sequence key={`i${f}`} from={f} durationInFrames={36}>
          <Audio src={pack.src('impact')} volume={0.55} />
        </Sequence>
      ))}
      {cuts.map((f) => (
        <Sequence key={`w${f}`} from={f - 8} durationInFrames={24}>
          <Audio src={pack.src('whoosh')} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
