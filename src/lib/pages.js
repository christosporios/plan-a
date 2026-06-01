// Static front/back matter pages.
// Ευχαριστίες uses a markdown-ish `body` string (rendered via Body); the author
// and expert names are interpolated from acknowledgments (single source, also
// used by the presentation-mode "Ευχαριστίες" slide).
// Μεθοδολογία has its own structured shape and dedicated page component.

import yaml from 'js-yaml';
import { acknowledgments } from './acknowledgments';
import { methodologia } from './methodology';
import epomenaVimataRaw from '../data/epomena-vimata.yaml?raw';

export const pages = {
  methodologia,

  // "Επόμενα βήματα" — content single-sourced from src/data/epomena-vimata.yaml.
  'epomena-vimata': yaml.load(epomenaVimataRaw),

  // Full Ευχαριστίες, composed from the reusable acknowledgments fields in their
  // canonical order. Same parts feed the PDF section and (a subset) the slide.
  eucharisties: {
    title: 'Ευχαριστίες',
    body: [
      acknowledgments.intro.trim(),
      acknowledgments.bridge,
      acknowledgments.funding,
      acknowledgments.adam,
      acknowledgments.experts_intro.replace('{N}', acknowledgments.experts.length),
      acknowledgments.experts.map((n) => `- ${n}`).join('\n'),
      acknowledgments.experts_outro,
      acknowledgments.polis,
      acknowledgments.development,
      acknowledgments.disclaimer,
      `**${acknowledgments.author}**`,
    ].join('\n\n'),
  },
};
