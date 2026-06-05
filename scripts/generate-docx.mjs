// Generate one editable Word document per proposal, bundled into a single zip,
// to let a non-technical author review and edit the proposal content without
// touching YAML. Runs in Node at build time, reading the raw proposal YAMLs and
// laying each one out with the `docx` library. Output:
// public/plan-a-proposals-docx.zip (served locally; gitignored and regenerated
// every build) and, when present, dist/plan-a-proposals-docx.zip for the deploy.
//
// The documents exist to make the proposal PROSE easily editable, so they carry
// no graphics: rich text (**bold**, *italic*, [links](url)) becomes real Word
// formatting and footnote markers (^N) become superscript numbers tied to a
// Παραπομπές list, but anything visual is reduced to a short text marker the
// author can leave in place — Pol.is statements become "[POLIS: #27]" and charts
// become "[ΓΡΑΦΗΜΑ — ραβδόγραμμα: «…» (πηγή: …)]". The section order mirrors the
// web proposal page and the PDF (see scripts/generate-pdf.mjs).
//
// Keep the inline/body parsing here in sync with src/lib/format-text.jsx and
// scripts/generate-pdf.mjs — all three parse the same markdown-lite dialect.

import yaml from 'js-yaml';
import JSZip from 'jszip';
import {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
} from 'docx';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import { themeOf } from '../src/lib/theme.js';
import { nextStepTitles } from '../src/lib/next-steps.mjs';

// ── Read raw data (same discovery as generate-pdf.mjs) ───────────────────────
const proposals = readdirSync('proposals')
  .filter((f) => /^\d.*\.yaml$/.test(f))
  .map((f) => ({ file: f, data: yaml.load(readFileSync(join('proposals', f), 'utf8')) }))
  .filter((p) => p.data && p.data.number && p.data.title)
  .sort((a, b) => a.data.number - b.data.number);

// ── Inline markdown-ish parser → array of docx runs ──────────────────────────
// Supports **bold**, *italic* / _italic_, [label](url) links (url may contain one
// level of nested parens, for DOIs), and ^N / ^[N] footnote refs (→ superscript).
// Mirrors the chain in src/lib/format-text.jsx: footnotes → links → bold → italic.
const LINK_RE = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;

// bold/italic only, returning TextRuns that carry `base` (e.g. the Hyperlink
// style for link labels) plus the right bold/italic flags.
function fmtRuns(text, base = {}) {
  const out = [];
  const pushItalic = (s, bold) => {
    const itRe = /(?:\*([^*]+)\*|_([^_]+)_)/g;
    let li = 0; let im;
    while ((im = itRe.exec(s)) !== null) {
      if (im.index > li) out.push(new TextRun({ ...base, text: s.slice(li, im.index), bold }));
      out.push(new TextRun({ ...base, text: im[1] || im[2], bold, italics: true }));
      li = im.index + im[0].length;
    }
    if (li < s.length) out.push(new TextRun({ ...base, text: s.slice(li), bold }));
  };
  const boldRe = /\*\*([^*]+)\*\*/g;
  let lb = 0; let bm;
  while ((bm = boldRe.exec(text)) !== null) {
    if (bm.index > lb) pushItalic(text.slice(lb, bm.index), false);
    pushItalic(bm[1], true);
    lb = bm.index + bm[0].length;
  }
  if (lb < text.length) pushItalic(text.slice(lb), false);
  return out;
}

