// Generate OG images for every shareable page on the site:
// - og-cover.jpg (homepage)
// - og-1.jpg … og-20.jpg (per proposal, theme-colored)
// - og-methodologia.jpg, og-eucharisties.jpg, og-kales-praktikes.jpg,
//   og-parapombes.jpg, og-diavoulefsi.jpg (static pages)
//
// Output: 1200×630 JPGs. Each shares the Plan A visual identity:
// off-white bg, left-edge accent bar (theme color for proposals,
// gradient for cover, neutral ink for static), serif title, mono eyebrow.

import sharp from 'sharp';
import yaml from 'js-yaml';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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

const THEMES = {
  'public-space': { label: 'Δημόσιος χώρος',           accent: '#5a8c5a' },
  mobility:       { label: 'Κίνηση',                    accent: '#4a7a8c' },
  housing:        { label: 'Κτίρια & κατοικία',         accent: '#a06a3e' },
  municipality:   { label: 'Αποτελεσματικότερος δήμος', accent: '#6e5a8a' },
};

const proposalDir = 'proposals';
const publicDir = 'public';

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
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

  // Distribute chips horizontally
  const chipY = 540;
  const chipSpacing = 240;
  const chipStartX = 100;

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leftBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.ink}"/>
      <stop offset="14%" stop-color="${COLORS.ink}"/>
      <stop offset="24%" stop-color="${accents[0]}"/>
      <stop offset="40%" stop-color="${accents[0]}"/>
      <stop offset="50%" stop-color="${accents[1]}"/>
      <stop offset="64%" stop-color="${accents[1]}"/>
      <stop offset="74%" stop-color="${accents[2]}"/>
      <stop offset="84%" stop-color="${accents[2]}"/>
      <stop offset="92%" stop-color="${accents[3]}"/>
      <stop offset="100%" stop-color="${accents[3]}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.bg}"/>
  <rect x="0" y="0" width="16" height="${H}" fill="url(#leftBar)"/>

  <text x="100" y="130" font-family="monospace" font-size="22" letter-spacing="6" fill="${COLORS.faint}">
    ASTYLAB · ΜΑΪΟΣ 2026
  </text>

  <text x="100" y="340" font-family="serif" font-size="200" font-weight="700" fill="${COLORS.ink}" letter-spacing="-5">
    Plan A
  </text>

  <text x="100" y="420" font-family="serif" font-size="56" font-style="italic" fill="${COLORS.mid}">
    20 προτάσεις για την Αθήνα
  </text>

  ${chipLabels.map((label, i) => `
    <g transform="translate(${chipStartX + i * chipSpacing}, ${chipY})">
      <rect x="0" y="0" width="48" height="3" fill="${accents[i]}"/>
      <text x="0" y="30" font-family="serif" font-size="22" font-style="italic" fill="${accents[i]}">${escapeXml(label)}</text>
    </g>
  `).join('')}
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(join(publicDir, 'og-cover.jpg'));
  console.log('Generated public/og-cover.jpg');
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
  <text x="100" y="100" font-family="monospace" font-size="18" letter-spacing="5" fill="${COLORS.faint}">
    PLAN A · ASTYLAB · ΜΑΪΟΣ 2026
  </text>

  <!-- RIGHT COLUMN: ΠΡΟΤΑΣΗ eyebrow + huge number + theme label -->
  <text x="${numberX}" y="160" text-anchor="end" font-family="monospace" font-size="22" letter-spacing="6" font-weight="700" fill="${theme.accent}">
    ΠΡΟΤΑΣΗ
  </text>
  <text x="${numberX}" y="${numberY}" text-anchor="end" font-family="serif" font-size="${numberSize}" font-weight="700" fill="${theme.accent}" letter-spacing="-12">
    ${n}
  </text>
  ${themeLabelUpper ? `
  <text x="${numberX}" y="475" text-anchor="end" font-family="monospace" font-size="20" letter-spacing="5" font-weight="700" fill="${theme.accent}">
    ${escapeXml(themeLabelUpper)}
  </text>
  ` : ''}

  <!-- LEFT COLUMN: title (capped to x ≤ 720 by the 18-char wrap above) -->
  ${titleLines.map((line, i) => `
    <text x="100" y="${titleStartY + i * titleLineHeight}" font-family="serif" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}" letter-spacing="-1.5">
      ${escapeXml(line)}
    </text>
  `).join('')}

  <!-- BOTTOM LEFT: footer kicker -->
  <text x="100" y="590" font-family="monospace" font-size="16" letter-spacing="4" fill="${COLORS.faint}">
    20 ΠΡΟΤΑΣΕΙΣ ΓΙΑ ΤΗΝ ΑΘΗΝΑ
  </text>
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(join(publicDir, `og-${data.number}.jpg`));
  console.log(`Generated public/og-${data.number}.jpg`);
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

  <text x="100" y="130" font-family="monospace" font-size="22" letter-spacing="6" fill="${COLORS.faint}">
    ${escapeXml(kicker)}
  </text>

  ${titleLines.map((line, i) => `
    <text x="100" y="${titleStartY + i * titleLineHeight}" font-family="serif" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}" letter-spacing="-2.5">
      ${escapeXml(line)}
    </text>
  `).join('')}

  ${descLines.map((line, i) => `
    <text x="100" y="${descStartY + i * 32}" font-family="serif" font-size="24" font-style="italic" fill="${COLORS.light}">
      ${escapeXml(line)}
    </text>
  `).join('')}

  <text x="100" y="590" font-family="monospace" font-size="16" letter-spacing="4" fill="${COLORS.faint}">
    PLAN A · 20 ΠΡΟΤΑΣΕΙΣ ΓΙΑ ΤΗΝ ΑΘΗΝΑ
  </text>
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(join(publicDir, `og-${slug}.jpg`));
  console.log(`Generated public/og-${slug}.jpg`);
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
await generateStaticOG('kales-praktikes', {
  title: 'Καλές πρακτικές',
  description: 'Διεθνή παραδείγματα που τροφοδότησαν τις 20 προτάσεις, ανά πρόταση.',
});
await generateStaticOG('parapombes', {
  title: 'Παραπομπές',
  description: 'Όλες οι ακαδημαϊκές και θεσμικές παραπομπές του Plan A.',
});
await generateStaticOG('diavoulefsi', {
  title: 'Από τη διαβούλευση',
  description: '126.819 ψήφοι σε 817 statements από 2.077 πολίτες — τα statements που τροφοδότησαν τις προτάσεις.',
});
