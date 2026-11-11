import React from 'react';
import {useCurrentFrame} from 'remotion';
import {onColor, withAlpha} from '../../styles/color';
import {enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';

export type Tone = 'accent' | 'danger' | 'warn' | 'success' | 'info';
export type Status = 'pass' | 'fail' | 'warn' | 'skip';
export type Severity = 'P0' | 'P1' | 'P2' | 'P3';

/** Ambil warna tema untuk sebuah nada. */
export function useTone(tone: Tone): string {
  const {color} = useTheme();
  return tone === 'accent' ? color.accent : color[tone];
}

/** 83.4 -> "01:23.4" */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
};

/* ----------------------------------------------------------- TimestampChip --- */

export const TimestampChip: React.FC<{seconds?: number; text?: string; delay?: number}> = ({seconds, text, delay = 0}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: t.color.surface2,
        border: `1px solid ${t.color.border}`,
        borderRadius: t.shape.radiusSm,
        padding: '8px 14px',
        color: t.color.text,
        ...textStyle(t, 'mono', 24),
        ...enterStyle(p, 10),
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.color.muted} strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2M9 2.5h6" />
      </svg>
      {text ?? formatTime(seconds ?? 0)}
    </div>
  );
};

/* ------------------------------------------------------------- SeverityTag --- */

const SEVERITY: Record<Severity, {tone: Tone | 'muted'; label: string}> = {
  P0: {tone: 'danger', label: 'Kritis'},
  P1: {tone: 'warn', label: 'Tinggi'},
  P2: {tone: 'info', label: 'Sedang'},
  P3: {tone: 'muted', label: 'Rendah'},
};

export const SeverityTag: React.FC<{level: Severity; delay?: number}> = ({level, delay = 0}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  const s = SEVERITY[level];
  const c = s.tone === 'muted' ? t.color.muted : t.color[s.tone];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: withAlpha(c, 0.16),
        border: `${Math.max(1, t.shape.stroke - 1)}px solid ${c}`,
        borderRadius: 999,
        padding: '8px 18px 8px 14px',
        color: c,
        ...textStyle(t, 'mono', 24, 600),
        ...enterStyle(p, 10),
      }}
    >
      <span style={{width: 12, height: 12, borderRadius: 999, background: c}} />
      {level} · {s.label}
    </div>
  );
};

/* -------------------------------------------------------------- StatusPill --- */

const STATUS: Record<Status, {tone: Tone | 'muted'; label: string}> = {
  pass: {tone: 'success', label: 'PASS'},
  fail: {tone: 'danger', label: 'FAIL'},
  warn: {tone: 'warn', label: 'WARN'},
  skip: {tone: 'muted', label: 'SKIP'},
};

const StatusIcon: React.FC<{status: Status; color: string; size: number}> = ({status, color, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {status === 'pass' && <path d="M5 12.5l4.5 4.5L19 7.5" />}
    {status === 'fail' && <path d="M6 6l12 12M18 6L6 18" />}
    {status === 'warn' && <path d="M12 6v8M12 18.2v.1" />}
    {status === 'skip' && <path d="M6 12h12" />}
  </svg>
);

export const StatusPill: React.FC<{status: Status; size?: number; delay?: number}> = ({status, size = 24, delay = 0}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  const s = STATUS[status];
  const c = s.tone === 'muted' ? t.color.muted : t.color[s.tone];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.4,
        background: withAlpha(c, 0.16),
        border: `${Math.max(1, t.shape.stroke - 1)}px solid ${c}`,
        borderRadius: t.shape.radiusSm,
        padding: `${size * 0.28}px ${size * 0.6}px ${size * 0.28}px ${size * 0.45}px`,
        color: c,
        ...textStyle(t, 'mono', size, 600),
        ...enterStyle(p, 8),
      }}
    >
      <StatusIcon status={status} color={c} size={size * 0.95} />
      {s.label}
    </div>
  );
};

/* --------------------------------------------------------------- StepBadge --- */

