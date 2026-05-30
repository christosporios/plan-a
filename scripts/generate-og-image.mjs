// Generate OG images for every shareable page on the site:
// - og-cover.jpg (homepage)
// - og-1.jpg … og-20.jpg (per proposal, theme-colored)
// - og-methodologia.jpg, og-eucharisties.jpg, og-parapombes.jpg,
//   og-diavoulefsi.jpg (static pages)
//
// Output: 1200×630 JPGs. Each shares the Plan A visual identity:
// off-white bg, left-edge accent bar (theme color for proposals,
// gradient for cover, neutral ink for static), serif title, mono eyebrow.
//
// Typography matches the live site: EB Garamond (= C.serif) for the wordmark,
// titles and italics, and Cousine — a Courier-compatible mono with Greek — for
// the eyebrows (the site's monospace). The SVG is rasterized with resvg, which
// (unlike librsvg, which sharp uses for SVG input) renders the bundled font
// files in scripts/og-fonts/ rather than depending on system-installed fonts,
// so output is identical on every machine. sharp then encodes the JPEG.

import sharp from 'sharp';
import yaml from 'js-yaml';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const W = 1200;
const H = 630;

const COLORS = {
  bg: '#f7f6f4',
  ink: '#1a1a1a',
  mid: '#3d3d3d',
  light: '#6b6b6b',
  faint: '#9a9a9a',
  rule: '#d4d4d4',
};

// Keep in sync with src/lib/theme.js (THEMES + THEME_ORDER). Object order here
// is the cover order — it drives the left-bar gradient and the chip row.
const THEMES = {
  mobility:       { label: 'Μετακίνηση',        accent: '#4a7a8c' },
  'public-space': { label: 'Δημόσιος Χώρος',     accent: '#5a8c5a' },
  housing:        { label: 'Κατοικία',           accent: '#ab8540' },
  identity:       { label: 'Ταυτότητα',          accent: '#af4d44' },
  municipality:   { label: 'Αποτελεσματικότητα', accent: '#6e5a8a' },
};

// Font families as named inside the SVG. SERIF = EB Garamond, MONO = Cousine.
const SERIF = 'EB Garamond';
const MONO = 'Cousine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontDir = join(__dirname, 'og-fonts');
const FONT_FILES = [
  'EBGaramond-Regular.ttf',
  'EBGaramond-Italic.ttf',
  'EBGaramond-Bold.ttf',
  'Cousine-Regular.ttf',
  'Cousine-Bold.ttf',
].map((f) => join(fontDir, f));

const proposalDir = 'proposals';
const publicDir = 'public';

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// Rasterize an SVG string to a JPEG file. resvg shapes text with the bundled
// fonts (no system-font dependency); sharp encodes the JPEG.
async function renderJpeg(svg, outFile) {
  const png = new Resvg(svg, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: SERIF },
  }).render().asPng();
  await sharp(png).jpeg({ quality: 88 }).toFile(join(publicDir, outFile));
  console.log(`Generated public/${outFile}`);
}

// Greek all-caps drops the tonos (acute accent). Decompose, strip combining
// marks except dialytika (U+0308), recompose, then uppercase.
function greekUpper(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-̇̉-ͯ]/g, '')
    .normalize('NFC')
    .toUpperCase();
}

