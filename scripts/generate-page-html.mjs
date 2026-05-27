// Generate per-page index.html files with page-specific meta tags so that
// social-media scrapers see the right title, description, and OG image for
// every shareable route — not just the homepage.
//
// Shared meta-resolution logic lives in scripts/page-meta.mjs (also used by
// the Vite dev plugin in vite.config.js).

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { resolveMeta, loadProposals, STATIC_PAGES, applyMeta } from './page-meta.mjs';

const SITE_URL = (process.env.PLAN_A_URL || 'https://plan-a.astylab.gr').replace(/\/$/, '');

const distHtml = readFileSync('dist/index.html', 'utf8');

function writePage(relativePath, html) {
  const fullDir = join('dist', relativePath);
  mkdirSync(fullDir, { recursive: true });
  writeFileSync(join(fullDir, 'index.html'), html);
  console.log(`Generated dist/${relativePath}/index.html`);
}

function buildHtml(path) {
  const meta = resolveMeta(path);
  if (!meta) return null;
  return applyMeta(distHtml, meta, { siteUrl: SITE_URL });
}

// Collect all routes for the sitemap.
const allRoutes = [];

// ── Homepage
{
  const html = buildHtml('/');
  if (html) {
    writeFileSync('dist/index.html', html);
    allRoutes.push('/');
  }
}

// ── Proposals: write 3 aliases each (canonical /N-slug, short /N, legacy /p/N)
for (const entry of loadProposals()) {
  const n = entry.data.number;
  const slug = entry.data.slug || entry.slug;
  const canonicalPath = `/${n}-${slug}`;
  const html = buildHtml(canonicalPath);
  if (!html) continue;
  writePage(`${n}-${slug}`, html);
  writePage(`${n}`, html);
  writePage(`p/${n}`, html);
  allRoutes.push(canonicalPath);
}

// ── Static pages
for (const path of Object.keys(STATIC_PAGES)) {
  const html = buildHtml(path);
  if (!html) continue;
  writePage(path.slice(1), html);
  allRoutes.push(path);
}

// ── Sitemap
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((r) => `  <url>
    <loc>${SITE_URL}${r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r === '/' ? '1.0' : r.startsWith('/p/') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync('dist/sitemap.xml', sitemap);
console.log(`Generated dist/sitemap.xml (${allRoutes.length} routes)`);

// ── robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync('dist/robots.txt', robots);
console.log('Generated dist/robots.txt');
