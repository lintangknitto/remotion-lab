import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {getProfile} from '../../styles/profiles/index';
import {resolveTheme} from '../../styles/resolve';
import {knitto} from '../../styles/brands/knitto';
import type {Brand, Mode} from '../../styles/types';
import {ThemeBackground, ThemeProvider} from '../../styles/react';
import {PROOFS} from './proofs';

const BRANDS: Record<string, Brand> = {knitto};

export type StyleProofProps = {
  family: string;
  variant?: string;
  genre?: string;
  /** Nama brand terdaftar (mis. "knitto"); kosong = warna default family. */
  brand?: string;
  /** Warna seed manual, mis. "#c4592a". */
  seed?: string;
  mode?: Mode;
};

/**
 * Bukti gaya satu family. Semua props bisa diedit di panel props Remotion Studio,
 * jadi mencoba brand/varian/seed lain tidak butuh ubah kode.
 */
export const StyleProof: React.FC<StyleProofProps> = ({family, variant, genre, brand, seed, mode}) => {
  const theme = useMemo(
    () =>
      resolveTheme(getProfile(family), {
        variant: variant || undefined,
        genre: genre || undefined,
        seed: seed || undefined,
        mode: mode || undefined,
        brand: brand ? BRANDS[brand] : undefined,
      }),
    [family, variant, genre, brand, seed, mode],
  );
  const Proof = PROOFS[family];
  return (
    <ThemeProvider theme={theme}>
      <AbsoluteFill>
        <ThemeBackground />
        <Proof />
      </AbsoluteFill>
    </ThemeProvider>
  );
};
