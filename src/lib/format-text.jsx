// Lightweight text renderer for proposal body fields.
// Supports: **bold**, *italic*, [label](url) links, ^N or ^[N] footnote refs,
// blank-line paragraphs.
// Footnote refs become clickable superscripts that scroll to #ref-N.

import { Fragment } from 'react';
import { C, EYEBROW, SECTION_HEAD } from './theme';

function FootnoteRef({ n, onClick }) {
  return (
    <a
      href={`#ref-${n}`}
      onClick={(e) => { if (onClick) onClick(e, n); }}
      style={{
        fontFamily: C.mono,
        fontSize: '0.7em',
        verticalAlign: 'super',
        lineHeight: 0,
        color: C.light,
        textDecoration: 'none',
        marginLeft: 1,
        padding: '0 2px',
      }}
    >
      {n}
    </a>
  );
}

// Inline parser: handles **bold**, *italic*, ^N, ^[N]
function parseInline(text, onRefClick, keyPrefix = '') {
  if (!text) return [];

  // First, split on footnote markers ^N or ^[NN]
  const fnRe = /\^\[(\d+)\]|\^(\d+)/g;
  const pieces = [];
  let lastIdx = 0;
  let match;
  while ((match = fnRe.exec(text)) !== null) {
    if (match.index > lastIdx) {
      pieces.push({ kind: 'text', value: text.slice(lastIdx, match.index) });
    }
    pieces.push({ kind: 'fn', n: Number(match[1] || match[2]) });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) pieces.push({ kind: 'text', value: text.slice(lastIdx) });

  // Now render each piece, splitting text pieces on links then bold/italic
  return pieces.flatMap((p, i) => {
    if (p.kind === 'fn') return <FootnoteRef key={`${keyPrefix}fn-${i}`} n={p.n} onClick={onRefClick} />;
    return splitLinks(p.value, `${keyPrefix}t${i}-`);
  });
}

// Split text on [label](url) markdown links. Non-link runs fall through to
// bold/italic. External links open in a new tab; the label keeps inline styling.
function splitLinks(text, keyPrefix) {
  // URL group allows one level of nested parentheses so DOIs / publisher URLs
  // like ".../PIIS0140-6736(16)30383-X/abstract" aren't truncated at the "(".
  const re = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;
  const out = [];
  let lastIdx = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(...splitBoldItalic(text.slice(lastIdx, m.index), `${keyPrefix}l${i}p-`));
    const external = /^https?:\/\//.test(m[2]);
    out.push(
      <a
        key={`${keyPrefix}l${i}`}
        href={m[2]}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        {splitBoldItalic(m[1], `${keyPrefix}l${i}i-`)}
      </a>,
    );
    lastIdx = m.index + m[0].length;
    i++;
  }
  if (lastIdx < text.length) out.push(...splitBoldItalic(text.slice(lastIdx), `${keyPrefix}l${i}p-`));
  return out;
}

