// Generate the complete Plan A report as a real PDF *document* (not a screenshot
// or a print of the web page). Runs in Node at build time, reading the raw data
// — proposal YAMLs + the shared config modules — and laying it out with
// @react-pdf/renderer. Output: public/plan-a.pdf (served + committed) and, when
// present, dist/plan-a.pdf for the deploy.

import React from 'react';
import { Document, Page, View, Text, Image, Font, Svg, Path, Circle, Line, Polyline, Polygon, Rect, Ellipse, renderToFile, renderToBuffer } from '@react-pdf/renderer';
import yaml from 'js-yaml';
import qrcode from 'qrcode-generator';
import sharp from 'sharp';
import { Car, Landmark } from 'lucide';
import { treesForest } from '@lucide/lab';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { C, THEMES, THEME_ORDER, themeOf } from '../src/lib/theme.js';
import { SITE } from '../src/lib/site.js';
import { methodologia } from '../src/lib/methodology.js';
import { POLIS_GROUPS_DATA } from '../src/lib/polis-groups-data.js';

const h = React.createElement;
const fontDir = join(dirname(fileURLToPath(import.meta.url)), 'og-fonts');
const F = (f) => join(fontDir, f);

// ── Fonts (the site's faces, embedded) ───────────────────────────────────────
Font.register({ family: 'Commissioner', fonts: [
  { src: F('Commissioner-Regular.ttf') },
  { src: F('Commissioner-SemiBold.ttf'), fontWeight: 600 },
  { src: F('Commissioner-Bold.ttf'), fontWeight: 700 },
] });
Font.register({ family: 'EBGaramond', fonts: [
  { src: F('EBGaramond-Regular.ttf') },
  { src: F('EBGaramond-Bold.ttf'), fontWeight: 700 },
  { src: F('EBGaramond-Italic.ttf'), fontStyle: 'italic' },
] });
Font.register({ family: 'Cousine', fonts: [
  { src: F('Cousine-Regular.ttf') },
  { src: F('Cousine-Bold.ttf'), fontWeight: 700 },
] });
// Greek shouldn't be hyphenated mid-word.
Font.registerHyphenationCallback((word) => [word]);

const SERIF = 'EBGaramond';
const MONO = 'Cousine';

// ── Read raw data ────────────────────────────────────────────────────────────
const proposals = readdirSync('proposals')
  .filter((f) => /^\d.*\.yaml$/.test(f))
  .map((f) => yaml.load(readFileSync(join('proposals', f), 'utf8')))
  .filter((d) => d && d.number && d.title)
  .sort((a, b) => a.number - b.number);

const ack = yaml.load(readFileSync('src/data/eucharisties.yaml', 'utf8'));
const foreword = yaml.load(readFileSync('src/data/foreword.yaml', 'utf8')).text;
// Re-encode the logo to a clean PNG buffer (@react-pdf's decoder rejects the raw file).
const LOGO = { data: await sharp('public/astylab-logo.png').resize({ width: 96 }).png().toBuffer(), format: 'png' };

// Proposal hero images (src/assets/proposals/NN.jpg) → buffers for @react-pdf.
// Returns null where no image exists yet (the UI falls back to a themed band).
const PROP_IMG_DIR = 'src/assets/proposals';
function proposalImageData(number) {
  const p = join(PROP_IMG_DIR, `${String(number).padStart(2, '0')}.jpg`);
  return existsSync(p) ? { data: readFileSync(p), format: 'jpg' } : null;
}

// A4 geometry + body-page padding. Full-bleed image bands cancel this padding
// with negative margins so they reach the paper edge.
const A4_H = 841.89;
const PAGE = { top: 48, bottom: 52, x: 54 };
const bodyPageStyle = { backgroundColor: C.bg, color: C.mid, fontFamily: 'Commissioner', fontSize: 9.5, paddingTop: PAGE.top, paddingBottom: PAGE.bottom, paddingHorizontal: PAGE.x };

