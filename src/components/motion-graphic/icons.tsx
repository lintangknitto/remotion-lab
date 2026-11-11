import React from 'react';

export type IconName = 'factory' | 'palette' | 'box' | 'truck' | 'check' | 'globe' | 'ruler' | 'cart';

/** Ikon garis sederhana (viewBox 24). Warna selalu dari pemanggil (token tema). */
const PATHS: Record<IconName, {d: string[]; dots?: [number, number, number][]}> = {
  factory: {d: ['M3 21V10l6 3.5V10l6 3.5V4h4.5v17z', 'M8 17.5h2M13.5 17.5h2']},
  palette: {
    d: ['M12 3a9 9 0 1 0 0 18c1.3 0 2.1-.9 2.1-1.9 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z'],
    dots: [
      [7.5, 11.5, 1.2],
      [10, 7.5, 1.2],
      [14.5, 7.5, 1.2],
    ],
  },
  box: {d: ['M12 3l8 4.5v9L12 21l-8-4.5v-9z', 'M4 7.5l8 4.5 8-4.5', 'M12 12v9']},
  truck: {
    d: ['M2 6h11v10.5H2z', 'M13 9.5h4l4 3.5v3.5h-8'],
    dots: [
      [6.5, 17.5, 2.1],
      [17.5, 17.5, 2.1],
    ],
  },
  check: {d: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M7.5 12.5l3 3 6-6.5']},
  globe: {d: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3c2.6 2.4 4 5.5 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.5-4-9s1.4-6.6 4-9z']},
  ruler: {d: ['M3.5 16.5l13-13 4 4-13 13z', 'M6.75 13.25l1.8 1.8M10 10l2.6 2.6M13.25 6.75l1.8 1.8']},
  cart: {
    d: ['M2.5 3.5H5l2.6 11.5h10.8l2.1-8.2H6.2'],
    dots: [
      [9, 19.5, 1.6],
      [17, 19.5, 1.6],
    ],
  },
};

export const Icon: React.FC<{name: IconName; size: number; color: string; strokeWidth?: number}> = ({name, size, color, strokeWidth = 1.8}) => {
  const def = PATHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {def.d.map((d) => (
        <path key={d} d={d} />
      ))}
      {def.dots?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={color} stroke={name === 'palette' ? 'none' : color} />
      ))}
    </svg>
  );
};
