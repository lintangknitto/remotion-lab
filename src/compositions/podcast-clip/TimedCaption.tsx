import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TranscriptWord} from './types';
import {CLAMP} from '../../components/effects/util';
import {fixWord, type Glossary} from '../../lib/glossary';

const WORDS_PER_PAGE = 4;

/**
 * Caption pages driven by real word timings (milliseconds), not by frame
 * spacing. The active word comes from the transcript, so the text stays in sync
 * with the voice even when the speaker pauses.
 */
export const TimedCaption: React.FC<{
  words: TranscriptWord[];
  startFrame: number;
  accent: string;
  fontSize?: number;
  maxWidth?: number;
  glossary?: Glossary;
}> = ({words, startFrame, accent, fontSize = 68, maxWidth = 900, glossary}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = ((frame - startFrame) / fps) * 1000;

  if (ms < 0) return null;

  const pages: TranscriptWord[][] = [];
  let current: TranscriptWord[] = [];
  for (const word of words) {
    current.push(word);
    const endsSentence = /[.!?]$/.test(word.text);
    if (current.length >= WORDS_PER_PAGE || endsSentence) {
      pages.push(current);
      current = [];
    }
  }
  if (current.length) pages.push(current);
  const page = pages.find((p) => ms >= p[0].startMs && ms <= p[p.length - 1].endMs);
  if (!page) return null;

  const activeIndex = page.findIndex((w) => ms >= w.startMs && ms < w.endMs);

  return (
    <div
      style={{
        maxWidth,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 18,
        rowGap: 2,
        textAlign: 'center',
      }}
    >
      {page.map((word, i) => {
        const isActive = i === activeIndex;
        const pop = interpolate(
          ms,
          [word.startMs, word.startMs + 90, word.startMs + 220],
          [0.92, 1.06, 1],
          CLAMP,
        );

        return (
          <span
            key={`${word.text}-${i}`}
            style={{
              display: 'inline-block',
              fontFamily: 'Segoe UI, Inter, system-ui, sans-serif',
              fontSize,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: isActive ? '#FFFFFF' : '#8E97B8',
              transform: `scale(${isActive ? pop : 1})`,
              textShadow: isActive ? `0 0 26px ${accent}66` : '0 2px 18px rgba(0,0,0,0.65)',
            }}
          >
            {fixWord(word.text, glossary)}
          </span>
        );
      })}
    </div>
  );
};
