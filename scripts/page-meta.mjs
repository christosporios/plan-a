// Shared page-metadata resolver. Used by both:
//  - scripts/generate-page-html.mjs (production build)
//  - vite.config.js dev-server plugin (local dev)
//
// Given a URL path, returns { title, description, image, path } or null.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { isProposalFile, parseProposal, byNumber } from '../src/lib/proposal-schema.mjs';
import { THEMES } from '../src/lib/theme.js';

const proposalDir = 'proposals';

const SITE_NAME = 'Plan A';
const PUBLISHER = { name: 'Astylab', url: 'https://astylab.gr' };
// The publication the site presents — used as Article datePublished (the site
// states "Astylab · Μάιος 2026" throughout).
const PUBLISH_DATE = '2026-05-01';

const HOMEPAGE = {
  title: 'Plan A — 20 προτάσεις για την Αθήνα',
  description: 'Είκοσι συγκεκριμένες προτάσεις για τη βελτίωση της Αθήνας. Ένα έργο της Astylab, Μάιος 2026.',
  image: '/og-cover.jpg',
  path: '/',
};

const STATIC_PAGES = {
  '/about': {
    title: 'Τι είναι το Plan A — Plan A',
    description: '6 αρχές, 29 ειδικοί, και 2.089 πολίτες σε δημόσια διαβούλευση Pol.is. Η μεθοδολογία πίσω από τις 20 προτάσεις.',
    image: '/og-methodologia.jpg',
  },
  '/epomena-vimata': {
    title: 'Επόμενα βήματα — Plan A',
    description: 'Το Plan A δεν ολοκληρώνεται με τη δημοσίευσή του — αναζητούμε όσους θέλουν να βοηθήσουν να προχωρήσει.',
    image: '/og-epomena-vimata.jpg',
  },
  '/eucharisties': {
    title: 'Ευχαριστίες — Plan A',
    description: 'Όσοι συνέβαλαν στο Plan A: συντάκτες, ειδικοί, και φορείς χρηματοδότησης.',
    image: '/og-eucharisties.jpg',
  },
  '/parapombes': {
    title: 'Παραπομπές — Plan A',
    description: 'Όλες οι ακαδημαϊκές και θεσμικές παραπομπές του Plan A.',
    image: '/og-parapombes.jpg',
  },
  '/diavoulefsi': {
    title: 'Από τη διαβούλευση — Plan A',
    description: '126.819 ψήφοι σε 817 statements από 2.089 πολίτες — τα statements που τροφοδότησαν τις προτάσεις.',
    image: '/og-diavoulefsi.jpg',
  },
};

// Cache proposal data per process. Dev server reads it once at startup; build script also.
// Discovery is filesystem-specific here; the parsing/validation/ordering is shared
// with the browser bundle via src/lib/proposal-schema.mjs so the two can't drift.
let _proposals = null;
export function loadProposals() {
  if (_proposals) return _proposals;
  if (!existsSync(proposalDir)) return (_proposals = []);
  const out = [];
  for (const file of readdirSync(proposalDir)) {
    if (!isProposalFile(file)) continue;
    const entry = parseProposal(readFileSync(join(proposalDir, file), 'utf8'), file);
    if (entry) out.push(entry);
    else console.warn(`Skipping ${file}: parse error or missing number/title`);
  }
  return (_proposals = out.sort(byNumber));
}

export function resolveMeta(rawPath) {
  const path = rawPath.split('?')[0].replace(/\/$/, '') || '/';

  if (path === '/' || path === '') return { ...HOMEPAGE, type: 'website' };
  if (STATIC_PAGES[path]) return { ...STATIC_PAGES[path], path, type: 'website' };

  // Proposal: /N, /N-slug, /p/N, /p/N-slug
  const m = path.match(/^\/(?:p\/)?(\d+)(?:-[^/]+)?$/);
  if (m) {
    const n = Number(m[1]);
    const entry = loadProposals().find((p) => p.data.number === n);
    if (!entry) return null;
    const canonicalSlug = entry.data.slug || entry.slug;
    return {
      title: `Πρόταση ${n}: ${entry.data.title} — Plan A`,
      description: (entry.data.one_line || 'Plan A — 20 προτάσεις για την Αθήνα').replace(/\s+/g, ' ').trim(),
      image: `/og-${n}.jpg`,
      path: `/${n}-${canonicalSlug}`,
      type: 'article',
      headline: entry.data.title,
      section: THEMES[entry.data.theme]?.label,
    };
  }

  return null;
}

