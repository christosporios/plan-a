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

  eucharisties: {
    title: 'Ευχαριστίες',
    body: `${acknowledgments.funding}

**Σύνταξη:** ${acknowledgments.authors.join(', ')}
**Επιστημονική υποστήριξη:** 1830 lab

Για την ερευνητική υποστήριξη και την επιστημονική επιμέλεια, καθοριστική ήταν η συμβολή της 1830 lab. Η 1830 lab είναι ένα white-label think tank που βοηθά καινοτόμες επιχειρήσεις στην Ελλάδα να διαμορφώσουν μια στρατηγική σχέση με τη γνώση που διαθέτουν ή χρειάζονται, μετατρέποντας την πληροφορία σε ανταγωνιστικό πλεονέκτημα και εργαλείο λήψης αποφάσεων.

## Πολίτες και ειδικοί

Ευχαριστούμε τους **2.077 πολίτες** που συμμετείχαν στη διαβούλευση του Pol.is, καθώς και τους **${acknowledgments.experts.length} ειδικούς** που αφιέρωσαν τον χρόνο και τις ιδέες τους:

${acknowledgments.experts.map((n) => `- ${n}`).join('\n')}

Η συμβολή τους υπήρξε ανεκτίμητη.

Να σημειωθεί βέβαια ότι οι απόψεις που εκφράζονται ανήκουν αποκλειστικά στους συντάκτες και δεν αντανακλούν τις απόψεις όσων υποστήριξαν τη δράση ή συνέβαλαν σε αυτή. Τυχόν λάθη και παραλείψεις είναι αποκλειστικά ευθύνη των συντακτών.

Καταλαβαίνετε, λοιπόν, ότι πολλές δεκάδες άνθρωποι βοήθησαν για να φτάσει αυτή η δουλειά στα χέρια σας — και ανυπομονούμε να γνωρίσουμε όσους θέλουν να πάρουν αυτές τις ιδέες ένα βήμα παραπέρα, με οποιονδήποτε τρόπο!`,
  },
};
