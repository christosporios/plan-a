import sharp from 'sharp';
import yaml from 'js-yaml';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const W = 1200;
const H = 630;

const proposalDir = 'proposals';
const publicDir = 'public';

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Cover OG — branded Plan A card
const coverSvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f7f6f4"/>
  <text x="80" y="160" font-family="monospace" font-size="18" letter-spacing="6" fill="#9a9a9a">
    ASTYLAB · ΜΑΪΟΣ 2026
  </text>
  <rect x="80" y="180" width="60" height="1" fill="#d4d4d4"/>
  <text x="80" y="340" font-family="serif" font-size="120" font-weight="700" fill="#1a1a1a" letter-spacing="-3">
    Plan A
  </text>
  <text x="80" y="430" font-family="serif" font-size="48" font-style="italic" fill="#6b6b6b">
    20 προτάσεις για την Αθήνα
  </text>
  <rect x="80" y="540" width="80" height="1" fill="#d4d4d4"/>
</svg>`;

await sharp(Buffer.from(coverSvg))
  .jpeg({ quality: 88 })
  .toFile(join(publicDir, 'og-cover.jpg'));

console.log('Generated public/og-cover.jpg');

// Per-proposal OGs (only if any proposals exist yet)
if (existsSync(proposalDir)) {
  const files = readdirSync(proposalDir).filter(f => f.endsWith('.yaml'));
  for (const file of files) {
    let data;
    try {
      data = yaml.load(readFileSync(join(proposalDir, file), 'utf8'));
    } catch (e) {
      console.warn(`Skipping ${file}: ${e.message}`);
      continue;
    }
    if (!data?.number || !data?.title) continue;
    const n = String(data.number).padStart(2, '0');
    const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f7f6f4"/>
  <text x="80" y="120" font-family="monospace" font-size="16" letter-spacing="6" fill="#9a9a9a">
    PLAN A · ΠΡΟΤΑΣΗ ${n}
  </text>
  <rect x="80" y="140" width="60" height="1" fill="#d4d4d4"/>
  <text x="80" y="280" font-family="serif" font-size="64" font-weight="700" fill="#1a1a1a" letter-spacing="-1.5">
    ${escapeXml(data.title)}
  </text>
  ${data.one_line ? `<text x="80" y="380" font-family="serif" font-size="24" font-style="italic" fill="#6b6b6b">${escapeXml(truncate(data.one_line, 90))}</text>` : ''}
  <rect x="80" y="540" width="80" height="1" fill="#d4d4d4"/>
</svg>`;
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 88 })
      .toFile(join(publicDir, `og-${data.number}.jpg`));
    console.log(`Generated public/og-${data.number}.jpg`);
  }
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}
function truncate(s, n) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
