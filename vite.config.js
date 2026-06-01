import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolveMeta, applyMeta } from './scripts/page-meta.mjs';

// In dev mode, intercept HTML requests and inject the per-page meta tags so
// social-preview tools and `view-source` show the right title / og:image /
// description even before a production build runs.
function planAMetaPlugin(released) {
  return {
    name: 'plan-a-page-meta',
    // Add middleware directly (not via the post-hook return) so it runs BEFORE
    // Vite's built-in index.html middleware — otherwise Vite serves the
    // un-rewritten index.html first and our handler never fires.
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET') return next();
        const accept = req.headers.accept || '';
        if (!accept.includes('text/html')) return next();
        const path = req.url.split('?')[0];
        // Skip Vite internals + assets
        if (path.startsWith('/@') || path.startsWith('/src/') || path.startsWith('/node_modules/')) return next();
        if (/\.[a-z0-9]+$/i.test(path)) return next();

        const meta = resolveMeta(path, { released });
        if (!meta) return next();

        let html;
        try {
          html = readFileSync('index.html', 'utf8');
          html = await server.transformIndexHtml(path, html);
        } catch (e) {
          return next(e);
        }

        // Don't pass siteUrl in dev — keep image/url paths relative so they
        // resolve against the localhost dev server.
        html = applyMeta(html, meta);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // RELEASED flag: has Plan A been publicly released (presentation day, Fri 5 Jun)?
  // Set RELEASED=true in the environment (Vercel) on/after that day to reveal the
  // full site. Loaded with an empty prefix so it's picked up from Vercel's
  // process.env as well as local .env files, then injected explicitly (the bare
  // `RELEASED` name isn't VITE_-prefixed so it wouldn't be exposed otherwise).
  //
  // Default when unset: production builds default to FALSE (pre-release) so
  // content can never leak early if the env var is forgotten; dev defaults to
  // TRUE so day-to-day development still sees the full site. Override either with
  // `RELEASED=true npm run build` or `RELEASED=false npm run dev`.
  const env = loadEnv(mode, process.cwd(), '');
  const released = env.RELEASED !== undefined
    ? env.RELEASED === 'true'
    : mode !== 'production';

  return {
    plugins: [react(), planAMetaPlugin(released)],
    define: {
      'import.meta.env.RELEASED': JSON.stringify(released),
    },
  };
});