// hex → rgba string (react-pdf accepts rgba()).
const hexToRgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };
// hex → darker rgb (multiply channels), for legible white text on a flat accent.
const darken = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * f)}, ${Math.round(((n >> 8) & 255) * f)}, ${Math.round((n & 255) * f)})`; };

// ── Lucide icons → @react-pdf <Svg> ──────────────────────────────────────────
// Lucide icon nodes are arrays of [tag, attrs]; render them with the same
// stroke style Lucide uses (fill none, 24-unit viewBox, round caps/joins).
const SVG_TAGS = { path: Path, circle: Circle, line: Line, polyline: Polyline, polygon: Polygon, rect: Rect, ellipse: Ellipse };
const ICON_BY_LABEL = { A: Car, B: Landmark, C: treesForest };
const GROUP_COLOR = Object.fromEntries(POLIS_GROUPS_DATA.map((g) => [g.label, g.color]));

// Two-pass page numbering: an invisible marker records the page each section
// lands on (filled during the first render), so the contents page and the
// running footer can reference real page numbers on the second render.
// Greek all-caps drops the tonos (acute accent) but keeps the dialytika.
const greekUpper = (s) => String(s).normalize('NFD').replace(/[̀-̇̉-ͯ]/g, '').normalize('NFC').toUpperCase();

// Public URL for the cover QR (kept in env; falls back to the known domain).
const SITE_URL = (process.env.VITE_SITE_URL || 'https://planathens.gr').replace(/\/$/, '');
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

// QR code → @react-pdf <Svg> (one Path of unit squares for the dark modules).
function qrSvg(value, size, color = C.ink) {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return h(Svg, { width: size, height: size, viewBox: `0 0 ${n} ${n}` }, [h(Path, { key: 'p', d, fill: color })]);
}

const pageOf = {};
let areaByPage = {};
const marker = (id) => h(Text, {
  key: `mk-${id}`,
  render: ({ pageNumber }) => { pageOf[id] = pageNumber; return ''; },
  style: { height: 0 },
});
function iconSvg(node, color, size, key) {
  if (!node) return null;
  return h(Svg, { key, width: size, height: size, viewBox: '0 0 24 24' },
    node.map(([tag, attrs], i) => {
      const Comp = SVG_TAGS[tag];
      return Comp ? h(Comp, { ...attrs, key: i, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }) : null;
    }).filter(Boolean));
}

// ── Inline markdown-ish parser → array of <Text> spans ───────────────────────
// Supports **bold**, *italic* / _italic_, and ^N / ^[N] footnote refs.
function inline(text, keyPrefix = '') {
  if (text == null) return [];
  const out = [];
  let k = 0;
  const fnRe = /\^\[(\d+)\]|\^(\d+)/g;
  let last = 0; let m;
  const chunks = [];
  while ((m = fnRe.exec(text)) !== null) {
    if (m.index > last) chunks.push({ t: 'txt', v: text.slice(last, m.index) });
    chunks.push({ t: 'fn', v: m[1] || m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) chunks.push({ t: 'txt', v: text.slice(last) });

  for (const c of chunks) {
    if (c.t === 'fn') {
      out.push(h(Text, { key: `${keyPrefix}fn${k++}`, style: { fontFamily: MONO, fontSize: 6.5, color: C.light } }, ` ${c.v}`));
      continue;
    }
    // bold then italic within text
    let lb = 0; let bm; const boldRe = /\*\*([^*]+)\*\*/g;
    const pushItalic = (s) => {
      let li = 0; let im; const itRe = /(?:\*([^*]+)\*|_([^_]+)_)/g;
      while ((im = itRe.exec(s)) !== null) {
        if (im.index > li) out.push(h(Text, { key: `${keyPrefix}s${k++}` }, s.slice(li, im.index)));
        // Commissioner has no static italic — use the serif italic for emphasis.
        out.push(h(Text, { key: `${keyPrefix}i${k++}`, style: { fontFamily: SERIF, fontStyle: 'italic' } }, im[1] || im[2]));
        li = im.index + im[0].length;
      }
      if (li < s.length) out.push(h(Text, { key: `${keyPrefix}s${k++}` }, s.slice(li)));
    };
    while ((bm = boldRe.exec(c.v)) !== null) {
      if (bm.index > lb) pushItalic(c.v.slice(lb, bm.index));
      out.push(h(Text, { key: `${keyPrefix}b${k++}`, style: { fontWeight: 700, color: C.ink } }, bm[1]));
      lb = bm.index + bm[0].length;
    }
    if (lb < c.v.length) pushItalic(c.v.slice(lb));
  }
  return out;
}

// Render a markdown-ish body string into paragraph/heading/list <View>s.
function body(text, keyPrefix = '', base = {}) {
  if (!text) return [];
  return text.trim().split(/\n{2,}/).map((block, i) => {
    const t = block.trim();
    if (t.startsWith('### ')) {
      return h(Text, { key: `${keyPrefix}h3${i}`, minPresenceAhead: 36, style: { fontFamily: MONO, fontSize: 7, color: C.mid, marginTop: 11, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 } }, inline(t.slice(4), `${keyPrefix}h3${i}-`));
    }
    if (t.startsWith('## ')) {
      return h(Text, { key: `${keyPrefix}h2${i}`, minPresenceAhead: 48, style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 11.5, color: C.ink, marginTop: 13, marginBottom: 6 } }, inline(t.slice(3), `${keyPrefix}h2${i}-`));
    }
    const lines = t.split(/\n/);
    if (lines.every((l) => l.trim().startsWith('- '))) {
      return h(View, { key: `${keyPrefix}ul${i}`, style: { marginTop: 4, marginBottom: 7 } },
        lines.map((l, j) => h(View, { key: j, style: { flexDirection: 'row', marginBottom: 2 } }, [
          h(Text, { key: 'b', style: { color: C.faint, width: 9 } }, '·'),
          h(Text, { key: 't', style: { flex: 1, fontSize: 9, color: C.mid, lineHeight: 1.5 } }, inline(l.trim().slice(2), `${keyPrefix}li${i}-${j}-`)),
        ])));
    }
    return h(Text, { key: `${keyPrefix}p${i}`, style: { fontSize: 9.5, color: C.mid, lineHeight: 1.5, marginBottom: 8, ...base } }, inline(t.replace(/\n/g, ' '), `${keyPrefix}p${i}-`));
  });
}

// ── Pol.is widget ────────────────────────────────────────────────────────────
function bar(label, d, key) {
  const tot = Math.max(1, d.agree + d.disagree + d.pass);
  const seg = (w, color) => h(View, { key: color, style: { width: `${(w / tot) * 100}%`, backgroundColor: color } });
  const icon = ICON_BY_LABEL[label];
  return h(View, { key, style: { marginBottom: 8 } }, [
    h(View, { key: 'l', style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } }, [
      h(View, { key: 'lab', style: { flexDirection: 'row', alignItems: 'center', gap: 4 } }, [
        icon && iconSvg(icon, GROUP_COLOR[label] || C.ink, 9, 'ic'),
        h(Text, { key: 'a', style: { fontFamily: MONO, fontSize: 7.5, fontWeight: 700, color: C.ink, letterSpacing: 1 } }, label),
      ]),
      h(Text, { key: 'c', style: { fontFamily: MONO, fontSize: 7.5, fontWeight: 700, color: C.ink } }, String(d.count)),
    ]),
    h(View, { key: 'bar', style: { flexDirection: 'row', height: 5, backgroundColor: C.rule, borderRadius: 1, overflow: 'hidden' } }, [
      seg(d.agree, C.agree), seg(d.disagree, C.disagree), seg(d.pass, C.pass),
    ]),
    h(Text, { key: 'p', style: { fontFamily: MONO, fontSize: 7, color: C.mid, marginTop: 3 } },
      `${d.agree}% ΝΑΙ   ${d.disagree}% ΟΧΙ   ${d.pass}% ΠΑΣΟ`),
  ]);
}

function polisCard(p, key) {
  return h(View, { key, wrap: false, style: { backgroundColor: C.card, borderWidth: 1, borderColor: C.rule, borderRadius: 3, padding: 12, marginBottom: 10 } }, [
    h(View, { key: 's', style: { flexDirection: 'row', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.rule } }, [
      p.statement_id != null && h(Text, { key: 'n', style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 12, color: C.faint, marginRight: 8 } }, `#${p.statement_id}`),
      h(Text, { key: 't', style: { flex: 1, fontSize: 9, color: C.ink, lineHeight: 1.45 } }, p.statement),
    ]),
    bar('OVERALL', p.overall, 'ov'),
    h(View, { key: 'g', style: { flexDirection: 'row', gap: 14, marginTop: 2 } },
      (p.groups || []).map((g, i) => h(View, { key: i, style: { flex: 1 } }, bar(g.label, g, `g${i}`)))),
  ]);
}

