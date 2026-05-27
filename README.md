# Plan A — 20 προτάσεις για την Αθήνα

Source for the Plan A website. Plan A is a publication by [Astylab](https://astylab.gr) (May 2026): twenty concrete proposals to make Athens better, each grounded in academic research, expert interviews, and a Pol.is deliberation with 2,077 citizens.

**Live:** _(coming soon)_

## Getting started

```
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## How content is organised

- `proposals/NN-slug.yaml` — one file per proposal (1–20). Each follows the canonical Plan A structure: problem → proposal → implementation → limitations → good practices → Pol.is → references.
- `pages/` — markdown for the static front/back matter (intro, methodology, epilogue, acknowledgements). _(Phase 3.)_

## Build

```
npm run build
```

Runs three steps:
1. `scripts/generate-og-image.mjs` — generates the cover OG image and a per-proposal OG.
2. `vite build` — bundles the app.
3. `scripts/generate-proposal-html.mjs` — emits per-proposal `dist/p/N/index.html` so social scrapers get the right metadata.

## Project structure

```
proposals/
  01-mikres-pezodromiseis.yaml   one YAML per proposal
  ...
scripts/
  generate-og-image.mjs          cover + per-proposal OG images
  generate-proposal-html.mjs     per-proposal HTML for social meta
src/
  app.jsx                        routing (cover, /p/:n, /methodologia, /eucharisties)
  main.jsx                       entry point + print styles
  lib/
    proposals.js                 YAML loading via import.meta.glob
    theme.js                     design tokens
    format.js                    number/currency formatting
  components/                    UI building blocks
```

## Stack

React 19, Vite, Framer Motion, js-yaml. No router library — client-side routing via `pushState`. Deployed on Vercel.

## Credits

- Σύνταξη: Βασιλική Πουλά, Αδάμ Μαρκάκης
- Επιστημονική υποστήριξη: 1830 lab
- Χρηματοδότηση: «Σημεία Στήριξης»
