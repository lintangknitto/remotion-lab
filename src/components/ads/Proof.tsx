import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Photo, useTheme} from '../../styles/react';
import {withAlpha} from '../../styles/color';
import {Badge, BigClaim, CtaButton, FactTag, Ticker} from './parts';

/**
 * Bukti family Ads: satu frame iklan. Foto penuh layar, klaim yang menghantam,
 * badge, stiker fakta, tombol CTA, dan ticker. Foto dari public/brand/knitto/.
 */
export const Proof: React.FC = () => {
  const t = useTheme();
  const c = t.color;
  return (
    <AbsoluteFill>
      <Photo src="brand/knitto/photos/03-homepage-main-slider-image-cotton-combed-enzywas.webp" zoom={1.1} focus={[0.65, 0.55]} />
      <AbsoluteFill style={{background: `linear-gradient(95deg, ${withAlpha(c.bg, 0.92)} 8%, ${withAlpha(c.bg, 0.45)} 50%, transparent 82%)`}} />

      <div style={{position: 'absolute', left: 96, top: 150}}>
        <BigClaim lines={['BAHAN KAOS', '*PREMIUM*', 'LANGSUNG PABRIK']} size={132} />
      </div>

      <div style={{position: 'absolute', left: 100, top: 700, display: 'flex', alignItems: 'center', gap: 56}}>
        <CtaButton label="MULAI BELANJA" sub="knitto.co.id" size={56} delay={26} />
        <FactTag label="Min. order" value="1 KG" rotate={-5} size={70} delay={34} />
      </div>

      <div style={{position: 'absolute', right: 130, top: 120}}>
        <Badge text="WARNA" sub="BARU" size={300} delay={30} />
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <Ticker items={['500+ JENIS KAIN', '+115 WARNA STOK', 'PRODUKSI PABRIK SENDIRI', 'ORDER ONLINE MUDAH']} height={92} />
      </div>
    </AbsoluteFill>
  );
};
