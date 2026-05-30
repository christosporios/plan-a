// Tiny local relay so presentation mode can drive Philips Hue lights.
//
// The browser can't call the bridge directly (self-signed cert + no CORS), so
// the deck POSTs a colour here and this relay forwards the exact CLIP v2 PUT to
// each light. Run it on the same machine as the deck:  npm run hue
//
// Config comes from .env.local (HUE_BRIDGE, HUE_KEY, HUE_LIGHTS). The key stays
// here — it never reaches the browser.

import http from 'http';
import { readFileSync, existsSync } from 'fs';

// The bridge uses a self-signed cert; accept it (this process only talks to it).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Minimal .env.local loader (no dependency).
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trimStart().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const BRIDGE = (process.env.HUE_BRIDGE || '').replace(/\/$/, '');
const KEY = process.env.HUE_KEY || '';
const LIGHTS = (process.env.HUE_LIGHTS || '').split(',').map((s) => s.trim()).filter(Boolean);
const PORT = Number(process.env.HUE_RELAY_PORT || 8765);

if (!BRIDGE || !KEY || !LIGHTS.length) {
  console.error('Missing HUE_BRIDGE / HUE_KEY / HUE_LIGHTS (set them in .env.local). See .env.example.');
  process.exit(1);
}

async function setLights({ x, y, brightness = 80, on = true, dynamicsMs }) {
  const state = on === false
    ? { on: { on: false } }
    : { on: { on: true }, color: { xy: { x, y } }, dimming: { brightness } };
  if (typeof dynamicsMs === 'number') state.dynamics = { duration: dynamicsMs };
  const body = JSON.stringify(state);
  await Promise.all(LIGHTS.map((id) =>
    fetch(`${BRIDGE}/clip/v2/resource/light/${id}`, {
      method: 'PUT',
      headers: { 'hue-application-key': KEY, 'Content-Type': 'application/json' },
      body,
    }).catch((e) => console.warn(`  light ${id}: ${e.message}`))
  ));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'POST' && req.url === '/color') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', async () => {
      try {
        const { x, y, brightness, on, dynamicsMs } = JSON.parse(raw);
        await setLights({ x, y, brightness, on, dynamicsMs });
        res.writeHead(204); res.end();
      } catch (e) {
        res.writeHead(400); res.end(String(e.message));
      }
    });
    return;
  }
  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`Hue relay → ${BRIDGE} (${LIGHTS.length} lights) listening on http://localhost:${PORT}`);
});