export function allRoutes() {
  return [
    '/',
    ...Object.keys(STATIC_PAGES),
    ...loadProposals().map((p) => `/${p.data.number}-${p.data.slug || p.slug}`),
  ];
}

export { HOMEPAGE, STATIC_PAGES, SITE_NAME };

export function htmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const stripBrand = (title) => title.replace(/\s+—\s+Plan A$/, '');

// Build a schema.org JSON-LD object for a page: Article for proposals, WebSite
// for the homepage, WebPage for static pages. URLs are absolute when siteUrl is
// known (production build) and relative in dev — harmless, since scrapers read
// the production HTML.
function buildJsonLd(meta, siteUrl) {
  const abs = (p) => (p.startsWith('http') ? p : siteUrl ? `${siteUrl}${p}` : p);
  const url = abs(meta.path);
  const publisher = {
    '@type': 'Organization',
    name: PUBLISHER.name,
    url: PUBLISHER.url,
    logo: { '@type': 'ImageObject', url: abs('/astylab-logo.png') },
  };
  const isPartOf = { '@type': 'WebSite', name: SITE_NAME, url: abs('/') };

  if (meta.type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.headline || stripBrand(meta.title),
      description: meta.description,
      image: abs(meta.image),
      inLanguage: 'el',
      ...(meta.section ? { articleSection: meta.section } : {}),
      datePublished: PUBLISH_DATE,
      dateModified: PUBLISH_DATE,
      author: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
      publisher,
      isPartOf,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
  }

  if (meta.path === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      alternateName: stripBrand(meta.title) === SITE_NAME ? undefined : meta.title,
      url,
      inLanguage: 'el',
      description: meta.description,
      publisher,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: stripBrand(meta.title),
    description: meta.description,
    url,
    inLanguage: 'el',
    isPartOf,
    publisher,
  };
}

// Serialize JSON-LD for safe embedding in an inline <script> (escape `<` so a
// value can never close the tag early).
function jsonLdScript(obj) {
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

// Apply page meta to a given index.html string. Used by build script and dev plugin.
export function applyMeta(html, meta, { siteUrl } = {}) {
  const escapedTitle = htmlEscape(meta.title);
  const escapedDesc = htmlEscape(meta.description);
  const absoluteImage = meta.image.startsWith('http') ? meta.image : (siteUrl ? `${siteUrl}${meta.image}` : meta.image);
  const absoluteUrl = siteUrl ? `${siteUrl}${meta.path}` : meta.path;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
  html = html.replace(/property="og:type" content="[^"]*"/, `property="og:type" content="${meta.type || 'website'}"`);
  html = html.replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${escapedTitle}"`);
  html = html.replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${escapedDesc}"`);
  html = html.replace(/property="og:image" content="[^"]*"/, `property="og:image" content="${htmlEscape(absoluteImage)}"`);
  html = html.replace(/property="og:url" content="[^"]*"/, `property="og:url" content="${htmlEscape(absoluteUrl)}"`);
  html = html.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${escapedTitle}"`);
  html = html.replace(/name="twitter:description" content="[^"]*"/, `name="twitter:description" content="${escapedDesc}"`);
  html = html.replace(/name="twitter:image" content="[^"]*"/, `name="twitter:image" content="${htmlEscape(absoluteImage)}"`);

  // Replace or insert <meta name="description">
  if (/<meta name="description"[^>]*\/?>/.test(html)) {
    html = html.replace(/<meta name="description"[^>]*\/?>/, `<meta name="description" content="${escapedDesc}" />`);
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${escapedDesc}" />\n  </head>`);
  }

  // Replace or insert canonical link
  if (/<link rel="canonical"[^>]*\/?>/.test(html)) {
    html = html.replace(/<link rel="canonical"[^>]*\/?>/, `<link rel="canonical" href="${htmlEscape(absoluteUrl)}" />`);
  } else if (siteUrl) {
    html = html.replace('</head>', `    <link rel="canonical" href="${htmlEscape(absoluteUrl)}" />\n  </head>`);
  }

  // Inject schema.org JSON-LD. Replace a prior block (idempotent if applyMeta
  // runs twice on the same HTML) or insert one before </head>.
  const ld = jsonLdScript(buildJsonLd(meta, siteUrl));
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ld);
  } else {
    html = html.replace('</head>', `    ${ld}\n  </head>`);
  }

  return html;
}
