import yaml from 'js-yaml';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Per-proposal index.html for OG meta on social shares.
// Vercel's catch-all rewrite serves /index.html for unknown paths; this puts a
// proposal-specific copy at /p/N/index.html so scrapers see the right title/image.

const distHtml = readFileSync('dist/index.html', 'utf8');
const proposalDir = 'proposals';

if (!existsSync(proposalDir)) {
  console.log('No proposals/ directory — skipping per-proposal HTML generation.');
  process.exit(0);
}

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

  const n = data.number;
  const ogTitle = `Πρόταση ${n}: ${data.title}`;
  const ogDesc = data.one_line || 'Plan A — 20 προτάσεις για την Αθήνα';
  const ogImage = `/og-${n}.jpg`;
  const pageTitle = `${ogTitle} — Plan A`;

  let html = distHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(pageTitle)}</title>`);
  html = html.replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${escape(ogTitle)}"`);
  html = html.replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${escape(ogDesc)}"`);
  html = html.replace(/property="og:image" content="[^"]*"/, `property="og:image" content="${ogImage}"`);
  html = html.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${escape(ogTitle)}"`);
  html = html.replace(/name="twitter:description" content="[^"]*"/, `name="twitter:description" content="${escape(ogDesc)}"`);
  html = html.replace(/name="twitter:image" content="[^"]*"/, `name="twitter:image" content="${ogImage}"`);

  const dir = join('dist', 'p', String(n));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`Generated dist/p/${n}/index.html`);
}

function escape(s) {
  return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
