export const C = {
  ink: '#1a1a1a', mid: '#3d3d3d', light: '#6b6b6b', faint: '#9a9a9a',
  rule: '#d4d4d4', bg: '#f7f6f4', card: '#ffffff', hover: '#f0efed',
  serif: "'EB Garamond', 'GFS Didot', Georgia, serif",
  mono: "'Courier New', Courier, monospace",
  sans: "'Commissioner', system-ui, sans-serif",
  // Pol.is agreement-bar colors — match Pol.is convention (green/red/grey)
  agree: '#5a9f5a',
  disagree: '#c75555',
  pass: '#c8c8c8',
};

// Theme accent colors by proposal grouping. Object order matches THEME_ORDER
// (the order they appear on the cover). `subtitle` is the one-line framing shown
// under each category heading in the landing-page table of contents.
export const THEMES = {
  mobility:       { label: 'Μετακίνηση',       accent: '#4a7a8c', subtitle: 'Η μετακίνηση στην πόλη είναι δύσκολη' },
  'public-space': { label: 'Δημόσιος Χώρος',    accent: '#5a8c5a', subtitle: 'Ο δημόσιος χώρος είναι παραμελημένος' },
  housing:        { label: 'Κατοικία',          accent: '#ab8540', subtitle: 'Τα σπίτια είναι ακριβά και η κατάσταση των κτηρίων υποβαθμισμένη' },
  identity:       { label: 'Ταυτότητα',         accent: '#af4d44', subtitle: 'Η ταυτότητα της πόλης των μεικτών χρήσεων χάνεται' },
  municipality:   { label: 'Αποτελεσματικότητα', accent: '#6e5a8a', subtitle: 'Ο δήμος συχνά δεν εκπληρώνει τις πλήρεις δυνατότητες του' },
};

export const THEME_ORDER = ['mobility', 'public-space', 'housing', 'identity', 'municipality'];

export function themeOf(slugOrTheme) {
  return THEMES[slugOrTheme] || { label: '', accent: C.ink };
}

// ── Typography tokens ──────────────────────────────────────────────────────
// Repeated mono-caps eyebrow label used for proposal numbers, section titles,
// stat labels, footer links, etc. Callers override fontSize / color / letterSpacing
// where the rhythm of a specific context calls for it.
//
// fontWeight: 500 matches the heaviest weight loaded for DM Mono. Going higher
// (e.g. 600) would force the browser to synthesize bold, which looks slightly
// off compared to a real bold cut.
export const EYEBROW = {
  fontFamily: C.mono,
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: C.faint,
  lineHeight: 1.3,
  fontVariantNumeric: 'tabular-nums',
};

// Brand wordmark "Plan A": cursive (italic serif), regular weight, ink. Shared
// by the cover hero and the proposal-page nav so it reads identically everywhere
// — each caller layers on its own fontSize / spacing.
export const WORDMARK = {
  fontFamily: C.serif,
  fontStyle: 'italic',
  fontWeight: 400,
  color: C.ink,
};

// Italic serif heading used for proposal sections + cover theme buckets.
export const SECTION_HEAD = {
  fontFamily: C.serif,
  fontSize: 22,
  fontWeight: 700,
  fontStyle: 'italic',
  color: C.ink,
  letterSpacing: '-0.01em',
  margin: 0,
};

// Tabular numerals — apply to anywhere digits line up vertically (stat values,
// Pol.is percentages, budget tables, footnote numbers).
export const TABULAR = { fontVariantNumeric: 'tabular-nums' };
