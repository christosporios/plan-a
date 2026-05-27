import yaml from 'js-yaml';

// Import all policy YAML files at build time
const rawFiles = import.meta.glob('../../policies/*.policy.yaml', { eager: true, query: '?raw', import: 'default' });

export const policies = Object.entries(rawFiles).map(([path, raw]) => {
  const filename = path.split('/').pop().replace('.policy.yaml', '');
  try {
    const data = yaml.load(raw);
    return { slug: filename, raw, data, error: null };
  } catch (e) {
    return { slug: filename, raw, data: null, error: e };
  }
});

export function getPolicy(slug) {
  return policies.find(p => p.slug === slug) || null;
}
