// Shared page-metadata resolver. Used by both:
//  - scripts/generate-page-html.mjs (production build)
//  - vite.config.js dev-server plugin (local dev)
//
// Given a URL path, returns { title, description, image, path } or null.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const proposalDir = 'proposals';

const SITE_NAME = 'Plan A';

const HOMEPAGE = {
  title: 'Plan A — 20 προτάσεις για την Αθήνα',
  description: 'Είκοσι συγκεκριμένες προτάσεις για τη βελτίωση της Αθήνας. Ένα έργο της Astylab, Μάιος 2026.',
  image: '/og-cover.jpg',
  path: '/',
};

const STATIC_PAGES = {
  '/methodologia': {
    title: 'Πώς φτιάχτηκε το Plan A — Plan A',
    description: '6 αρχές, 29 ειδικοί, και 2.077 πολίτες σε δημόσια διαβούλευση Pol.is. Η μεθοδολογία πίσω από τις 20 προτάσεις.',
    image: '/og-methodologia.jpg',
  },
  '/eucharisties': {
    title: 'Ευχαριστίες — Plan A',
    description: 'Όσοι συνέβαλαν στο Plan A: συντάκτες, ειδικοί, και φορείς χρηματοδότησης.',
    image: '/og-eucharisties.jpg',
  },
  '/kales-praktikes': {
    title: 'Καλές πρακτικές — Plan A',
    description: 'Διεθνή παραδείγματα που τροφοδότησαν τις 20 προτάσεις, ανά πρόταση.',
    image: '/og-kales-praktikes.jpg',
  },
  '/parapombes': {
    title: 'Παραπομπές — Plan A',
    description: 'Όλες οι ακαδημαϊκές και θεσμικές παραπομπές του Plan A.',
    image: '/og-parapombes.jpg',
  },
  '/diavoulefsi': {
    title: 'Από τη διαβούλευση — Plan A',
    description: '126.819 ψήφοι σε 817 statements από 2.077 πολίτες — τα statements που τροφοδότησαν τις προτάσεις.',
    image: '/og-diavoulefsi.jpg',
  },
};

// Cache proposal data per process. Dev server reads it once at startup; build script also.
let _proposals = null;
export function loadProposals() {
  if (_proposals) return _proposals;
  if (!existsSync(proposalDir)) return (_proposals = []);
  const files = readdirSync(proposalDir).filter((f) => f.endsWith('.yaml') && !f.startsWith('_'));
  const out = [];
  for (const file of files) {
    try {
      const data = yaml.load(readFileSync(join(proposalDir, file), 'utf8'));
      if (data?.number && data?.title) {
        const slug = data.slug || file.replace(/\.yaml$/, '').replace(/^\d+-/, '');
        out.push({ data, slug, file });
      }
    } catch (e) {
      console.warn(`Skipping ${file}: ${e.message}`);
    }
  }
  return (_proposals = out);
}

export function resolveMeta(rawPath) {
  const path = rawPath.split('?')[0].replace(/\/$/, '') || '/';

  if (path === '/' || path === '') return HOMEPAGE;
  if (STATIC_PAGES[path]) return { ...STATIC_PAGES[path], path };

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

// Apply page meta to a given index.html string. Used by build script and dev plugin.
export function applyMeta(html, meta, { siteUrl } = {}) {
  const escapedTitle = htmlEscape(meta.title);
  const escapedDesc = htmlEscape(meta.description);
  const absoluteImage = meta.image.startsWith('http') ? meta.image : (siteUrl ? `${siteUrl}${meta.image}` : meta.image);
  const absoluteUrl = siteUrl ? `${siteUrl}${meta.path}` : meta.path;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
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

  return html;
}