function runs(text) {
  if (text == null) return [];
  const out = [];
  // 1) split off footnote markers → superscript numbers
  const fnRe = /\^\[(\d+)\]|\^(\d+)/g;
  let last = 0; let m; const chunks = [];
  while ((m = fnRe.exec(text)) !== null) {
    if (m.index > last) chunks.push({ t: 'txt', v: text.slice(last, m.index) });
    chunks.push({ t: 'fn', v: m[1] || m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) chunks.push({ t: 'txt', v: text.slice(last) });

  for (const c of chunks) {
    if (c.t === 'fn') { out.push(new TextRun({ text: String(c.v), superScript: true })); continue; }
    // 2) split text on links; non-link segments get bold/italic formatting
    let ll = 0; let lm;
    LINK_RE.lastIndex = 0;
    while ((lm = LINK_RE.exec(c.v)) !== null) {
      if (lm.index > ll) out.push(...fmtRuns(c.v.slice(ll, lm.index)));
      out.push(new ExternalHyperlink({ link: lm[2], children: fmtRuns(lm[1], { style: 'Hyperlink' }) }));
      ll = lm.index + lm[0].length;
    }
    if (ll < c.v.length) out.push(...fmtRuns(c.v.slice(ll)));
  }
  return out.length ? out : [new TextRun('')];
}

// ── Block parser: markdown-lite body string → array of Paragraphs ────────────
// Mirrors the `body()` block logic in format-text.jsx / generate-pdf.mjs:
// blank-line separated blocks → ## / ### headings, "- " bullets, "N." ordered
// lists, or plain paragraphs (single newlines folded to spaces).
// Inline callout fence: ::: callout … ::: becomes a bordered box exactly where
// it sits in the prose. Mirrors src/lib/format-text.jsx. A FRESH regex is built
// per call — bodyParas recurses (via calloutBox), so a shared /g regex's
// lastIndex would be corrupted reentrantly.
function bodyParas(text, paraOpts = {}) {
  if (!text) return [];
  if (text.includes(':::')) {
    const fence = /:::[ \t]*callout\s*([\s\S]*?)\s*:::/g;
    const out = [];
    let last = 0, m;
    while ((m = fence.exec(text)) !== null) {
      const chunk = text.slice(last, m.index);
      if (chunk.trim()) out.push(...bodyParas(chunk, paraOpts));
      out.push(calloutBox(m[1].trim()));
      out.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      last = m.index + m[0].length;
    }
    const tail = text.slice(last);
    if (tail.trim()) out.push(...bodyParas(tail, paraOpts));
    return out;
  }
  return text.trim().split(/\n{2,}/).flatMap((block) => {
    const t = block.trim();
    if (t.startsWith('### ')) return [new Paragraph({ heading: HeadingLevel.HEADING_4, children: runs(t.slice(4)) })];
    if (t.startsWith('## ')) return [new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(t.slice(3)) })];
    const lines = t.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => /^-\s+/.test(l))) {
      return lines.map((l) => new Paragraph({ children: runs(l.replace(/^-\s+/, '')), bullet: { level: 0 }, spacing: { after: 60 } }));
    }
    const ol = lines.map((l) => l.match(/^(\d+)\.\s+(.*)$/));
    if (lines.length && ol.every(Boolean)) {
      // Manual "N. " prefix (no Word numbering instance needed) keeps the file
      // simple and the numbers editable as plain text.
      return ol.map((mm) => new Paragraph({ children: [new TextRun(`${mm[1]}. `), ...runs(mm[2])], spacing: { after: 60 }, indent: { left: 360 } }));
    }
    return [new Paragraph({ children: runs(t.replace(/\n/g, ' ')), spacing: { after: 160 }, ...paraOpts })];
  });
}

// ── Visual building blocks ───────────────────────────────────────────────────
const C_RULE = 'D9D4CB';      // hairline
const C_FILL = 'F4F2EC';      // callout / header-cell fill
const C_FAINT = '8A8578';     // muted labels

const sectionHeading = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text })],
});

// A callout: a single-cell, shaded, bordered box wrapping the parsed body.
function calloutBox(text) {
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: C_RULE };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder, insideHorizontal: cellBorder, insideVertical: cellBorder },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.SOLID, color: 'auto', fill: C_FILL },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: bodyParas(text, { spacing: { after: 80 } }),
      })],
    })],
  });
}

