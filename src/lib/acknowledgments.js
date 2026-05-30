import yaml from 'js-yaml';
import raw from '../data/eucharisties.yaml?raw';

// Authors + experts, parsed once. Shared by the /eucharisties page (via pages.js)
// and the presentation "Ευχαριστίες" slide so the names live in one place.
export const acknowledgments = yaml.load(raw);
