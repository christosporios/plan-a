import { isProposalFile, parseProposal, byNumber } from './proposal-schema.mjs';

// One YAML per proposal: proposals/NN-slug.yaml. Files starting with _ are
// templates/notes. Discovery is browser-specific (Vite inlines the raw YAML at
// build time); the parsing, validation, slug derivation, and ordering are
// shared with the Node build via proposal-schema.mjs so the two can't drift.
const rawFiles = import.meta.glob('../../proposals/*.yaml', { eager: true, query: '?raw', import: 'default' });

export const proposals = Object.entries(rawFiles)
  .filter(([path]) => isProposalFile(path))
  .map(([path, raw]) => parseProposal(raw, path))
  .filter(Boolean)
  .sort(byNumber);

export function getProposalByNumber(n) {
  const num = Number(n);
  return proposals.find(p => p.data.number === num) || null;
}

export function getProposalBySlug(slug) {
  return proposals.find(p => p.slug === slug) || null;
}

// Canonical URL path for a proposal entry: /<number>-<slug>
export function proposalPath(entry) {
  if (!entry?.data?.number) return '/';
  const slug = entry.data.slug || entry.slug;
  return slug ? `/${entry.data.number}-${slug}` : `/${entry.data.number}`;
}
