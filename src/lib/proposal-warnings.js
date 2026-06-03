// Static content linter for proposals. Runs entirely on the parsed YAML data
// (no network) and surfaces likely authoring mistakes: footnotes with no
// matching reference, references that are never cited or have no link,
// malformed link URLs, Pol.is percentages that don't add up, chart/source
// issues, invalid theme, etc.
//
// NOTE: this checks STRUCTURE, not HTTP liveness — it can't tell a 404 from a
// live page (cross-origin requests are opaque in the browser). It catches the
// classes of error that are detectable offline.
import { THEMES } from './theme';

const FN_RE = /\^\[(\d+)\]|\^(\d+)/g;
// Matches the same link shape the renderer accepts, including URLs with one
// level of nested parentheses (e.g. DOIs like "PIIS0140-6736(16)30383-X").
const LINK_RE = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;

// Gather every rich-text string in a proposal, tagged with the field it came
// from (so warnings can point at the right place).
function gatherTexts(d) {
  const out = [];
  const add = (field, text) => { if (text && typeof text === 'string') out.push({ field, text }); };

  add('one_line', d.one_line);
  for (const sec of ['problem', 'proposal', 'contribution', 'implementation']) {
    const s = d[sec];
    if (!s) continue;
    add(`${sec}.body`, s.body);
    add(`${sec}.body_after`, s.body_after);
    (s.callouts || []).forEach((c, i) => add(`${sec}.callouts[${i}]`, c));
  }
  (d.limitations || []).forEach((l, i) => {
    add(`limitations[${i}].q`, l?.q);
    add(`limitations[${i}].a`, l?.a);
  });
  (d.benefits || []).forEach((b, i) => {
    add(`benefits[${i}].body`, b?.body);
    (b?.callouts || []).forEach((c, j) => add(`benefits[${i}].callouts[${j}]`, c));
  });
  (d.next_steps || []).forEach((s, i) => add(`next_steps[${i}].body`, s?.body));
  return out;
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

// Returns an array of { number, title, slug, level, field, message } for one
// proposal entry. `level` is 'error' | 'warn' | 'info'.
function warningsFor(entry) {
  const d = entry.data;
  const w = [];
  const push = (level, message, field) =>
    w.push({ number: d.number, title: d.title, slug: entry.slug, level, message, field });

  // ── theme ────────────────────────────────────────────────────────────────
  if (!d.theme || !THEMES[d.theme]) {
    push('error', `Invalid theme "${d.theme ?? ''}" (must be a key of THEMES)`, 'theme');
  }
  if (!norm(d.one_line)) push('warn', 'Missing one_line (cover/teaser text)', 'one_line');

  const texts = gatherTexts(d);
  const allText = texts.map((t) => t.text).join('\n');

  // ── footnotes ↔ references ─────────────────────────────────────────────────
  const usedFn = new Set();
  let m;
  FN_RE.lastIndex = 0;
  while ((m = FN_RE.exec(allText)) !== null) usedFn.add(Number(m[1] || m[2]));

  const refs = d.references || [];
  const refNums = new Set(refs.map((r) => r.n));

  for (const n of usedFn) {
    if (!refNums.has(n)) push('error', `Footnote ^${n} has no matching reference`, 'references');
  }
  const seen = new Set();
  for (const r of refs) {
    if (seen.has(r.n)) push('error', `Duplicate reference number [${r.n}]`, 'references');
    seen.add(r.n);
    if (!usedFn.has(r.n)) push('warn', `Reference [${r.n}] is never cited (no ^${r.n} in the text)`, 'references');
    if (!r.url || !/^https?:\/\//.test(r.url)) {
      push('warn', `Reference [${r.n}] has no link (url)`, 'references');
    } else if (/\s/.test(r.url)) {
      push('error', `Reference [${r.n}] url contains whitespace: "${r.url}"`, 'references');
    }
  }

  // ── inline links ───────────────────────────────────────────────────────────
  for (const { field, text } of texts) {
    LINK_RE.lastIndex = 0;
    let lm;
    while ((lm = LINK_RE.exec(text)) !== null) {
      const label = lm[1];
      const url = lm[2];
      const okShape = /^(https?:\/\/|\/|#|mailto:)/.test(url) && !/\s/.test(url);
      if (!okShape) {
        push('error', `Malformed link URL "${url}" (label: "${label.slice(0, 30)}")`, field);
        continue;
      }
      // House style is an inline link immediately followed by a ^N footnote.
      const after = text.slice(lm.index + lm[0].length);
      if (/^https?:\/\//.test(url) && !/^\s*\^/.test(after)) {
        push('info', `External link without a footnote: "${label.slice(0, 40)}"`, field);
      }
    }
  }

  // ── Pol.is percentages ─────────────────────────────────────────────────────
  (d.polis || []).forEach((p, i) => {
    const check = (o, where) => {
      if (!o) return;
      const sum = (o.agree || 0) + (o.disagree || 0) + (o.pass || 0);
      if (sum < 95 || sum > 105) {
        push('warn', `Pol.is statement ${i + 1} (${where}) percentages sum to ${sum}% (expected ~100)`, `polis[${i}]`);
      }
    };
    check(p.overall, 'overall');
    (p.groups || []).forEach((g) => check(g, `group ${g.label}`));
  });

  // ── charts ─────────────────────────────────────────────────────────────────
  (d.contribution?.charts || []).forEach((c, i) => {
    const name = c.label || c.title || `#${i + 1}`;
    if (!c.source) push('warn', `Chart "${name}" has no source`, `contribution.charts[${i}]`);
    if (c.source && !c.source_url) push('info', `Chart "${name}" has a source but no source_url`, `contribution.charts[${i}]`);
    if (!c.data?.length) {
      push('error', `Chart "${name}" has no data`, `contribution.charts[${i}]`);
    } else {
      const hi = c.highlight || 'Αθήνα';
      if (!c.data.some((x) => x.label === hi)) {
        push('warn', `Chart "${name}": highlight "${hi}" not found in data`, `contribution.charts[${i}]`);
      }
      const bad = c.data.filter((x) => typeof x.value !== 'number' || x.value < 0 || x.value > 100);
      if (bad.length) push('warn', `Chart "${name}" has ${bad.length} value(s) outside 0–100`, `contribution.charts[${i}]`);
    }
  });

  // ── one_line duplicates Η πρόταση ──────────────────────────────────────────
  if (d.one_line && d.proposal?.body) {
    const ol = norm(d.one_line);
    if (ol.length > 40 && norm(d.proposal.body).includes(ol)) {
      push('info', 'one_line duplicates the start of "Η πρόταση"', 'one_line');
    }
  }

  return w;
}

const LEVEL_RANK = { error: 0, warn: 1, info: 2 };

// Collect warnings across all proposals, sorted by proposal number then severity.
export function collectWarnings(proposals) {
  const all = proposals.flatMap(warningsFor);
  all.sort((a, b) => a.number - b.number || LEVEL_RANK[a.level] - LEVEL_RANK[b.level]);
  return all;
}

// Highest severity present in a list ('error' > 'warn' > 'info'), or null.
export function topLevel(warnings) {
  if (warnings.some((x) => x.level === 'error')) return 'error';
  if (warnings.some((x) => x.level === 'warn')) return 'warn';
  if (warnings.some((x) => x.level === 'info')) return 'info';
  return null;
}
