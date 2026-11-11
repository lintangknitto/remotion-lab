import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {withAlpha} from './../../styles/color';
import {enterStyle, Photo, textStyle, useEnter, useTheme} from './../../styles/react';
import {LowerThird} from './LowerThird';
import {RuleTitle} from './RuleTitle';
import {StatCard} from './StatCard';

const PHOTO = 'brand/knitto/photos/01-homepage-main-slider-image-diproduksi-dengan-mes.webp';

/** Logo merek diwarnai ulang lewat mask: ikut warna teks tema (terang/gelap), bukan warna terbakar di SVG. */
const LogoMark: React.FC<{src: string; size: number}> = ({src, size}) => {
  const {color} = useTheme();
  const url = `url(${staticFile(src)})`;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color.text,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
};

/**
 * Satu frame video corporate: foto penuh layar (Ken Burns lambat), scrim gradasi
 * dari warna tema, kop merek, judul, lower third, dan baris stat. 1920x1080, 150 frame.
 */
export const Proof: React.FC = () => {
  const theme = useTheme();
  const {color} = theme;
  const pBrand = useEnter(0, 2);
  const pUrl = useEnter(1, 2);
  // Foto terang di mode terang butuh scrim lebih tipis supaya tetap terbaca sebagai foto.
  const k = theme.mode === 'dark' ? 1 : 0.86;

  return (
    <AbsoluteFill style={{color: color.text}}>
      <Photo src={PHOTO} zoom={1.1} focus={[0.55, 0.5]} />

      {/* scrim: dasar bawah, sisi kiri, dan atas (untuk kop) -- semua dari warna tema */}
      <AbsoluteFill
        style={{
          background: [
            `linear-gradient(0deg, ${withAlpha(color.bg, 0.96 * k)} 0%, ${withAlpha(color.bg, 0.84 * k)} 26%, ${withAlpha(color.bg, 0)} 60%)`,
            `linear-gradient(90deg, ${withAlpha(color.bg, 0.9 * k)} 0%, ${withAlpha(color.bg, 0.6 * k)} 36%, ${withAlpha(color.bg, 0)} 72%)`,
            `linear-gradient(180deg, ${withAlpha(color.bg, 0.7 * k)} 0%, ${withAlpha(color.bg, 0)} 20%)`,
          ].join(','),
        }}
      />

      {/* kop */}
      <div style={{position: 'absolute', left: 96, top: 72, display: 'flex', alignItems: 'center', gap: 22, ...enterStyle(pBrand, 14)}}>
        {theme.logo ? <LogoMark src={theme.logo} size={64} /> : null}
        <div style={{...textStyle(theme, 'display', 40), letterSpacing: '0.12em', textTransform: 'uppercase', color: color.text}}>Knitto</div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 90,
          ...textStyle(theme, 'mono', 22),
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: color.text,
          ...enterStyle(pUrl, 14),
        }}
      >
        knitto.co.id
      </div>

      <RuleTitle
        eyebrow="Toko bahan kaos"
        title="Kain kaos premium, diproduksi di pabrik sendiri."
        subtitle="Kualitas premium dengan harga terbaik."
        delay={2}
        size={84}
        style={{position: 'absolute', left: 96, top: 236, width: 1180}}
      />

      <div style={{position: 'absolute', left: 96, right: 96, bottom: 96, display: 'flex', alignItems: 'flex-start', gap: 64}}>
        <LowerThird
          name="Pabrik Knitto"
          title="Diproduksi dengan mesin teknologi Eropa terbaru"
          delay={12}
          style={{position: 'relative', left: 'auto', bottom: 'auto', width: 680, flexShrink: 0}}
        />
        <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40}}>
          <StatCard value={500} suffix="+" size={84} label="jenis kain" delay={20} />
          <StatCard value={115} prefix="+" size={84} label="stok warna" delay={26} />
          <StatCard value={10000} suffix="+" size={84} label="pelanggan & brand" delay={32} />
        </div>
      </div>
    </AbsoluteFill>
  );
};



