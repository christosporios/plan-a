import yaml from 'js-yaml';
import raw from '../data/site.yaml?raw';

// Single-source site-level copy shared by the cover hero and presentation mode.
// Loaded from src/data/site.yaml so the app and the Node PDF build script stay in
// sync (the PDF script reads the same YAML directly at build time).
export const SITE = yaml.load(raw);
