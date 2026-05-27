import yaml from 'js-yaml';

// One YAML per proposal: proposals/NN-slug.yaml. Files starting with _ are templates/notes.
const rawFiles = import.meta.glob('../../proposals/*.yaml', { eager: true, query: '?raw', import: 'default' });

export const proposals = Object.entries(rawFiles)
  .filter(([path]) => !path.split('/').pop().startsWith('_'))
  .map(([path, raw]) => {
    const filename = path.split('/').pop().replace(/\.yaml$/, '');
    try {
      const data = yaml.load(raw);
      return { filename, slug: data?.slug || filename, raw, data, error: null };
    } catch (e) {
      return { filename, slug: filename, raw, data: null, error: e };
    }
  })
  .filter(p => p.data)
  .sort((a, b) => (a.data.number ?? 999) - (b.data.number ?? 999));

export function getProposalByNumber(n) {
  const num = Number(n);
  return proposals.find(p => p.data.number === num) || null;
}

export function getProposalBySlug(slug) {
  return proposals.find(p => p.slug === slug) || null;
}