// ── Pol.is statement → a plain text marker, cited by number ──────────────────
// We deliberately DON'T reproduce the interactive widget or its vote numbers —
// the point of these documents is editable prose. A Pol.is statement is just
// flagged in place so the author knows it's there.  e.g.  [POLIS: #27]
function polisMarker(p) {
  const id = p.statement_id != null ? `#${p.statement_id}` : '—';
  const children = [new TextRun({ text: `[POLIS: ${id}]`, bold: true, color: C_FAINT })];
  if (p.statement) children.push(new TextRun({ text: '  ' }), ...runs(p.statement));
  return new Paragraph({ spacing: { before: 80, after: 120 }, children });
}

// ── Chart → a one-line text description, not drawn ───────────────────────────
// e.g.  [ΓΡΑΦΗΜΑ — ραβδόγραμμα: «Τίτλος» (πηγή: Πηγή, 2023)]
function chartMarker(ch) {
  const src = [ch.source, ch.year].filter(Boolean).join(', ');
  const label = `[ΓΡΑΦΗΜΑ — ραβδόγραμμα: «${ch.title}»${src ? ` (πηγή: ${src})` : ''}]`;
  return new Paragraph({ spacing: { before: 80, after: 160 }, children: [new TextRun({ text: label, italics: true, color: C_FAINT })] });
}

// ── References block ─────────────────────────────────────────────────────────
function referencesBlocks(refs) {
  const out = [sectionHeading('Παραπομπές')];
  for (const r of refs) {
    const children = [new TextRun({ text: `${r.n}. `, bold: true })];
    if (r.text) {
      children.push(new TextRun({ text: r.text }));
    } else {
      const parts = [];
      if (r.author) parts.push(new TextRun({ text: r.author }));
      if (r.title) { if (parts.length) parts.push(new TextRun({ text: ', ' })); parts.push(new TextRun({ text: r.title, italics: true })); }
      if (r.year) { if (parts.length) parts.push(new TextRun({ text: ', ' })); parts.push(new TextRun({ text: String(r.year) })); }
      if (r.publication) parts.push(new TextRun({ text: `. ${r.publication}` }));
      children.push(...parts);
    }
    if (r.url) {
      children.push(new TextRun({ text: '  ' }));
      children.push(new ExternalHyperlink({ link: r.url, children: [new TextRun({ text: r.url, style: 'Hyperlink', size: 18 })] }));
    }
    out.push(new Paragraph({ spacing: { after: 80 }, children }));
  }
  return out;
}

// ── A section: heading + parsed body + optional callouts ──────────────────────
function section(title, body, callouts) {
  const out = [sectionHeading(title)];
  if (body) out.push(...bodyParas(body));
  for (const c of (callouts || [])) { out.push(calloutBox(c)); out.push(new Paragraph({ spacing: { after: 80 }, children: [] })); }
  return out;
}

