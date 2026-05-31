import yaml from 'js-yaml';
import raw from '../data/foreword.yaml?raw';

// Foreword (πρόλογος) shown on the landing cover and on its own page in the PDF
// report. Single-sourced from src/data/foreword.yaml so both stay in sync; the
// Node PDF script reads the same YAML directly at build time.
export const foreword = yaml.load(raw).text;
