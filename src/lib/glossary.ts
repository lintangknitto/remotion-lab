/**
 * Small, explicit correction layer between ASR output and what viewers see.
 *
 * Whisper (especially `small`) tends to "English-ise" Indonesian loanwords:
 * "transkrip" becomes "transcript", "hook" becomes "hock". We keep the raw
 * transcript untouched for auditing and only fix the displayed word, so a wrong
 * rule can be removed without re-transcribing.
 *
 * Add project words here, or pass `glossary` on a composition for one-off cases.
 */

export type Glossary = Record<string, string>;

export const DEFAULT_GLOSSARY: Glossary = {
  transcript: 'transkrip',
  transcripts: 'transkrip',
  hock: 'hook',
  cliping: 'clipping',
  conten: 'konten',
  vidio: 'video',
  captionn: 'caption',
  edting: 'editing',
  editting: 'editing',
  iramanya: 'iramanya',
};

/** Strip surrounding punctuation so "Transcript," still matches. */
function splitWord(word: string): {core: string; lead: string; trail: string} {
  const match = word.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
  if (!match) return {core: word, lead: '', trail: ''};
  return {lead: match[1], core: match[2], trail: match[3]};
}

export function fixWord(word: string, glossary: Glossary = DEFAULT_GLOSSARY): string {
  const {lead, core, trail} = splitWord(word);
  if (!core) return word;

  const replacement = glossary[core.toLowerCase()];
  if (!replacement) return word;

  // preserve capitalisation of the original first letter
  const cased =
    core[0] === core[0]?.toUpperCase() && core.slice(1) === core.slice(1).toLowerCase()
      ? replacement[0].toUpperCase() + replacement.slice(1)
      : replacement;

  return `${lead}${cased}${trail}`;
}

export function fixText(text: string, glossary: Glossary = DEFAULT_GLOSSARY): string {
  return text
    .split(' ')
    .map((w) => fixWord(w, glossary))
    .join(' ');
}

/** Apply to a transcript's word list without mutating the input. */
export function applyGlossary<T extends {text: string}>(
  words: T[],
  glossary: Glossary = DEFAULT_GLOSSARY,
): T[] {
  return words.map((w) => ({...w, text: fixWord(w.text, glossary)}));
}