// ── Building blocks ──────────────────────────────────────────────────────────
const eyebrow = (text, style, key) => h(Text, { key, style: { fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, color: C.faint, ...style } }, text);

function proposalSection(title, accent, children, key) {
  return h(View, { key, minPresenceAhead: 56, style: { marginBottom: 15 } }, [
    // Accent bar spans only the title row, not the body below it.
    h(View, { key: 'tr', minPresenceAhead: 40, style: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 7 } }, [
      h(View, { key: 'bar', style: { width: 3, backgroundColor: accent, marginRight: 11 } }),
      h(Text, { key: 'h', style: { flex: 1, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 11.5, color: C.ink } }, title),
    ]),
    h(View, { key: 'c', style: { paddingLeft: 14 } }, children),
  ]);
}

// Full-bleed cover page: brand colour rail down the left, big wordmark, and a
// metrics + QR band anchored at the foot.
function CoverPage() {
  return h(View, { key: 'cover', style: { flexGrow: 1, position: 'relative', backgroundColor: C.bg } }, [
    // Left rail — one band per thematic area, full height.
    h(View, { key: 'rail', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, flexDirection: 'column' } },
      THEME_ORDER.map((t) => h(View, { key: t, style: { flexGrow: 1, backgroundColor: THEMES[t].accent } }))),

    h(View, { key: 'content', style: { flexGrow: 1, justifyContent: 'space-between', paddingTop: 56, paddingBottom: 48, paddingLeft: 64, paddingRight: 56 } }, [
      // Top — publisher.
      h(View, { key: 'top', style: { flexDirection: 'row', alignItems: 'center' } }, [
        h(Image, { key: 'lg', src: LOGO, style: { width: 16, height: 16, marginRight: 9 } }),
        h(Text, { key: 'n', style: { fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: C.mid } }, 'ASTYLAB'),
        h(Text, { key: 'd', style: { fontFamily: MONO, fontSize: 9, color: C.faint, letterSpacing: 2.5 } }, '  ·  ΜΑΪΟΣ 2026'),
      ]),

      // Middle — wordmark, tagline, thematic areas.
      h(View, { key: 'mid', style: { marginTop: 'auto', marginBottom: 'auto', paddingVertical: 40 } }, [
        h(Text, { key: 'w', style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.ink, letterSpacing: -2, lineHeight: 1 } }, SITE.wordmark),
        h(Text, { key: 't', style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: C.mid, marginTop: 10 } }, SITE.tagline),
        h(View, { key: 'areas', style: { marginTop: 24 } },
          THEME_ORDER.map((t) => h(Text, { key: t, style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: THEMES[t].accent, lineHeight: 1.55 } }, THEMES[t].label))),
      ]),

      // Foot — metrics + QR, divided by a hairline. Metrics align to a shared
      // baseline; the QR is vertically centred against them.
      h(View, { key: 'foot', style: { borderTopWidth: 1, borderTopColor: C.rule, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } }, [
        h(View, { key: 'metrics', style: { flexDirection: 'row', alignItems: 'flex-end', gap: 40 } },
          SITE.metrics.map((m, i) => h(View, { key: i }, [
            h(Text, { key: 'v', style: { fontFamily: SERIF, fontWeight: 700, fontSize: 24, color: C.ink, lineHeight: 1 } }, m.value),
            h(Text, { key: 'l', style: { fontFamily: MONO, fontSize: 6.5, color: C.faint, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.8 } }, m.label),
          ]))),
        h(View, { key: 'qr', style: { alignItems: 'center' } }, [
          h(View, { key: 'b', style: { backgroundColor: '#fff', padding: 5, borderWidth: 1, borderColor: C.rule, borderRadius: 4 } }, qrSvg(SITE_URL, 64)),
          h(Text, { key: 'c', style: { fontFamily: MONO, fontSize: 7, color: C.light, marginTop: 6, letterSpacing: 1 } }, SITE_HOST),
        ]),
      ]),
    ]),
  ]);
}