// Wrap text to a max char count per line (approximate; assumes proportional font).
function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur += ' ' + w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ── Cover OG ────────────────────────────────────────────────────────────────
async function generateCoverOG() {
  const accents = Object.values(THEMES).map((t) => t.accent);
  const chipLabels = Object.values(THEMES).map((t) => t.label);

  // Distribute chips horizontally. Spacing is derived from the count and the
  // widest label so the (left-anchored) last chip never runs off the canvas.
  const chipY = 540;
  const chipFont = 22;
  const chipStartX = 90;
  const estWidth = (s) => s.length * chipFont * 0.52; // rough serif-italic advance
  const maxLabelW = Math.max(...chipLabels.map(estWidth));
  const chipSpacing = Math.floor((W - chipStartX - maxLabelW - 20) / Math.max(1, chipLabels.length - 1));

  // Left-bar gradient: a short ink intro, then one solid band per theme accent.
  const inkEnd = 14; // %
  const bandSpan = 100 - inkEnd;
  const bandStops = accents.map((c, i) => {
    const start = inkEnd + (bandSpan * i) / accents.length;
    const end = inkEnd + (bandSpan * (i + 1)) / accents.length;
    return `<stop offset="${start.toFixed(2)}%" stop-color="${c}"/><stop offset="${end.toFixed(2)}%" stop-color="${c}"/>`;
  }).join('\n      ');

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leftBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.ink}"/>
      <stop offset="${inkEnd}%" stop-color="${COLORS.ink}"/>
      ${bandStops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.bg}"/>
  <rect x="0" y="0" width="16" height="${H}" fill="url(#leftBar)"/>

  <text x="100" y="130" font-family="${MONO}" font-size="22" letter-spacing="6" fill="${COLORS.faint}">
    ASTYLAB · ΜΑΪΟΣ 2026
  </text>

  <text x="100" y="340" font-family="${SERIF}" font-style="italic" font-size="200" fill="${COLORS.ink}" letter-spacing="-5">
    Plan A
  </text>

  <text x="100" y="420" font-family="${SERIF}" font-size="56" font-style="italic" fill="${COLORS.mid}">
    20 προτάσεις για την Αθήνα
  </text>

  ${chipLabels.map((label, i) => `
    <g transform="translate(${chipStartX + i * chipSpacing}, ${chipY})">
      <rect x="0" y="0" width="48" height="3" fill="${accents[i]}"/>
      <text x="0" y="30" font-family="${SERIF}" font-size="${chipFont}" font-style="italic" fill="${accents[i]}">${escapeXml(label)}</text>
    </g>
  `).join('')}
</svg>`;

  await renderJpeg(svg, 'og-cover.jpg');
}

// ── Proposal OG ─────────────────────────────────────────────────────────────
//
// Layout: massive theme-colored number on the right (visual hero), title on
// the left, eyebrows + footer kickers framing both. No description blob —
// the title and number do the work.
async function generateProposalOG(data) {
  const theme = THEMES[data.theme] || { label: '', accent: COLORS.ink };
  const n = String(data.number).padStart(2, '0');

  // Title column ends at x=720; number starts at x=860 (right-anchored).
  // Tight wrap (≤18 chars) keeps single-word lines from running into the number.
  const titleLines = wrapText(data.title, 18).slice(0, 3);
  const titleFontSize = titleLines.length === 1 ? 68 : titleLines.length === 2 ? 60 : 52;
  const titleLineHeight = Math.round(titleFontSize * 1.1);
  // Vertically center the title block around y=380 so it feels anchored.
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const titleStartY = Math.round(380 - titleBlockHeight / 2 + titleFontSize);

  const themeLabelUpper = theme.label ? greekUpper(theme.label) : '';

  // Right-column number geometry — right-anchored at x=1120.
  const numberX = 1120;
  const numberY = 420;
  const numberSize = 300;

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${COLORS.bg}"/>
  <rect x="0" y="0" width="20" height="${H}" fill="${theme.accent}"/>

  <!-- TOP LEFT: branding kicker -->
  <text x="100" y="100" font-family="${MONO}" font-size="18" letter-spacing="5" fill="${COLORS.faint}">
    PLAN A · ASTYLAB · ΜΑΪΟΣ 2026
  </text>

  <!-- RIGHT COLUMN: ΠΡΟΤΑΣΗ eyebrow + huge number + theme label -->
  <text x="${numberX}" y="160" text-anchor="end" font-family="${MONO}" font-size="22" letter-spacing="6" font-weight="700" fill="${theme.accent}">
    ΠΡΟΤΑΣΗ
  </text>
  <text x="${numberX}" y="${numberY}" text-anchor="end" font-family="${SERIF}" font-size="${numberSize}" font-weight="700" fill="${theme.accent}" letter-spacing="-12">
    ${n}
  </text>
  ${themeLabelUpper ? `
  <text x="${numberX}" y="475" text-anchor="end" font-family="${MONO}" font-size="20" letter-spacing="5" font-weight="700" fill="${theme.accent}">
    ${escapeXml(themeLabelUpper)}
  </text>
  ` : ''}

  <!-- LEFT COLUMN: title (capped to x ≤ 720 by the 18-char wrap above) -->
  ${titleLines.map((line, i) => `
    <text x="100" y="${titleStartY + i * titleLineHeight}" font-family="${SERIF}" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}" letter-spacing="-1.5">
      ${escapeXml(line)}
    </text>
  `).join('')}

  <!-- BOTTOM LEFT: footer kicker -->
  <text x="100" y="590" font-family="${MONO}" font-size="16" letter-spacing="4" fill="${COLORS.faint}">
    20 ΠΡΟΤΑΣΕΙΣ ΓΙΑ ΤΗΝ ΑΘΗΝΑ
  </text>
</svg>`;

  await renderJpeg(svg, `og-${data.number}.jpg`);
}