function splitBoldItalic(text, keyPrefix) {
  // Split on **bold** then *italic*. ** must be matched first so we don't eat single *s inside **.
  const out = [];
  const boldRe = /\*\*([^*]+)\*\*/g;
  let lastIdx = 0;
  let m;
  let i = 0;
  while ((m = boldRe.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(...splitItalic(text.slice(lastIdx, m.index), `${keyPrefix}b${i}p-`));
    out.push(<strong key={`${keyPrefix}b${i}`} style={{ fontWeight: 600, color: C.ink }}>{splitItalic(m[1], `${keyPrefix}b${i}i-`)}</strong>);
    lastIdx = m.index + m[0].length;
    i++;
  }
  if (lastIdx < text.length) out.push(...splitItalic(text.slice(lastIdx), `${keyPrefix}b${i}p-`));
  return out;
}

function splitItalic(text, keyPrefix) {
  // Match _italic_ or *italic* (single asterisks not surrounded by another asterisk).
  // Use _italic_ since * causes ambiguity in Greek text with bold markers; both supported.
  const re = /(?:\*([^*]+)\*|_([^_]+)_)/g;
  const out = [];
  let lastIdx = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(text.slice(lastIdx, m.index));
    out.push(<em key={`${keyPrefix}i${i}`} style={{ fontStyle: 'italic' }}>{m[1] || m[2]}</em>);
    lastIdx = m.index + m[0].length;
    i++;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  // Wrap raw strings with keys
  return out.map((node, j) => (typeof node === 'string'
    ? <Fragment key={`${keyPrefix}s${j}`}>{node}</Fragment>
    : node));
}

// Marker for an unordered-list item: a small stylish arrow in the accent color.
function ArrowMarker({ accent }) {
  return (
    <span aria-hidden="true" style={{ color: accent, fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>
      →
    </span>
  );
}

// Render a multi-paragraph body string.
// Block types (each separated by a blank line):
//   `## Heading` / `### Heading`  → headings
//   every line `- item`           → unordered list (stylish arrow markers)
//   every line `N. item`          → ordered list (accent-colored numbers)
//   anything else                 → paragraph
// `accent` colors the list markers (defaults to ink; proposals pass their theme).
export function Body({ text, onRefClick, style, accent = C.ink }) {
  if (!text) return null;
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} style={{ ...EYEBROW, fontSize: 13, marginTop: 32, marginBottom: 10, color: C.mid }}>
              {parseInline(trimmed.slice(4).trim(), onRefClick, `h3-${i}-`)}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} style={{ ...SECTION_HEAD, marginTop: 32, marginBottom: 14 }}>
              {parseInline(trimmed.slice(3).trim(), onRefClick, `h${i}-`)}
            </h2>
          );
        }
        // Lists: a block whose FIRST line is a "- " bullet (unordered) or a
        // "N. " item (ordered). Wrapped continuation lines — those that don't
        // start with a marker — are folded back into the current item, so list
        // items can span multiple physical lines in the source YAML.
        const lines = trimmed.split(/\n/).map(l => l.trim()).filter(Boolean);
        const liStyle = { display: 'flex', gap: 10, fontSize: 15, color: C.mid, lineHeight: 1.6, marginBottom: 6 };
        if (lines.length && /^-\s+/.test(lines[0])) {
          const items = [];
          for (const l of lines) {
            if (/^-\s+/.test(l)) items.push(l.replace(/^-\s+/, ''));
            else if (items.length) items[items.length - 1] += ' ' + l;
          }
          return (
            <ul key={i} style={{ listStyle: 'none', padding: 0, margin: '10px 0 18px' }}>
              {items.map((text, j) => (
                <li key={j} style={liStyle}>
                  <ArrowMarker accent={accent} />
                  <span>{parseInline(text, onRefClick, `li${i}-${j}-`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (lines.length && /^\d+\.\s+/.test(lines[0])) {
          const items = [];
          for (const l of lines) {
            const m = l.match(/^(\d+)\.\s+(.*)$/);
            if (m) items.push({ num: m[1], text: m[2] });
            else if (items.length) items[items.length - 1].text += ' ' + l;
          }
          return (
            <ol key={i} style={{ listStyle: 'none', padding: 0, margin: '10px 0 18px' }}>
              {items.map((it, j) => (
                <li key={j} style={liStyle}>
                  <span aria-hidden="true" style={{ color: accent, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {it.num}.
                  </span>
                  <span>{parseInline(it.text, onRefClick, `li${i}-${j}-`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} style={{
            fontSize: 15,
            color: C.mid,
            lineHeight: 1.75,
            marginTop: 0,
            marginBottom: 16,
            ...style,
          }}>
            {parseInline(trimmed.replace(/\n/g, ' '), onRefClick, `p${i}-`)}
          </p>
        );
      })}
    </>
  );
}

// Render a single line/paragraph (no paragraph wrappers).
export function Inline({ text, onRefClick }) {
  if (!text) return null;
  return <>{parseInline(text.replace(/\n/g, ' '), onRefClick)}</>;
}
