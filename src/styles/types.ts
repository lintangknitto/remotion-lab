/**
 * Tipe style system. Profil MENYIMPAN ATURAN, bukan hex: hex dihitung oleh
 * resolveTheme() dari aturan + seed/brand. Itulah yang membuat warna tidak saklek.
 */

export type Mode = 'dark' | 'light';
export type Harmony = 'mono' | 'analogous' | 'complementary' | 'split' | 'triad';
export type ChromaLevel = 'low' | 'mid' | 'high';

export type ColorRules = {
  mode: Mode;
  /** Hue OKLCH (derajat) dipakai bila tidak ada seed/brand. */
  hue: number;
  harmony: Harmony;
  chroma: ChromaLevel;
  /** 0..1: seberapa kuat warna netral (bg/surface/teks) meminjam hue seed. */
  tint: number;
};

export type FontRole = {
  family: string;
  weight: number;
  case?: 'upper' | 'none';
  /** letter-spacing dalam em. */
  tracking?: number;
  leading?: number;
  /** true = font ini identitas family; font brand tidak boleh menimpanya (mis. serif corporate). */
  locked?: boolean;
};

export type Shadow = 'none' | 'soft' | 'hard';
export type Ease = 'out-expo' | 'out-cubic' | 'in-out';
export type BgRecipe = 'mesh' | 'flat' | 'spotlight' | 'grid' | 'paper';

export type StyleProfile = {
  family: string;
  label: string;
  mood: string;
  color: ColorRules;
  /** Varian mood: menimpa sebagian aturan warna. */
  variants: Record<string, Partial<ColorRules> & {label: string}>;
  defaultVariant: string;
  /** Override per genre (mis. bug-report gelap, test-run-recap terang). */
  genres?: Record<string, {label: string; color?: Partial<ColorRules>}>;
  type: {display: FontRole; body: FontRole; strong: number; mono?: FontRole};
  shape: {radius: number; stroke: number; shadow: Shadow};
  motion: {ease: Ease; damping: number; enter: number; stagger: number};
  background: {recipe: BgRecipe; grain: number; vignette: number};
};

/** Identitas merek yang diukur dari website/aset klien. Semua opsional. */
export type Brand = {
  name: string;
  /** Warna dominan merek (latar/teks utama), mis. navy Knitto. */
  primary?: string;
  /** Warna aksi/CTA merek, mis. terakota Knitto. */
  accent?: string;
  fonts?: {display?: string; body?: string; mono?: string};
  radius?: number;
  /** Path relatif ke public/, mis. brand/knitto/logo.svg. */
  logo?: string;
};

export type ResolveOptions = {
  variant?: string;
  genre?: string;
  /** Warna seed manual (--seed). Menang atas brand.accent. */
  seed?: string;
  brand?: Brand;
  mode?: Mode;
};

export type Theme = {
  family: string;
  variant: string;
  genre?: string;
  mode: Mode;
  brand?: string;
  /** Hue aksen hasil akhir (dipakai audit). */
  accentHue: number;
  color: {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    accent2: string;
    onAccent: string;
    /** Warna semantik TERKUNCI: tidak ikut bergeser mengikuti seed. */
    success: string;
    warn: string;
    danger: string;
    info: string;
    scrim: string;
  };
  type: {
    display: Required<Pick<FontRole, 'family' | 'weight'>> & {case: 'upper' | 'none'; tracking: number; leading: number};
    body: Required<Pick<FontRole, 'family' | 'weight'>> & {case: 'upper' | 'none'; tracking: number; leading: number};
    strong: number;
    mono: Required<Pick<FontRole, 'family' | 'weight'>> & {case: 'upper' | 'none'; tracking: number; leading: number};
  };
  shape: {radius: number; radiusSm: number; radiusLg: number; stroke: number; shadow: string};
  motion: StyleProfile['motion'];
  background: StyleProfile['background'];
  logo?: string;
};
