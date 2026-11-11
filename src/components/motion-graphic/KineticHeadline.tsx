import React from 'react';
import {onColor} from '../../styles/color';
import {textStyle, useEnter, useTheme} from '../../styles/react';

export type KineticHeadlineProps = {
  /** Kata yang diapit *bintang* diberi blok warna aksen di belakangnya. */
  text: string;
  /** Ukuran font (px). Default 120. */
  size?: number;
  /** Tambahan tunda (frame). */
  delay?: number;
};

type Word = {word: string; hl: boolean};
type Group = {words: Word[]; hl: boolean; start: number; tone: number};

function parse(text: string): Group[] {
  const words: Word[] = [];
  let open = false;
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const stars = (raw.match(/\*/g) ?? []).length;
    const clean = raw.replace(/\*/g, '');
    let hl = open;
    if (stars === 2) hl = true;
    else if (stars === 1) {
      hl = true;
      open = !open;
    }
    if (clean) words.push({word: clean, hl});
  }
  const groups: Group[] = [];
  let tone = 0;
  words.forEach((w, i) => {
    const last = groups[groups.length - 1];
    if (last && last.hl && w.hl) last.words.push(w);
    else {
      groups.push({words: [w], hl: w.hl, start: i, tone: w.hl ? tone++ : 0});
    }
  });
  return groups;
}

const WordSpan: React.FC<{word: string; index: number; delay: number; color: string}> = ({word, index, delay, color}) => {
  const p = useEnter(index, delay);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        color,
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 0.55}em) scale(${0.9 + 0.1 * p})`,
        transformOrigin: 'left bottom',
      }}
    >
      {word}
    </span>
  );
};

const GroupBlock: React.FC<{group: Group; delay: number}> = ({group, delay}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  // blok menyapu setelah kata pertama muncul
  const p = useEnter(group.start, delay + 5);
  const bg = group.tone % 2 === 0 ? color.accent : color.accent2;
  const fg = p > 0.45 ? onColor(bg) : color.text;
  return (
    <span style={{position: 'relative', display: 'inline-flex', gap: '0.26em', padding: '0 0.16em'}}>
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '-0.02em',
          bottom: '-0.2em',
          background: bg,
          borderRadius: shape.radiusSm,
          transformOrigin: 'left center',
          transform: `scaleX(${Math.max(0, p)})`,
        }}
      />
      {group.words.map((w, i) => (
        <WordSpan key={`${w.word}-${i}`} word={w.word} index={group.start + i} delay={delay} color={fg} />
      ))}
    </span>
  );
};

/** Judul kata-demi-kata dengan spring tema; kata penting punya blok warna aksen. */
export const KineticHeadline: React.FC<KineticHeadlineProps> = ({text, size = 120, delay = 0}) => {
  const theme = useTheme();
  const groups = parse(text);
  return (
    <div style={{...textStyle(theme, 'display', size), color: theme.color.text, display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', rowGap: '0.2em', alignItems: 'baseline'}}>
      {groups.map((g) =>
        g.hl ? (
          <GroupBlock key={g.start} group={g} delay={delay} />
        ) : (
          <WordSpan key={g.start} word={g.words[0].word} index={g.start} delay={delay} color={theme.color.text} />
        ),
      )}
    </div>
  );
};
