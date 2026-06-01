// Thin wrapper around Plausible (loaded in index.html). Pageviews are tracked
// automatically by the Plausible script via the History API, so this is ONLY
// for custom events — never call it for navigation. No-ops when the script
// isn't present (blocked by an ad-blocker, offline, or local dev), so callers
// don't need to guard.
export function track(event, props) {
  if (typeof window === 'undefined' || typeof window.plausible !== 'function') return;
  window.plausible(event, props ? { props } : undefined);
}
