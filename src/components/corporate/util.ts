/** Format angka gaya Indonesia (10.000) tanpa Intl supaya identik di semua mesin render. */
export const formatId = (n: number): string => {
  const s = String(Math.max(0, Math.round(n)));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
