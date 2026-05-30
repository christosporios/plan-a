// Presentation mode → Philips Hue. Sends the current slide's colour to the local
// relay (scripts/hue-relay.mjs), which forwards it to the bridge. No-op unless
// VITE_HUE_RELAY is set (so it only runs when you've configured it locally).

const RELAY = import.meta.env.VITE_HUE_RELAY;

// sRGB hex → CIE xy, using the wide-gamut conversion Philips documents for Hue.
function hexToXy(hex) {
  const f = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
  const gamma = (c) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
  const r = gamma(f(1)), g = gamma(f(3)), b = gamma(f(5));
  const X = r * 0.664511 + g * 0.154324 + b * 0.162028;
  const Y = r * 0.283881 + g * 0.668433 + b * 0.047685;
  const Z = r * 0.000088 + g * 0.072310 + b * 0.986039;
  const sum = X + Y + Z;
  if (!sum) return { x: 0.33, y: 0.33 };
  return { x: +(X / sum).toFixed(4), y: +(Y / sum).toFixed(4) };
}

// Neutral slides (no theme colour) → a soft warm white.
const WHITE = { x: 0.38, y: 0.38 };

function post(body) {
  fetch(`${RELAY}/color`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

let timer;
// Set the lights to `hex` (or warm white when hex is null). Debounced so rapid
// slide changes don't flood the bridge; failures are swallowed.
export function setHueColor(hex, { brightness = 80 } = {}) {
  if (!RELAY) return;
  const xy = hex ? hexToXy(hex) : WHITE;
  clearTimeout(timer);
  timer = setTimeout(() => post({ x: xy.x, y: xy.y, brightness }), 120);
}

// Flash the lights three times (bright white → off), then settle on `finalHex`.
// Used on presentation entry. Instant transitions (dynamicsMs 0) keep it snappy.
export function flashHue(finalHex) {
  if (!RELAY) return;
  clearTimeout(timer);
  const gap = 190;
  let t = 0;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => post({ x: WHITE.x, y: WHITE.y, brightness: 100, dynamicsMs: 0 }), t); t += gap;
    setTimeout(() => post({ on: false, dynamicsMs: 0 }), t); t += gap;
  }
  setTimeout(() => setHueColor(finalHex), t + 40);
}