// Foreword — its own page, vertically centred, set in the serif italic used for
// leads elsewhere. Front matter, so no running footer or page number.
function ForewordPage() {
  return h(View, { key: 'fw', style: { flexGrow: 1, justifyContent: 'center' } }, [
    h(Text, { key: 'eye', style: { fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: 3, color: C.faint, textAlign: 'center', marginBottom: 18 } }, greekUpper('Πρόλογος')),
    h(View, { key: 'rule', style: { width: 28, height: 2, backgroundColor: C.ink, alignSelf: 'center', marginBottom: 28 } }),
    h(Text, { key: 'body', style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: C.ink, lineHeight: 1.7, textAlign: 'center' } }, inline(foreword, 'fw-')),
  ]);
}

function MethodologySection() {
  const m = methodologia;
  return h(View, { key: 'method', break: true }, [
    marker('methodology'),
    h(Text, { key: 'h', style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 19, color: C.ink, marginBottom: 12 } }, m.title),
    h(Text, { key: 'lead', style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 11.5, color: C.ink, lineHeight: 1.5, marginBottom: 18 } }, m.lead),
    ...m.principles.map((p, i) => h(View, { key: `pr${i}`, wrap: false, style: { marginBottom: 12 } }, [
      h(Text, { key: 't', style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 11.5, color: C.ink, marginBottom: 4 } }, p.title),
      h(Text, { key: 'b', style: { fontSize: 9, color: C.mid, lineHeight: 1.5 } }, p.body),
    ])),
    ...m.sections.map((s, i) => h(View, { key: `sec${i}`, minPresenceAhead: 56, style: { marginTop: 16 } }, [
      h(Text, { key: 't', minPresenceAhead: 40, style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 8 } }, s.title),
      ...body(s.body, `sec${i}-`),
    ])),
    // Pol.is opinion groups
    h(View, { key: 'pg', style: { marginTop: 18 }, wrap: false }, [
      h(Text, { key: 't', style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 10 } }, 'Οι τρεις ομάδες απόψεων'),
      h(View, { key: 'g', style: { flexDirection: 'row', gap: 18 } },
        POLIS_GROUPS_DATA.map((g, i) => h(View, { key: i, style: { flex: 1 } }, [
          h(View, { key: 'row', style: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 } }, [
            iconSvg(ICON_BY_LABEL[g.label], g.color, 12, 'ic'),
            h(Text, { key: 'l', style: { fontSize: 9, fontWeight: 700, color: C.ink } }, [
              h(Text, { key: 'lab', style: { color: g.color } }, g.label), ` · ${g.title}`,
            ]),
          ]),
          h(Text, { key: 'd', style: { fontSize: 8, color: C.light, lineHeight: 1.45 } }, [
            h(Text, { key: 'n', style: { fontFamily: MONO, fontSize: 6.5, color: C.faint } }, `~${g.size.toLocaleString('el')}  `),
            g.desc,
          ]),
        ]))),
    ]),
  ]);
}

