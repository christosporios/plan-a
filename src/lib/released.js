// Build-time flag: has Plan A been publicly released (presentation day)?
//
// The build-time value is statically replaced by Vite's `define` (see
// vite.config.js) with a boolean literal. When false, the site shows its
// PRE-RELEASE form: the cover hero stays, but proposals are non-interactive
// teasers, full proposal text is hidden, the presentation/PDF/references/Pol.is
// surfaces are removed, and a prominent Luma sign-up card invites people to the
// event. Flip it by setting the RELEASED env var (e.g. RELEASED=true on Vercel).
//
// LOCAL OVERRIDE: on localhost only, the value can be flipped at runtime via a
// floating dev toggle (see <DevReleaseToggle/>), persisted in localStorage so
// you can preview both states without restarting the dev server. The override is
// inert anywhere other than localhost/127.0.0.1, so it can never affect prod.
const BUILD_RELEASED = import.meta.env.RELEASED === true;

const OVERRIDE_KEY = 'plan-a-released-override';

export const IS_LOCALHOST =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

function readOverride() {
  if (!IS_LOCALHOST) return null;
  try {
    const v = window.localStorage.getItem(OVERRIDE_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
  } catch {
    // localStorage may be unavailable (private mode) — fall back to build flag.
  }
  return null;
}

const override = readOverride();
export const RELEASED = override !== null ? override : BUILD_RELEASED;

// Persist a local override and reload so every `RELEASED` consumer re-reads it.
// No-op off localhost.
export function setReleasedOverride(value) {
  if (!IS_LOCALHOST) return;
  try {
    window.localStorage.setItem(OVERRIDE_KEY, value ? 'true' : 'false');
  } catch { /* ignore */ }
  window.location.reload();
}
