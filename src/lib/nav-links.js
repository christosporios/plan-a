// Shared site navigation links, used by both the footer and the top nav on hero
// pages (cover + proposals). `released`-only entries (Διαβούλευση, Παραπομπές)
// are hidden pre-launch since those pages aren't available yet.
export const NAV_LINKS = [
  { href: '/about',           label: 'Τι είναι το Plan A' },
  { href: '/diavoulefsi',     label: 'Διαβούλευση', released: true },
  { href: '/parapombes',      label: 'Παραπομπές', released: true },
  { href: '/epomena-vimata',  label: 'Επόμενα βήματα' },
  { href: '/eucharisties',    label: 'Ευχαριστίες' },
];