// Proposal title cover: the photo backgrounds the eyebrow + title (white),
// darkened a little overall with a heavier wash at the bottom for legibility.
// The image bleeds to the page edge via negative margins.
function proposalTitleCover(d, theme) {
  const data = proposalImageData(d.number);
  const box = { position: 'relative', overflow: 'hidden', marginTop: -PAGE.top, marginLeft: -PAGE.x, marginRight: -PAGE.x, height: 500, marginBottom: 26 };
  const eyebrowText = `ΠΡΟΤΑΣΗ ${String(d.number).padStart(2, '0')}${theme.label ? `  ·  ${theme.label.toUpperCase()}` : ''}`;
  return h(View, { key: 'cover', style: data ? box : { ...box, backgroundColor: theme.accent } }, [
    data ? h(Image, { key: 'img', src: data, style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' } }) : null,
    // even, gentle darkening across the whole image so the white title reads
    h(View, { key: 'scrim', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' } }),
    h(View, { key: 'tx', style: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingLeft: PAGE.x, paddingRight: PAGE.x, paddingBottom: 42 } }, [
      h(Text, { key: 'eye', style: { fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1.6, color: 'rgba(255,255,255,0.92)', marginBottom: 12 } }, eyebrowText),
      h(Text, { key: 'tt', style: { fontFamily: SERIF, fontWeight: 700, fontSize: 27, color: '#fff', lineHeight: 1.12 } }, d.title),
    ]),
  ]);
}

function ProposalPage(d) {
  const theme = themeOf(d.theme);
  const kids = [];
  // Title page: image-backed header + just the summary, then a page break.
  kids.push(proposalTitleCover(d, theme));
  kids.push(marker(`prop-${d.number}`));
  if (d.one_line) kids.push(h(Text, { key: 'ol', style: { fontSize: 12, color: C.mid, lineHeight: 1.55 } }, d.one_line.trim().replace(/\n/g, ' ')));
  // Body — starts on a fresh page.
  const b = [];
  if (d.problem) b.push(proposalSection('Το πρόβλημα', theme.accent, [...body(d.problem.body, `p${d.number}pr-`), ...(d.problem.callouts || []).map((c, i) => calloutBox(c, `p${d.number}pc${i}`))], `s-prob`));
  if (d.proposal) b.push(proposalSection('Η πρόταση', theme.accent, [...body(d.proposal.body, `p${d.number}pp-`), ...(d.proposal.callouts || []).map((c, i) => calloutBox(c, `p${d.number}ppc${i}`))], `s-prop`));
  if (d.implementation?.body) b.push(proposalSection('Υλοποίηση', theme.accent, body(d.implementation.body, `p${d.number}im-`), `s-impl`));
  if (d.limitations?.length) b.push(proposalSection('Περιορισμοί & τρόποι αντιμετώπισης', theme.accent, d.limitations.map((l, i) => h(View, { key: i, minPresenceAhead: 40, style: { marginBottom: 9 } }, [
    h(Text, { key: 'q', style: { fontSize: 9.5, fontWeight: 600, color: C.ink, lineHeight: 1.45, marginBottom: 3 } }, inline(l.q, `p${d.number}lq${i}-`)),
    h(Text, { key: 'a', style: { fontSize: 9, color: C.mid, lineHeight: 1.5 } }, inline(l.a, `p${d.number}la${i}-`)),
  ])), `s-lim`));
  if (d.benefits?.length) b.push(proposalSection('Επιπρόσθετα οφέλη', theme.accent, d.benefits.map((bf, i) => h(View, { key: i, minPresenceAhead: 40, style: { marginBottom: 9 } }, [
    h(Text, { key: 't', style: { fontSize: 9.5, fontWeight: 600, color: C.ink, marginBottom: 3 } }, bf.title),
    ...body(bf.body, `p${d.number}bf${i}-`),
  ])), `s-ben`));
  if (d.polis?.length) b.push(proposalSection('Από το Pol.is', theme.accent, d.polis.map((p, i) => polisCard(p, `p${d.number}po${i}`)), `s-polis`));
  if (d.references?.length) b.push(referencesBlock(d.references, `p${d.number}`));
  if (b.length) kids.push(h(View, { key: 'body', break: true }, b));
  return h(Page, { key: `prop-${d.number}`, size: 'A4', style: bodyPageStyle }, [Footer(), ...kids]);
}

// Section (goal) cover: the whole page is the area's proposal images, split into
// equal horizontal bands, each cover-cropped; the goal name sits on a centred plate.
function SectionCoverPage(t) {
  const theme = THEMES[t];
  const items = proposals.filter((p) => p.theme === t).sort((a, b) => a.number - b.number);
  // Explicit per-band height — react-pdf doesn't distribute flexGrow heights for
  // images, so each band gets an exact slice of the page.
  const bandH = Math.floor(A4_H / items.length);
  // The goal label sits on the second image — the only band we darken (falls back
  // to the first if the area has a single proposal).
  const labelIdx = items.length > 1 ? 1 : 0;
  const bands = items.map((d, i) => {
    const data = proposalImageData(d.number);
    const labelled = i === labelIdx;
    // Photo label band → theme-colour tint; placeholder label band → darker accent (so white text reads).
    const bg = labelled && !data ? darken(theme.accent, 0.6) : themeOf(d.theme).accent;
    return h(View, { key: `b${i}`, style: { height: bandH, overflow: 'hidden', position: 'relative', backgroundColor: bg } }, [
      data ? h(Image, { key: 'i', src: data, style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' } }) : null,
      labelled && data ? h(View, { key: 'sc', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hexToRgba(theme.accent, 0.5) } }) : null,
      labelled ? h(View, { key: 'lab', style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', paddingLeft: 54, paddingRight: 54 } }, [
        marker(`area-${t}`),
        h(Text, { key: 'k', style: { fontFamily: MONO, fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.92)', marginBottom: 12 } }, `ΣΤΟΧΟΣ ${THEME_ORDER.indexOf(t) + 1}`),
        h(Text, { key: 'l', style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.1 } }, theme.label),
      ]) : null,
    ]);
  });
  // Theme-colour rail down the left edge (as on the cover).
  const leftBar = h(View, { key: 'bar', style: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 12, backgroundColor: theme.accent } });
  return h(Page, { key: `area-${t}`, size: 'A4', style: { flexDirection: 'column', backgroundColor: C.ink } }, [...bands, leftBar]);
}

function calloutBox(text, key) {
  return h(View, { key, wrap: false, style: { borderWidth: 1, borderColor: C.rule, borderRadius: 3, padding: 10, marginTop: 4, marginBottom: 10, backgroundColor: C.card } },
    body(text, `${key}-`, { marginBottom: 0, fontSize: 9.5, color: C.mid }));
}

function referencesBlock(refs, keyPrefix) {
  return h(View, { key: `${keyPrefix}refs`, style: { marginTop: 8 } }, [
    eyebrow('Παραπομπές', { fontSize: 8, color: C.faint, marginBottom: 8 }, 'eyb'),
    ...refs.map((r, i) => {
      const text = r.text
        ? r.text
        : [r.author, r.title, r.year].filter(Boolean).join(', ') + (r.publication ? `. ${r.publication}` : '');
      return h(View, { key: i, wrap: false, style: { flexDirection: 'row', marginBottom: 5 } }, [
        h(Text, { key: 'n', style: { fontFamily: MONO, fontSize: 7, color: C.faint, width: 15 } }, `${r.n}.`),
        h(Text, { key: 't', style: { flex: 1, fontSize: 8.5, color: C.light, lineHeight: 1.45 } }, [
          text, r.url ? h(Text, { key: 'u', style: { color: C.light } }, `  ${r.url}`) : null,
        ]),
      ]);
    }),
  ]);
}

function AckSection() {
  return h(View, { key: 'ack' }, [
    marker('ack'),
    h(Text, { key: 'h', style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 19, color: C.ink, marginBottom: 12 } }, 'Ευχαριστίες'),
    h(Text, { key: 'f', style: { fontSize: 9.5, color: C.mid, lineHeight: 1.6, marginBottom: 14 } }, inline(ack.funding, 'fund-')),
    h(Text, { key: 'a', style: { fontSize: 9.5, color: C.mid, marginBottom: 16 } }, [
      h(Text, { key: 'l', style: { fontFamily: MONO, fontSize: 7, color: C.faint } }, 'ΣΥΝΤΑΞΗ  '),
      ack.authors.join(' · '),
    ]),
    eyebrow(`${ack.experts.length} ΕΙΔΙΚΟΙ`, { fontSize: 7.5, marginBottom: 8 }, 'eyb'),
    h(View, { key: 'ex', style: { flexDirection: 'row', flexWrap: 'wrap' } },
      ack.experts.map((n, i) => h(Text, { key: i, style: { width: '33%', fontSize: 9, color: C.ink, lineHeight: 1.4, marginBottom: 5, paddingRight: 8 } }, n))),
  ]);
}

// Full-bleed graphic page: diagonal stripes, one per proposal. The page splits in
// two — the first ten proposals fill the top half, the rest the bottom — each
// stripe showing its proposal's image (theme colour where no image exists yet).
function StripesPage() {
  const all = [...proposals].sort((a, b) => a.number - b.number);
  const W = 595.28; const H = 841.89; const Hh = H / 2; const ANGLE = 22;
  const th = ANGLE * Math.PI / 180;
  // Container sized to exactly cover a half after rotation, so the N stripes stay
  // evenly spaced and bleed to every edge (no corner gaps).
  const CW = W * Math.cos(th) + Hh * Math.sin(th) + 20;
  const CH = W * Math.sin(th) + Hh * Math.cos(th) + 40;
  const halfBand = (items, top, angle, key) => {
    const sw = CW / Math.max(items.length, 1);
    return h(View, { key, style: { position: 'absolute', top, left: 0, width: W, height: Hh, overflow: 'hidden', backgroundColor: C.ink } },
      h(View, { key: 'rot', style: { position: 'absolute', left: (W - CW) / 2, top: (Hh - CH) / 2, width: CW, height: CH, flexDirection: 'row', transform: `rotate(${angle}deg)` } },
        items.map((p, i) => {
          const data = proposalImageData(p.number);
          // The stripe (clip window) is rotated with the container; counter-rotate
          // the image by the same angle so it reads upright through the angled cut.
          return h(View, { key: i, style: { width: sw, height: CH, overflow: 'hidden', position: 'relative', backgroundColor: themeOf(p.theme).accent } },
            data ? h(Image, { key: 'i', src: data, style: { position: 'absolute', top: 0, left: (sw - CH) / 2, width: CH, height: CH, objectFit: 'cover', objectPosition: 'center', transform: `rotate(${-angle}deg)` } }) : null);
        })));
  };
  // Mirrored diagonals — top leans one way, bottom the other (a chevron at the split).
  return h(Page, { key: 'stripes', size: 'A4', style: { backgroundColor: C.ink } }, [
    halfBand(all.slice(0, 10), 0, -ANGLE, 'top'),
    halfBand(all.slice(10), Hh, ANGLE, 'bottom'),
  ]);
}

function TableOfContents() {
  const tocRow = (label, page, { indent = 0, bold = false } = {}) => h(View, {
    key: `t-${label}`,
    style: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 5, paddingLeft: indent },
  }, [
    h(Text, { key: 'l', style: { flex: 1, fontSize: 10, color: C.ink, fontWeight: bold ? 700 : 400 } }, label),
    h(Text, { key: 'p', style: { fontFamily: MONO, fontSize: 8.5, color: C.faint, marginLeft: 10 } }, page ? String(page) : ''),
  ]);

  const rows = [
    h(Text, { key: 'h', style: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 19, color: C.ink, marginBottom: 18 } }, 'Περιεχόμενα'),
    tocRow('Μεθοδολογία', pageOf.methodology, { bold: true }),
  ];
  for (const t of THEME_ORDER) {
    const items = proposals.filter((p) => p.theme === t).sort((a, b) => a.number - b.number);
    if (!items.length) continue;
    rows.push(h(View, { key: `area-${t}`, style: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12, marginBottom: 7 } }, [
      h(Text, { key: 'l', style: { flex: 1, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 11, color: THEMES[t].accent } }, THEMES[t].label),
      h(Text, { key: 'p', style: { fontFamily: MONO, fontSize: 8.5, color: C.faint, marginLeft: 10 } }, pageOf[`area-${t}`] ? String(pageOf[`area-${t}`]) : ''),
    ]));
    for (const d of items) {
      rows.push(tocRow(`${String(d.number).padStart(2, '0')}   ${d.title}`, pageOf[`prop-${d.number}`], { indent: 4 }));
    }
  }
  rows.push(h(View, { key: 'sp', style: { marginTop: 12 } }, [tocRow('Ευχαριστίες', pageOf.ack, { bold: true })]));
  return h(View, { key: 'toc' }, rows);
}

