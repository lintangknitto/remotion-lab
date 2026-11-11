import generated from '../../data/podcast-demo.generated.json';
import wave from '../../data/podcast-demo-waveform.generated.json';
import {bindPack} from '../../lib/pack';
import type {PodcastClipProps, TranscriptWord} from './types';

/**
 * Demo instance of the template. The transcript comes from
 * scripts/assets/make_vo.ps1 (real TTS + word timings), and the audio/SFX ids
 * come from the `clipping/podcast-clip` pack.
 */
const pack = bindPack('clipping/podcast-clip');
const voice = generated as {audio: string; durationMs: number; words: TranscriptWord[]};

export const podcastDemo: PodcastClipProps = {
  show: 'CLIPPING ROOM',
  episode: 'EP. 42 · CLIP 01',
  speaker: 'David',
  audio: voice.audio,
  broll: ['image.bokeh.party-01', 'image.gradient.mesh-02', 'image.lightleak.cool-01'],
  words: voice.words,
  peaks: (wave as {peaks: number[]}).peaks,
  accent: '#7C5CFF',
  music: pack.has('music') ? pack.id('music') : undefined,
  sfx: [{id: pack.pick('whoosh', 1), atMs: 0}],
};

export const podcastDemoDuration = Math.round((voice.durationMs / 1000) * 30) + 12;
