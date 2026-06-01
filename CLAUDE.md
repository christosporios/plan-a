# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The source for the **Plan A** website (`plan-a-seven.vercel.app`) — a single-page React app published by Astylab (May 2026) presenting ~20 concrete proposals for Athens. All user-facing copy is in **Greek**; the codebase, comments, and slugs are in English/ASCII. The app is content-driven: proposals are authored as YAML, not code.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:5173 (includes per-page OG meta middleware)
npm run build    # generate-og-image → vite build → generate-pdf → generate-page-html
npm run lint     # eslint .
npm run preview  # serve the production build locally
```

There is **no test suite**. Verify changes by running `npm run dev` and viewing the affected route, or `npm run build` to confirm the OG/HTML/PDF generation steps still pass.

Individual build steps can be run standalone: `npm run generate-og`, `npm run generate-pdf`. `npm run hue` runs an unrelated Philips Hue relay script (`scripts/hue-relay.mjs`), not part of the site.

## Architecture

### Content as data
Each proposal is one file: `proposals/NN-slug.yaml`. They are loaded at build time via `import.meta.glob('../../proposals/*.yaml', { eager, raw })` in [src/lib/proposals.js](src/lib/proposals.js) — **adding a YAML file is all that's needed to add a proposal**; no code changes. Files prefixed `_` (e.g. `_schema.yaml`) are skipped. `_schema.yaml` is the documented, authoritative schema template — read it before editing proposal content. Canonical content structure: problem → proposal → implementation → limitations → benefits → good practices → Pol.is → references.

`proposals.js` (browser) and [scripts/page-meta.mjs](scripts/page-meta.mjs) (Node build) **both parse the same YAML independently** — keep their loading logic in sync when you change the schema.

### Routing
Custom hand-rolled router in [src/app.jsx](src/app.jsx) using `history.pushState` + `popstate` — no router library. `parseRoute()` maps the pathname to a route kind; `navigate()` is threaded through every page component as a prop. Proposal URL forms: `/N`, `/N-slug` (canonical, built by `proposalPath()`), and legacy `/p/N`. Static word-slug routes (`/methodologia`, `/eucharisties`, `/parapombes`, `/diavoulefsi`) are matched before the numeric proposal pattern.

### Styling
**All styling is inline JS style objects** — no CSS files, no CSS-in-JS library. Design tokens live in [src/lib/theme.js](src/lib/theme.js): the `C` color palette, `THEMES` (per-area accent colors keyed by `theme` field), and typography presets (`EYEBROW`, `WORDMARK`, `SECTION_HEAD`, `TABULAR`). Global keyframes, print rules, and `prefers-reduced-motion` overrides are injected once as a `<style>` tag in [src/main.jsx](src/main.jsx). Always pull colors/type from `theme.js` rather than hardcoding.

A proposal's `theme` field must be a key in `THEMES`. `THEME_ORDER` defines the order areas appear on the cover and maps to the "ΣΤΟΧΟΣ N" labels.

### SEO / per-page meta (the non-obvious part)
This is a client-rendered SPA, but every shareable route must serve correct `<title>`/`og:image`/`og:description` to social scrapers. Three pieces share one source of truth, `scripts/page-meta.mjs` (`resolveMeta` + `applyMeta`):
- **Dev:** a Vite middleware plugin in [vite.config.js](vite.config.js) rewrites `index.html` per-request so `view-source` is correct locally.
- **Build:** `scripts/generate-page-html.mjs` emits a static `dist/<route>/index.html` per route, plus `sitemap.xml` and `robots.txt`.
- **OG images:** `scripts/generate-og-image.mjs` renders 1200×630 JPGs (sharp + SVG, fonts in `scripts/og-fonts/`) into `public/og-*.jpg`.

Absolute URLs in meta/sitemap come from `PLAN_A_URL` (or Vercel's `VERCEL_*` env vars), falling back to `http://localhost:5173` — see README for resolution order.

### Presentation mode
[src/components/presentation.jsx](src/components/presentation.jsx) is a full-screen deck, code-split via `lazy()` in `app.jsx` so it stays out of the initial bundle. It's opened through `PresentationContext` (a function provided at the App root, consumed by the footer button).

## Conventions

- Lowercase-kebab filenames for components (`proposal-page.jsx`), matching their default-or-named exports.
- Greek strings live in YAML/content modules and `page-meta.mjs`; avoid hardcoding Greek UI copy in components when it belongs to content.
- The `dist/` directory is generated build output and is gitignored — don't hand-edit it; regenerate with `npm run build`.
- When changing proposal content structure, update `proposals/_schema.yaml` (the documented template), the renderers in `src/components/`, and `scripts/page-meta.mjs` together.