const FOOT = { fontFamily: MONO, fontSize: 7, color: C.faint, letterSpacing: 1 };
function Footer() {
  // Book-style running foot: page number on the outer edge, the running area on
  // the inner edge — sides swap on odd/even pages.
  return h(View, {
    key: 'foot', fixed: true,
    style: { position: 'absolute', bottom: 24, left: 54, right: 54, flexDirection: 'row', justifyContent: 'space-between' },
  }, [
    h(Text, { key: 'l', style: FOOT, render: ({ pageNumber, totalPages }) => { pageOf.__total = totalPages; return pageNumber % 2 === 1 ? (areaByPage[pageNumber] || 'PLAN A') : String(pageNumber); } }),
    h(Text, { key: 'r', style: FOOT, render: ({ pageNumber }) => (pageNumber % 2 === 1 ? String(pageNumber) : (areaByPage[pageNumber] || 'PLAN A')) }),
  ]);
}

// ── Document ─────────────────────────────────────────────────────────────────
const buildDoc = () => h(Document, { title: 'Plan A — 20 προτάσεις για την Αθήνα', author: 'Astylab' }, [
  h(Page, { key: 'cover', size: 'A4', style: { backgroundColor: C.bg } }, CoverPage()),
  StripesPage(),
  h(Page, { key: 'foreword', size: 'A4', style: { backgroundColor: C.bg, paddingHorizontal: 92, paddingVertical: 72 } }, ForewordPage()),
  // Front matter: contents + methodology.
  h(Page, { key: 'front', size: 'A4', style: bodyPageStyle }, [
    Footer(),
    TableOfContents(),
    MethodologySection(),
  ]),
  // Each goal: a full-bleed section cover, then one page per proposal.
  ...THEME_ORDER.flatMap((t) => {
    const items = proposals.filter((p) => p.theme === t).sort((a, b) => a.number - b.number);
    if (!items.length) return [];
    return [SectionCoverPage(t), ...items.map((d) => ProposalPage(d))];
  }),
  h(Page, { key: 'ack', size: 'A4', style: bodyPageStyle }, [Footer(), AckSection()]),
]);

// Pass 1 fills pageOf + total via the markers/footer; then map pages → running area.
await renderToBuffer(buildDoc());
const total = pageOf.__total || 0;
const sections = [];
if (pageOf.methodology) sections.push({ page: pageOf.methodology, label: 'Μεθοδολογία' });
for (const d of proposals) { if (pageOf[`prop-${d.number}`]) sections.push({ page: pageOf[`prop-${d.number}`], label: themeOf(d.theme).label || '' }); }
if (pageOf.ack) sections.push({ page: pageOf.ack, label: 'Ευχαριστίες' });
sections.sort((a, b) => a.page - b.page);
areaByPage = {};
sections.forEach((s, i) => {
  const end = i + 1 < sections.length ? sections[i + 1].page - 1 : total;
  for (let p = s.page; p <= end; p++) areaByPage[p] = greekUpper(s.label);
});

const targets = ['public/plan-a.pdf', existsSync('dist') ? 'dist/plan-a.pdf' : null].filter(Boolean);
for (const out of targets) {
  await renderToFile(buildDoc(), out);
  console.log(`Generated ${out}`);
}
