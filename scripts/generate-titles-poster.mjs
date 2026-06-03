// One-off: a poster of all 20 proposal titles + numbers, grouped by theme,
// styled in the site's theme (EB Garamond / Cousine, the C palette + accents).
// Run: node scripts/generate-titles-poster.mjs  →  plan-a-titles.png
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { THEMES, THEME_ORDER } from '../src/lib/theme.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontDir = join(__dirname, 'og-fonts');
const FONT_FILES = ['EBGaramond-Regular.ttf', 'EBGaramond-Italic.ttf', 'EBGaramond-Bold.ttf', 'Cousine-Regular.ttf', 'Cousine-Bold.ttf'].map((f) => join(fontDir, f));

const C = { ink: '#1a1a1a', mid: '#3d3d3d', light: '#6b6b6b', faint: '#9a9a9a', rule: '#d4d4d4', bg: '#f7f6f4' };
const SERIF = 'EB Garamond';
const MONO = 'Cousine';

const esc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const greekUpper = (s) => String(s).normalize('NFD').replace(/[̀-̇̉-ͯ]/g, '').normalize('NFC').toUpperCase();

// Greedy word-wrap with a per-font-size pixel-width estimate.
function wrap(text, fontSize, maxW, advance = 0.5) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  const w = (s) => s.length * fontSize * advance;
  for (const word of words) {
    const next = cur ? cur + ' ' + word : word;
    if (w(next) > maxW && cur) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Load proposals (number, title, theme), sorted by number.
const proposals = readdirSync('proposals')
  .filter((f) => f.endsWith('.yaml') && !f.startsWith('_'))
  .map((f) => yaml.load(readFileSync(join('proposals', f), 'utf8')))
  .filter((d) => d?.number && d?.title)
  .sort((a, b) => a.number - b.number);

const W = 1400;
const MX = 110;           // x margin
const numColW = 96;       // number column
const titleX = MX + numColW;
const titleMaxW = W - titleX - MX;
const TITLE_SIZE = 33;
const TITLE_LH = 42;

// ── Build the body as a flowing list of SVG fragments, tracking a y cursor.
let y = 0;
const parts = [];

// Header
y = 150;
parts.push(`<text x="${MX}" y="${y}" font-family="${SERIF}" font-style="italic" font-size="96" letter-spacing="-3" fill="${C.ink}">Plan A</text>`);
y += 56;
parts.push(`<text x="${MX}" y="${y}" font-family="${SERIF}" font-style="italic" font-size="40" fill="${C.mid}">20 προτάσεις για την Αθήνα</text>`);
y += 70;

for (const t of THEME_ORDER) {
  const group = proposals.filter((p) => p.theme === t);
  if (!group.length) continue;
  const info = THEMES[t];
  const stoxos = THEME_ORDER.indexOf(t) + 1;

  // Theme header: accent rule + "ΣΤΟΧΟΣ N" eyebrow + italic label.
  y += 30;
  parts.push(`<rect x="${MX}" y="${y - 22}" width="52" height="4" fill="${info.accent}"/>`);
  parts.push(`<text x="${MX}" y="${y + 14}" font-family="${MONO}" font-size="17" letter-spacing="5" fill="${info.accent}">${esc(greekUpper(`ΣΤΟΧΟΣ ${stoxos}`))}</text>`);
  parts.push(`<text x="${MX + 200}" y="${y + 16}" font-family="${SERIF}" font-style="italic" font-size="30" fill="${info.accent}">${esc(info.label)}</text>`);
  y += 52;

  for (const p of group) {
    const lines = wrap(p.title, TITLE_SIZE, titleMaxW);
    const num = String(p.number).padStart(2, '0');
    // Number, baseline-aligned to the first title line.
    parts.push(`<text x="${MX}" y="${y + TITLE_SIZE}" font-family="${SERIF}" font-size="46" fill="${info.accent}" letter-spacing="-2">${num}</text>`);
    lines.forEach((line, i) => {
      parts.push(`<text x="${titleX}" y="${y + TITLE_SIZE + i * TITLE_LH}" font-family="${SERIF}" font-weight="700" font-size="${TITLE_SIZE}" fill="${C.ink}">${esc(line)}</text>`);
    });
    y += lines.length * TITLE_LH + 16;
  }
  // Divider between groups.
  y += 14;
  parts.push(`<rect x="${MX}" y="${y}" width="${W - 2 * MX}" height="1" fill="${C.rule}"/>`);
  y += 10;
}

const H = y + 90;

// Left theme-gradient bar, like the cover.
const accents = THEME_ORDER.map((t) => THEMES[t].accent);
const inkEnd = 12, span = 100 - inkEnd;
const bandStops = accents.map((c, i) => {
  const s = inkEnd + (span * i) / accents.length;
  const e = inkEnd + (span * (i + 1)) / accents.length;
  return `<stop offset="${s.toFixed(2)}%" stop-color="${c}"/><stop offset="${e.toFixed(2)}%" stop-color="${c}"/>`;
}).join('');

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${C.ink}"/><stop offset="${inkEnd}%" stop-color="${C.ink}"/>${bandStops}
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="${C.bg}"/>
  <rect x="0" y="0" width="18" height="${H}" fill="url(#bar)"/>
  ${parts.join('\n  ')}
</svg>`;

const png = new Resvg(svg, { font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: SERIF } }).render().asPng();
await sharp(png).png().toFile('plan-a-titles.png');
console.log(`Generated plan-a-titles.png (${W}×${H})`);
