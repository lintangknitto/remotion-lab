import type React from 'react';
import {Proof as AdsProof} from '../../components/ads/Proof';
import {Proof as CorporateProof} from '../../components/corporate/Proof';
import {Proof as MotionGraphicProof} from '../../components/motion-graphic/Proof';
import {Proof as QaProof} from '../../components/qa/Proof';

/**
 * Peta family -> komponen bukti (src/components/<family>/Proof.tsx).
 * Tiap Proof memakai useTheme() dan merender 1920x1080 selama 150 frame.
 */
export const PROOFS: Record<string, React.FC> = {
  qa: QaProof,
  ads: AdsProof,
  corporate: CorporateProof,
  'motion-graphic': MotionGraphicProof,
};
