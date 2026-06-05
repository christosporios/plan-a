// Canonical "Επόμενα βήματα" categories.
//
// Every proposal's `next_steps[]` item carries a `category` key from this list
// (NOT a free-text title). The label shown on the page is derived from the key,
// so the same kind of follow-up reads identically everywhere and the
// /epomena-vimata page can group proposals by shared category.
//
// Shared by the browser bundle and the Node build scripts (kept as .mjs so both
// can import it), mirroring proposal-schema.mjs.
//
// `ORDER` is the display order on the grouped /epomena-vimata page.
export const NEXT_STEP_CATEGORIES = [
  { key: 'mapping',        label: 'Χαρτογράφηση σημείων εφαρμογής' },
  { key: 'legal',          label: 'Αποσαφήνιση νομικού πλαισίου' },
  { key: 'pricing',        label: 'Τιμολόγηση' },
  { key: 'costing',        label: 'Κοστολόγηση' },
  { key: 'digital',        label: 'Ανάπτυξη ψηφιακής υποδομής' },
  { key: 'financial-flow', label: 'Εύρεση βέλτιστης οικονομικής ροής' },
  { key: 'peer-cities',    label: 'Επικοινωνία με πόλεις που έχουν ήδη εφαρμόσει παρόμοιο μοντέλο' },
];

const BY_KEY = Object.fromEntries(NEXT_STEP_CATEGORIES.map((c) => [c.key, c]));

export const NEXT_STEP_ORDER = NEXT_STEP_CATEGORIES.map((c) => c.key);

// Label for a category key (falls back to the raw key for unknown values).
export function categoryLabel(key) {
  return BY_KEY[key]?.label || key;
}

// Display titles for a proposal's next_steps. When two steps share the same
// category within one proposal, they're disambiguated with " (1)" / " (2)" —
// reproducing the author's "Τιμολόγηση (1)" / "Τιμολόγηση (2)" convention.
// Returns an array of strings aligned with the input steps.
export function nextStepTitles(steps = []) {
  const counts = {};
  for (const s of steps) counts[s.category] = (counts[s.category] || 0) + 1;
  const seen = {};
  return steps.map((s) => {
    const label = categoryLabel(s.category);
    if (counts[s.category] > 1) {
      seen[s.category] = (seen[s.category] || 0) + 1;
      return `${label} (${seen[s.category]})`;
    }
    return label;
  });
}
