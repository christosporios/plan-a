// Single source of truth for turning a proposal YAML file into a normalized
// entry. Imported by BOTH consumers so they can't drift apart:
//   - the browser bundle  → src/lib/proposals.js (discovers files via Vite's
//     import.meta.glob)
//   - the Node build      → scripts/page-meta.mjs (discovers files via fs)
//
// The two environments must discover files differently (the bundle can't read
// the filesystem; the script can't use import.meta.glob), but the per-file
// parsing, validation, slug derivation, and ordering all live here. Keep this
// module dependency-free apart from js-yaml so it runs in both places.
import yaml from 'js-yaml';

// A *.yaml file under proposals/ is a proposal unless it's a _-prefixed
// template/note (e.g. _schema.yaml). Accepts a bare filename or a full path.
export function isProposalFile(pathOrName) {
  const base = pathOrName.split('/').pop();
  return base.endsWith('.yaml') && !base.startsWith('_');
}

// Canonical URL slug: the explicit `slug:` field, else the filename with its
// NN- ordering prefix and .yaml extension stripped (01-foo-bar.yaml → foo-bar).
export function deriveSlug(data, pathOrName) {
  const base = pathOrName.split('/').pop().replace(/\.yaml$/, '');
  return data?.slug || base.replace(/^\d+-/, '');
}

// Parse one proposal's raw YAML into a normalized entry, or return null if the
// file is not a valid, routable proposal (YAML parse error, or missing the
// `number`/`title` needed to route and sort it). Both callers drop nulls, so
// returning null — rather than a partial entry — keeps their results identical.
export function parseProposal(raw, pathOrName) {
  const filename = pathOrName.split('/').pop().replace(/\.yaml$/, '');
  let data;
  try {
    data = yaml.load(raw);
  } catch {
    return null;
  }
  if (!data || data.number == null || !data.title) return null;
  return { filename, slug: deriveSlug(data, pathOrName), raw, data };
}

// Display/order comparator: ascending proposal number.
export function byNumber(a, b) {
  return (a.data.number ?? 999) - (b.data.number ?? 999);
}