export const StepBadge: React.FC<{step: number; total: number; title: string; delay?: number}> = ({step, total, title, delay = 0}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 22,
        // kartu penyangga: tetap terbaca di atas latar apa pun (video/halaman putih)
        background: t.color.surface,
        border: `1px solid ${t.color.border}`,
        borderRadius: t.shape.radiusLg,
        boxShadow: t.shape.shadow,
        padding: '16px 30px 16px 16px',
        ...enterStyle(p, 16),
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          background: t.color.accent,
          color: t.color.onAccent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
          ...textStyle(t, 'display', 34),
        }}
      >
        {step}
      </div>
      <div>
        <div style={{...textStyle(t, 'mono', 21), color: t.color.muted, letterSpacing: '0.14em'}}>
          STEP {step}/{total}
        </div>
        <div style={{...textStyle(t, 'display', 38), color: t.color.text}}>{title}</div>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------- Callout --- */

/**
 * Penanda area. Koordinat dalam PIKSEL kanvas referensi 1920x1080 (dibungkus RefCanvas).
 * kind 'spotlight' menggelapkan semua di luar area (fokus perhatian).
 */
export const Callout: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  kind?: 'box' | 'circle' | 'spotlight';
  tone?: Tone;
  delay?: number;
  pulse?: boolean;
  /** Posisi label: di atas (default) atau di bawah kotak, supaya tidak menimpa konten. */
  labelAt?: 'top' | 'bottom';
}> = ({x, y, w, h, label, kind = 'box', tone = 'danger', delay = 0, pulse = true, labelAt = 'top'}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = useEnter(0, delay);
  const c = useTone(tone);
  const ring = pulse ? 6 + 10 * (0.5 + 0.5 * Math.sin(frame / 7)) : 0;
  const sw = Math.max(4, t.shape.stroke + 1);
  const scale = 1 + (1 - p) * 0.08;

  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: Math.min(1, p * 1.5), transform: `scale(${scale})`}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `${sw}px solid ${c}`,
          borderRadius: kind === 'circle' ? 9999 : t.shape.radius,
          boxShadow:
            kind === 'spotlight'
              ? `0 0 0 4000px ${t.color.scrim}, 0 0 0 ${ring}px ${withAlpha(c, 0.25)}`
              : `0 0 0 ${ring}px ${withAlpha(c, 0.22)}`,
        }}
      />
      {label && (
        <div
          style={{
            position: 'absolute',
            left: -sw,
            top: labelAt === 'top' ? -sw - 46 : h + sw + 10,
            background: c,
            color: onColor(c),
            borderRadius:
              labelAt === 'top'
                ? `${t.shape.radiusSm}px ${t.shape.radiusSm}px ${t.shape.radiusSm}px 0`
                : `0 ${t.shape.radiusSm}px ${t.shape.radiusSm}px ${t.shape.radiusSm}px`,
            padding: '6px 14px',
            whiteSpace: 'nowrap',
            ...textStyle(t, 'mono', 22, 600),
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------- NoteChip / Mention --- */

/** Catatan teks pada video: kartu permukaan dengan garis aksen di kiri. */
export const NoteChip: React.FC<{text: string; size?: number; tone?: Tone; delay?: number}> = ({text, size = 36, tone = 'accent', delay = 0}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  const c = useTone(tone);
  return (
    <div
      style={{
        display: 'inline-block',
        background: t.color.surface,
        border: `1px solid ${t.color.border}`,
        borderLeft: `${Math.max(5, t.shape.stroke + 2)}px solid ${c}`,
        borderRadius: t.shape.radius,
        padding: `${size * 0.4}px ${size * 0.6}px`,
        color: t.color.text,
        boxShadow: t.shape.shadow,
        whiteSpace: 'pre',
        ...textStyle(t, 'body', size, t.type.strong),
        ...enterStyle(p, 16),
      }}
    >
      {text}
    </div>
  );
};

/** Sebutan orang/tim (@david): pill aksen. */
export const MentionChip: React.FC<{text: string; size?: number; delay?: number}> = ({text, size = 34, delay = 0}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  return (
    <div
      style={{
        display: 'inline-block',
        background: t.color.accent,
        color: t.color.onAccent,
        borderRadius: 999,
        padding: `${size * 0.26}px ${size * 0.7}px`,
        whiteSpace: 'pre',
        ...textStyle(t, 'mono', size, 600),
        ...enterStyle(p, 12),
      }}
    >
      {text}
    </div>
  );
};

/* ----------------------------------------------------------------- Redline --- */

/** Garis ukur antara dua titik dengan penanda ujung dan nilai (px). */
export const Redline: React.FC<{from: [number, number]; to: [number, number]; label?: string; tone?: Tone; delay?: number}> = ({
  from,
  to,
  label,
  tone = 'accent',
  delay = 0,
}) => {
  const t = useTheme();
  const p = Math.min(1, useEnter(0, delay));
  const c = useTone(tone);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  const nx = -Math.sin(ang) * 14;
  const ny = Math.cos(ang) * 14;
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const text = label ?? `${Math.round(len)} px`;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible'}}>
      <g stroke={c} strokeWidth={3} strokeLinecap="round" opacity={Math.min(1, p * 2)}>
        <line x1={from[0]} y1={from[1]} x2={from[0] + dx * p} y2={from[1] + dy * p} />
        <line x1={from[0] - nx} y1={from[1] - ny} x2={from[0] + nx} y2={from[1] + ny} />
        <line x1={to[0] - nx} y1={to[1] - ny} x2={to[0] + nx} y2={to[1] + ny} opacity={p > 0.95 ? 1 : 0} />
      </g>
      <g opacity={p > 0.6 ? 1 : 0}>
        <rect x={mx - 62} y={my - 20} width={124} height={40} rx={t.shape.radiusSm} fill={c} />
        <text x={mx} y={my + 8} textAnchor="middle" fill={onColor(c)} style={{...textStyle(t, 'mono', 22, 600)}}>
          {text}
        </text>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------- DeviceFrame --- */

/** Jendela browser: bilah judul, tombol, kolom URL. Konten di-clip ke area bawahnya. */
export const DeviceFrame: React.FC<{url: string; width: number; height: number; children: React.ReactNode; x?: number; y?: number}> = ({
  url,
  width,
  height,
  children,
  x = 0,
  y = 0,
}) => {
  const t = useTheme();
  const bar = 58;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height: height + bar,
        borderRadius: t.shape.radiusLg,
        background: t.color.surface,
        border: `1px solid ${t.color.border}`,
        boxShadow: t.shape.shadow,
        overflow: 'hidden',
      }}
    >
      <div style={{height: bar, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', background: t.color.surface2, borderBottom: `1px solid ${t.color.border}`}}>
        <div style={{display: 'flex', gap: 9}}>
          {[t.color.danger, t.color.warn, t.color.success].map((c, i) => (
            <span key={i} style={{width: 14, height: 14, borderRadius: 999, background: c, opacity: 0.85}} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: width * 0.62,
            margin: '0 auto',
            background: t.color.bg,
            border: `1px solid ${t.color.border}`,
            borderRadius: 999,
            padding: '7px 20px',
            color: t.color.muted,
            textAlign: 'center',
            ...textStyle(t, 'mono', 20),
          }}
        >
          {url}
        </div>
        <div style={{width: 60}} />
      </div>
      <div style={{position: 'relative', width, height, overflow: 'hidden'}}>{children}</div>
    </div>
  );
};

/* -------------------------------------------------------------- TestMatrix --- */

export const TestMatrix: React.FC<{
  rows: {name: string; status: Status; ms?: number}[];
  title?: string;
  width?: number;
}> = ({rows, title = 'Hasil uji', width = 1100}) => {
  const t = useTheme();
  const head = useEnter(0);
  const count = (s: Status) => rows.filter((r) => r.status === s).length;
  return (
    <div style={{width, background: t.color.surface, border: `1px solid ${t.color.border}`, borderRadius: t.shape.radiusLg, boxShadow: t.shape.shadow, overflow: 'hidden'}}>
      <div style={{padding: '22px 30px', borderBottom: `1px solid ${t.color.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...enterStyle(head, 10)}}>
        <div style={{...textStyle(t, 'display', 34), color: t.color.text}}>{title}</div>
        <div style={{...textStyle(t, 'mono', 22), color: t.color.muted}}>{rows.length} kasus</div>
      </div>
      {rows.map((r, i) => (
        <MatrixRow key={r.name} index={i + 1} row={r} last={i === rows.length - 1} />
      ))}
      <div style={{padding: '18px 30px', background: t.color.surface2, display: 'flex', gap: 28, ...textStyle(t, 'mono', 22)}}>
        <span style={{color: t.color.success}}>{count('pass')} pass</span>
        <span style={{color: t.color.danger}}>{count('fail')} fail</span>
        <span style={{color: t.color.warn}}>{count('warn')} warn</span>
        <span style={{color: t.color.muted}}>{count('skip')} skip</span>
      </div>
    </div>
  );
};

const MatrixRow: React.FC<{row: {name: string; status: Status; ms?: number}; index: number; last: boolean}> = ({row, index, last}) => {
  const t = useTheme();
  const p = useEnter(index);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '14px 30px',
        borderBottom: last ? 'none' : `1px solid ${t.color.border}`,
        ...enterStyle(p, 14),
      }}
    >
      <div style={{flex: 1, color: t.color.text, ...textStyle(t, 'body', 28)}}>{row.name}</div>
      {row.ms !== undefined && <div style={{...textStyle(t, 'mono', 22), color: t.color.muted, width: 110, textAlign: 'right'}}>{row.ms} ms</div>}
      <div style={{width: 150, display: 'flex', justifyContent: 'flex-end'}}>
        <StatusPill status={row.status} size={22} delay={index * t.motion.stagger} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ SplitCompare --- */

/** Geser garis pembanding before/after. progress 0..1 = seberapa lebar "after" terlihat. */
export const SplitCompare: React.FC<{before: React.ReactNode; after: React.ReactNode; progress: number; width: number; height: number}> = ({
  before,
  after,
  progress,
  width,
  height,
}) => {
  const t = useTheme();
  const x = width * progress;
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: t.shape.radiusLg, border: `1px solid ${t.color.border}`}}>
      <div style={{position: 'absolute', inset: 0}}>{before}</div>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${width - x}px 0 0)`}}>{after}</div>
      <div style={{position: 'absolute', left: x - 2, top: 0, width: 4, height, background: t.color.text}} />
      <div style={{position: 'absolute', left: 24, top: 24, background: t.color.success, color: onColor(t.color.success), borderRadius: t.shape.radiusSm, padding: '6px 16px', ...textStyle(t, 'mono', 24, 600)}}>
        AFTER
      </div>
      <div style={{position: 'absolute', right: 24, top: 24, background: t.color.danger, color: onColor(t.color.danger), borderRadius: t.shape.radiusSm, padding: '6px 16px', ...textStyle(t, 'mono', 24, 600)}}>
        BEFORE
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ Cursor --- */

/** Kursor dengan riak klik pada frame `clickAt`. Posisi dalam piksel kanvas referensi. */
export const Cursor: React.FC<{x: number; y: number; clickAt?: number}> = ({x, y, clickAt}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const age = clickAt === undefined ? -1 : frame - clickAt;
  const ripple = age >= 0 && age < 18 ? age / 18 : null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
      {ripple !== null && (
        <div
          style={{
            position: 'absolute',
            left: -50 * ripple - 6,
            top: -50 * ripple - 6,
            width: 100 * ripple + 12,
            height: 100 * ripple + 12,
            borderRadius: 999,
            border: `4px solid ${t.color.accent}`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg width="40" height="40" viewBox="0 0 24 24" style={{position: 'absolute', left: 0, top: 0, filter: `drop-shadow(0 3px 4px ${withAlpha(t.color.bg, 0.6)})`}}>
        <path d="M4 2.5l15 9.2-6.2 1.4 3.6 6.8-2.8 1.5-3.6-6.9L5 18.5z" fill={t.color.text} stroke={t.color.bg} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* --------------------------------------------------------------- RefCanvas --- */

/** Kanvas referensi 1920x1080 yang diskalakan ke ukuran video sebenarnya. */
export const RefCanvas: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => {
  const s = Math.min(width / 1920, height / 1080);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: 'top left'}}>
      {children}
    </div>
  );
};