// ── Static page OG ──────────────────────────────────────────────────────────
async function generateStaticOG(slug, { title, description, kicker = 'PLAN A · ΑΣΤΥΛΑΒ' }) {
  const titleLines = wrapText(title, 22).slice(0, 2);
  const titleFontSize = titleLines.length === 1 ? 110 : 88;
  const titleLineHeight = Math.round(titleFontSize * 1.05);
  const titleStartY = titleLines.length === 1 ? 320 : 260;

  const descLines = description ? wrapText(description, 78).slice(0, 3) : [];
  const descStartY = titleStartY + titleLines.length * titleLineHeight + 30;

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${COLORS.bg}"/>
  <rect x="0" y="0" width="16" height="${H}" fill="${COLORS.ink}"/>

  <text x="100" y="130" font-family="${MONO}" font-size="22" letter-spacing="6" fill="${COLORS.faint}">
    ${escapeXml(kicker)}
  </text>

  ${titleLines.map((line, i) => `
    <text x="100" y="${titleStartY + i * titleLineHeight}" font-family="${SERIF}" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}" letter-spacing="-2.5">
      ${escapeXml(line)}
    </text>
  `).join('')}

  ${descLines.map((line, i) => `
    <text x="100" y="${descStartY + i * 32}" font-family="${SERIF}" font-size="24" font-style="italic" fill="${COLORS.light}">
      ${escapeXml(line)}
    </text>
  `).join('')}

  <text x="100" y="590" font-family="${MONO}" font-size="16" letter-spacing="4" fill="${COLORS.faint}">
    PLAN A · 20 ΠΡΟΤΑΣΕΙΣ ΓΙΑ ΤΗΝ ΑΘΗΝΑ
  </text>
</svg>`;

  await renderJpeg(svg, `og-${slug}.jpg`);
}

// ── Run ─────────────────────────────────────────────────────────────────────
await generateCoverOG();

if (existsSync(proposalDir)) {
  const files = readdirSync(proposalDir).filter((f) => f.endsWith('.yaml') && !f.startsWith('_'));
  for (const file of files) {
    try {
      const data = yaml.load(readFileSync(join(proposalDir, file), 'utf8'));
      if (data?.number && data?.title) {
        await generateProposalOG(data);
      }
    } catch (e) {
      console.warn(`Skipping ${file}: ${e.message}`);
    }
  }
}

await generateStaticOG('methodologia', {
  title: 'Πώς φτιάχτηκε το Plan A',
  description: '6 αρχές, 29 ειδικοί, και 2.077 πολίτες σε δημόσια διαβούλευση Pol.is.',
});
await generateStaticOG('eucharisties', {
  title: 'Ευχαριστίες',
  description: 'Όσοι συνέβαλαν στο Plan A: συντάκτες, ειδικοί και χρηματοδότες.',
});
await generateStaticOG('parapombes', {
  title: 'Παραπομπές',
  description: 'Όλες οι ακαδημαϊκές και θεσμικές παραπομπές του Plan A.',
});
await generateStaticOG('diavoulefsi', {
  title: 'Από τη διαβούλευση',
  description: '126.819 ψήφοι σε 817 statements από 2.077 πολίτες — τα statements που τροφοδότησαν τις προτάσεις.',
});
