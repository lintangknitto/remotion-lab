import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {textStyle, useEnter, enterStyle, useTheme} from '../../styles/react';
import {Callout, Cursor, DeviceFrame, Redline, SeverityTag, StatusPill, StepBadge, TimestampChip} from './parts';

/**
 * Bukti family QA: satu frame bug-report. Isinya SAMPLE (screenshot asli knitto.co.id
 * dengan catatan QA contoh), bukan temuan bug yang nyata.
 */
const SHOT = {src: 'brand/knitto/sections/01-diproduksi-dengan-mesin-teknologi-eropa.png', w: 1440, h: 900};
const FRAME = {x: 70, y: 90, w: 1180};
const SCALE = FRAME.w / SHOT.w;
const BAR = 58;

/** piksel screenshot -> piksel kanvas */
const sx = (x: number) => FRAME.x + x * SCALE;
const sy = (y: number) => FRAME.y + BAR + y * SCALE;

// elemen pada screenshot (diukur dari gambar 1440x900)
const BUTTON = {x: 200, y: 606, w: 132, h: 40};
const HEADLINE_BOTTOM = 545;

export const Proof: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const c = t.color;
  const p1 = useEnter(0, 6);
  const p2 = useEnter(0, 90);

  const cursorT = interpolate(frame, [14, 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const cx = interpolate(cursorT, [0, 1], [sx(900), sx(BUTTON.x + 70)]);
  const cy = interpolate(cursorT, [0, 1], [sy(380), sy(BUTTON.y + 22)]);

  const gap = BUTTON.y - HEADLINE_BOTTOM;

  return (
    <AbsoluteFill>
      <DeviceFrame url="knitto.co.id" x={FRAME.x} y={FRAME.y} width={FRAME.w} height={SHOT.h * SCALE}>
        <Img src={staticFile(SHOT.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </DeviceFrame>

      <Callout
        x={sx(BUTTON.x) - 10}
        y={sy(BUTTON.y) - 10}
        w={BUTTON.w * SCALE + 20}
        h={BUTTON.h * SCALE + 20}
        label="CTA · kontras"
        labelAt="bottom"
        tone="warn"
        delay={58}
      />
      <Redline
        from={[sx(BUTTON.x) - 36, sy(HEADLINE_BOTTOM)]}
        to={[sx(BUTTON.x) - 36, sy(BUTTON.y)]}
        label={`${gap} px`}
        tone="accent"
        delay={78}
      />
      <Cursor x={cx} y={cy} clickAt={56} />

      <div style={{position: 'absolute', left: 1310, top: 100, width: 540}}>
        <StepBadge step={3} total={7} title="Periksa tombol CTA" delay={4} />
        <div style={{display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap'}}>
          <SeverityTag level="P2" delay={12} />
          <TimestampChip seconds={4.2} delay={16} />
        </div>

        <div
          style={{
            marginTop: 40,
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderLeft: `${Math.max(4, t.shape.stroke + 2)}px solid ${c.warn}`,
            borderRadius: t.shape.radius,
            padding: '26px 28px',
            ...enterStyle(p1, 18),
          }}
        >
          <div style={{...textStyle(t, 'mono', 20), color: c.muted, letterSpacing: '0.12em'}}>CATATAN QA (CONTOH)</div>
          <div style={{...textStyle(t, 'body', 30), color: c.text, marginTop: 12}}>
            Teks tombol berada di atas foto yang berganti. Periksa kontrasnya pada setiap slide.
          </div>
        </div>

        <div style={{marginTop: 30, ...enterStyle(p2, 14)}}>
          <div style={{...textStyle(t, 'mono', 20), color: c.muted, letterSpacing: '0.12em', marginBottom: 14}}>LANGKAH REPRODUKSI</div>
          {['Buka halaman utama', 'Tunggu slider berganti', 'Perhatikan tombol "Mulai Belanja"'].map((s, i) => (
            <div key={s} style={{display: 'flex', gap: 16, alignItems: 'baseline', marginBottom: 10, color: c.text, ...textStyle(t, 'body', 27)}}>
              <span style={{...textStyle(t, 'mono', 22), color: c.accent}}>{i + 1}.</span>
              {s}
            </div>
          ))}
          <div style={{marginTop: 22}}>
            <StatusPill status="warn" size={26} delay={100} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
