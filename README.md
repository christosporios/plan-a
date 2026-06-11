# Plan A — 20 προτάσεις για την Αθήνα

Source for the Plan A website. Plan A is a publication by [Astylab](https://astylab.gr) (May 2026): twenty concrete proposals to make Athens better, each grounded in academic research, expert interviews, and a Pol.is deliberation with 2,077 citizens.

**Live:** [plan-a-seven.vercel.app](https://plan-a-seven.vercel.app)

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The dev server includes a Vite middleware plugin that emits per-page OG meta tags on the fly, so `view-source` on `/1-yiothesia-pezodromion` shows the correct title / og:image / description locally — not just in production.

---

## Pages

| Route | Component | What it is |
|---|---|---|
| `/` | `plan-a-cover.jsx` | Cover: hero, theme chips, metrics, TOC of all 20 proposals |
| `/<n>-<slug>` | `proposal-page.jsx` | Single proposal (canonical URL form) |
| `/<n>` | same | Short alias — e.g. `/6` resolves to proposal 6 |
| `/p/<n>` | same | Legacy alias, kept for backward compat |
| `/methodologia` | `methodology-page.jsx` | "How Plan A was made" — 6 principles + 2 long-form sections |
| `/eucharisties` | `static-page.jsx` | Acknowledgements |
| `/kales-praktikes` | `aggregated-page.jsx` | All good-practices grouped by proposal |
| `/parapombes` | `aggregated-page.jsx` | All references grouped by proposal |
| `/diavoulefsi` | `polis-page.jsx` | All Pol.is statements, deduplicated, mapped to the proposals each one informs |

---

## Content

Each of the 20 proposals lives in `proposals/NN-slug.yaml`. The schema is documented in [`proposals/_schema.yaml`](proposals/_schema.yaml) — every field with comments. The canonical structure follows the source PDF: **problem → proposal → implementation → limitations → benefits → good practices → Pol.is → references**.

Static pages (`/methodologia`, `/eucharisties`) draw content from `src/lib/pages.js`. The methodology page has its own dedicated component because it renders structured principles + inline cross-page wayfinding links, not just markdown.

### Adding a proposal

1. Copy `proposals/_schema.yaml` to `proposals/NN-slug.yaml`, replace placeholders.
2. `theme` must be one of: `public-space`, `mobility`, `housing`, `municipality`. Each maps to an accent color in `src/lib/theme.js`.
3. The site picks it up automatically via Vite's `import.meta.glob` — no code changes needed.

---

## Build

```bash
npm run build
```

Runs three steps:

1. **`scripts/generate-og-image.mjs`** — generates the cover OG plus per-proposal and per-static-page OG JPGs (1200×630). Each proposal OG features a massive theme-colored number on the right; static-page OGs use a neutral ink accent.
2. **`vite build`** — bundles the React app into `dist/`.
3. **`scripts/generate-page-html.mjs`** — emits per-page `index.html` files under `dist/` so social-media scrapers see the right meta tags for every shareable route. Also generates `sitemap.xml` and `robots.txt`.

The dev plugin and the build script share `scripts/page-meta.mjs` (single source of truth for page metadata).

### Environment variables

`RELEASED` controls whether the site shows its full, released form or the **pre-release** teaser used before the launch presentation:

- `RELEASED=true` — the full site (all proposal text, references, Pol.is, presentation + PDF buttons).
- `RELEASED=false` — pre-release: the cover hero stays but proposals are non-interactive teasers, full proposal text is hidden behind a prominent Luma sign-up card, and the presentation/PDF/references/Pol.is surfaces are removed.

Defaults when unset: **production builds default to `false`** (so content can't leak early if the var is forgotten on Vercel), while **`npm run dev` defaults to `true`** (full site for day-to-day work). Override either: `RELEASED=true npm run build` or `RELEASED=false npm run dev`. The Luma event URL lives in [`src/data/site.yaml`](src/data/site.yaml) (`luma_url`).

On **localhost only**, a floating switch (bottom-left) flips the flag at runtime via `localStorage` — no restart needed — so both states can be previewed. It never renders off localhost.

`PLAN_A_URL` controls the canonical URL used in `og:url`, `og:image` (absolute), `<link rel="canonical">`, and sitemap entries:

1. Explicit `PLAN_A_URL=https://plan-a.example.gr` — set this in Vercel project settings once a custom domain is wired up
2. `VERCEL_PROJECT_PRODUCTION_URL` — auto-set by Vercel on production deploys
3. `VERCEL_URL` — auto-set on preview deploys
4. Falls back to `http://localhost:5173`

---

## Project structure

```
proposals/
  _schema.yaml                    documented schema template
  01-yiothesia-pezodromion.yaml   one YAML per proposal
  ...
  20-technognosia-yperesia-polis.yaml
public/
  astylab-logo.png
  favicon.svg
  og-cover.jpg                    homepage OG
  og-1.jpg … og-20.jpg            per-proposal OG (theme-colored)
  og-methodologia.jpg             static-page OGs
  og-eucharisties.jpg
  og-kales-praktikes.jpg
  og-parapombes.jpg
  og-diavoulefsi.jpg
scripts/
  generate-og-image.mjs           OG image generation (sharp + SVG)
  generate-page-html.mjs          per-page HTML + sitemap + robots
  page-meta.mjs                   shared page-metadata resolver
src/
  app.jsx                         routing (cover, proposals, static, aggregated)
  main.jsx                        entry + global CSS (animations, prefers-reduced-motion, print)
  hooks/
    use-is-mobile.js
  lib/
    proposals.js                  YAML loading via import.meta.glob
    pages.js                      static page content (methodology, ευχαριστίες)
    theme.js                      design tokens + theme accent colors
    format-text.jsx               markdown-subset renderer (**bold**, *italic*, ^N footnotes, ## h2, ### h3, - lists)
  components/
    plan-a-cover.jsx              homepage
    proposal-page.jsx             single-proposal page shell
    proposal-section.jsx          section heading + body container with accent bar
    methodology-page.jsx          /methodologia
    static-page.jsx               /eucharisties
    aggregated-page.jsx           /kales-praktikes + /parapombes
    polis-page.jsx                /diavoulefsi
    site-footer.jsx               shared footer (every page)
    scroll-line.jsx               left vertical rail (cover gradient + proposal progress)
    section-rail.jsx              right-side section anchor nav on proposal pages
    polis-statement.jsx           Pol.is bar widget (OVERALL + A/B/C)
    callout-box.jsx               bordered call-out
    phase-list.jsx                implementation phases grid
    limitation-qa.jsx             Q → A pattern for limitations sections
    good-practice.jsx             case study entry
    budget-line.jsx               budget table
    footnotes-section.jsx         numbered footnotes at proposal bottom
vite.config.js                    Vite config + dev-mode page-meta middleware
vercel.json                       SPA rewrite (catch-all to index.html)
```

---

## Design system

Defined in [`src/lib/theme.js`](src/lib/theme.js):

- **Colors**: `ink`, `mid`, `light`, `faint`, `rule`, `bg`, `card`, `hover` + Pol.is bar colors (`agree`/`disagree`/`pass`)
- **Themes**: `public-space` (green), `mobility` (blue), `housing` (brown), `municipality` (purple) — each with `label` and `accent`
- **Fonts**: `serif` (EB Garamond → GFS Didot → Georgia), `mono` (Courier New), `sans` (DM Sans)
- **Typography tokens**:
  - `EYEBROW` — mono-caps label pattern repeated across stat labels, proposal eyebrows, table headers, etc.
  - `SECTION_HEAD` — italic serif heading for proposal sections + cover theme buckets

---

## Stack

React 19, Vite, js-yaml, sharp (for OG images). No router library — client-side routing via `pushState`. No CSS-in-JS framework — inline `style` objects driven by the design tokens. Deployed on Vercel.