// ── Build one proposal document ───────────────────────────────────────────────
function buildProposalDoc(file, d) {
  const theme = themeOf(d.theme);
  const children = [];

  // Title + a small machine-readable map back to the source file, so an editor
  // knows exactly which YAML each document corresponds to.
  children.push(new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [new TextRun({ text: `Πρόταση ${String(d.number).padStart(2, '0')} — ${d.title}` })],
  }));
  children.push(new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text: `αρχείο: ${file}   ·   στόχος: ${theme.label || d.theme}`, color: C_FAINT, size: 16 })],
  }));
  if (d.one_line) children.push(new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: d.one_line.trim().replace(/\n/g, ' '), italics: true, size: 26 })] }));

  // Section order mirrors the web proposal page and the PDF.
  if (d.problem) children.push(...section('Το πρόβλημα', d.problem.body, d.problem.callouts));
  if (d.proposal) children.push(...section('Η πρόταση', d.proposal.body, d.proposal.callouts));

  if (d.polis?.length) {
    children.push(sectionHeading('Από το Pol.is'));
    for (const p of d.polis) children.push(polisMarker(p));
  }

  if (d.contribution?.body || d.contribution?.charts?.length) {
    children.push(sectionHeading(`Πώς συμβάλλει στον στόχο «${theme.label || d.theme}»`));
    if (d.contribution.body) children.push(...bodyParas(d.contribution.body));
    for (const c of (d.contribution.callouts || [])) { children.push(calloutBox(c)); children.push(new Paragraph({ spacing: { after: 80 }, children: [] })); }
    for (const ch of (d.contribution.charts || [])) children.push(chartMarker(ch));
    if (d.contribution.body_after) children.push(...bodyParas(d.contribution.body_after));
  }

  if (d.implementation?.body) children.push(...section('Υλοποίηση', d.implementation.body));

  if (d.limitations?.length) {
    children.push(sectionHeading('Ζητήματα υλοποίησης'));
    for (const l of d.limitations) {
      children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: l.q, bold: true })] }));
      children.push(...bodyParas(l.a));
    }
  }

  if (d.benefits?.length) {
    children.push(sectionHeading('Επιπρόσθετα οφέλη'));
    for (const b of d.benefits) {
      children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: b.title, bold: true })] }));
      if (b.body) children.push(...bodyParas(b.body));
      for (const c of (b.callouts || [])) { children.push(calloutBox(c)); children.push(new Paragraph({ spacing: { after: 80 }, children: [] })); }
    }
  }

  if (d.next_steps?.length) {
    children.push(sectionHeading('Δύο ενδεικτικά επόμενα βήματα'));
    const nsTitles = nextStepTitles(d.next_steps);
    d.next_steps.forEach((s, i) => {
      children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: nsTitles[i], bold: true })] }));
      if (s.body) children.push(...bodyParas(s.body));
    });
  }

  if (d.references?.length) children.push(...referencesBlocks(d.references));

  return new Document({
    title: `Πρόταση ${d.number} — ${d.title}`,
    creator: 'Astylab · Plan A',
    description: `Επεξεργάσιμη έκδοση της πρότασης ${d.number} (${file})`,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children }],
  });
}

// ── Emit the zip ──────────────────────────────────────────────────────────────
const zip = new JSZip();

const readme = [
  'PLAN A — Επεξεργάσιμες προτάσεις (.docx)',
  '',
  'Κάθε αρχείο .docx αντιστοιχεί σε μία πρόταση. Η πρώτη γραμμή κάθε εγγράφου',
  'αναφέρει το αρχείο YAML από το οποίο προέρχεται (π.χ. 01-...-.yaml).',
  '',
  'Μπορείτε να επεξεργαστείτε ελεύθερα το κείμενο: τα έντονα/πλάγια και οι',
  'σύνδεσμοι διατηρούνται ως μορφοποίηση του Word. Οι αριθμοί σε εκθέτη (π.χ.',
  '¹) είναι παραπομπές που αντιστοιχούν στη λίστα «Παραπομπές» στο τέλος.',
  '',
  'Τα έγγραφα δεν περιέχουν γραφικά. Όπου ο ιστότοπος έχει γράφημα ή στοιχεία',
  'Pol.is, υπάρχει ένας σύντομος δείκτης μέσα σε αγκύλες — π.χ. [POLIS: #27]',
  'ή [ΓΡΑΦΗΜΑ — ραβδόγραμμα: «…»]. Αφήστε τους δείκτες ως έχουν.',
  '',
  `Δημιουργήθηκε αυτόματα από ${proposals.length} προτάσεις.`,
].join('\n');
zip.file('README.txt', readme);

for (const { file, data } of proposals) {
  const doc = buildProposalDoc(file, data);
  const buffer = await Packer.toBuffer(doc);
  const name = file.replace(/\.yaml$/, '.docx');
  zip.file(name, buffer);
}

const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
const targets = ['public/plan-a-proposals-docx.zip', existsSync('dist') ? 'dist/plan-a-proposals-docx.zip' : null].filter(Boolean);
for (const target of targets) {
  writeFileSync(target, out);
  console.log(`Generated ${target} (${proposals.length} proposals, ${(out.length / 1024).toFixed(0)} KB)`);
}
