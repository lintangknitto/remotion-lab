import React from 'react';
import {AbsoluteFill} from 'remotion';
import {enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';

/**
 * Lembar token: menampilkan hasil resolveTheme() apa adanya (palet, tipografi,
 * bentuk). Dipakai sebagai bukti tema dan sebagai fallback family tanpa Proof.
 */
const ROLES = ['bg', 'surface', 'surface2', 'border', 'text', 'muted', 'accent', 'accent2', 'success', 'warn', 'danger', 'info'] as const;

export const TokenSheet: React.FC = () => {
  const t = useTheme();
  const p0 = useEnter(0);
  const p1 = useEnter(1);
  const p2 = useEnter(2);
  const {color} = t;

  return (
    <AbsoluteFill style={{padding: 90, color: color.text}}>
      <div style={enterStyle(p0)}>
        <div style={{...textStyle(t, 'mono', 22), color: color.accent, letterSpacing: '0.2em', textTransform: 'uppercase'}}>
          {t.family} · {t.variant}
          {t.genre ? ` · ${t.genre}` : ''}
          {t.variant !== t.mode ? ` · ${t.mode}` : ''}
          {t.brand ? ` · brand ${t.brand}` : ''}
        </div>
        <div style={{...textStyle(t, 'display', 104), marginTop: 18}}>{t.type.display.family}</div>
        <div style={{...textStyle(t, 'body', 34), color: color.muted, marginTop: 14, maxWidth: 1200}}>
          Kain kaos premium, diproduksi di pabrik sendiri. 500+ jenis kain, +115 warna stok.
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginTop: 56, ...enterStyle(p1)}}>
        {ROLES.map((r) => (
          <div key={r} style={{background: color[r], border: `${Math.max(1, t.shape.stroke)}px solid ${color.border}`, borderRadius: t.shape.radius, height: 130, padding: 14, display: 'flex', alignItems: 'flex-end'}}>
            <div style={{...textStyle(t, 'mono', 17), color: ['text', 'muted', 'warn', 'success', 'info', 'accent', 'accent2', 'danger'].includes(r) ? color.bg : color.text}}>
              {r}
              <br />
              {color[r]}
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: 24, marginTop: 48, alignItems: 'center', ...enterStyle(p2)}}>
        <div style={{background: color.accent, color: color.onAccent, borderRadius: t.shape.radius, padding: '18px 36px', boxShadow: t.shape.shadow, ...textStyle(t, 'body', 30, t.type.strong)}}>
          Mulai Belanja
        </div>
        <div style={{background: color.surface, border: `${Math.max(1, t.shape.stroke)}px solid ${color.border}`, borderRadius: t.shape.radiusLg, padding: '18px 36px', ...textStyle(t, 'body', 30)}}>
          Kartu · radius {t.shape.radiusLg}px
        </div>
        <div style={{...textStyle(t, 'mono', 26), color: color.muted}}>00:12.4 · STEP 3/7</div>
      </div>
    </AbsoluteFill>
  );
};
