import yaml from 'js-yaml';
import raw from '../data/methodology.yaml?raw';

// Methodology content — single-sourced from src/data/methodology.yaml so the app
// and the Node PDF build script stay in sync (the PDF script reads the same YAML
// directly at build time). `body` fields are markdown-ish text; the presentation
// deck shows only the principle titles.
export const methodologia = yaml.load(raw);
