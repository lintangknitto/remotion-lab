export type TranscriptWord = {
  /** The word as written, punctuation included. */
  text: string;
  startMs: number;
  endMs: number;
};

/**
 * Props for the podcast clip template. Everything is data, so the same
 * composition can render any episode: swap `audio`, `words` and `broll`.
 */
export type PodcastClipProps = {
  show: string;
  episode: string;
  speaker: string;
  /** Asset id of the voice track (indexed in the library). */
  audio: string;
  /** Skip this many frames of the audio — used when the clip starts mid-file. */
  audioTrimBefore?: number;
  /** Asset ids used behind the captions, cycled with a slow cross-fade. */
  broll: string[];
  words: TranscriptWord[];
  accent?: string;
  /** Optional music bed asset id, looped under the voice. */
  music?: string;
  /** RMS envelope, one value per frame (see scripts/assets/make_waveform.py). */
  peaks?: number[];
  /** Sound cues, placed at a millisecond offset. */
  sfx?: {id: string; atMs: number}[];
};
