// Lightweight text renderer for proposal body fields.
// Supports: **bold**, *italic*, [label](url) links, ^N or ^[N] footnote refs,
// blank-line paragraphs.
// Footnote refs become clickable superscripts that scroll to #ref-N.
// Internal proposal links — [label](/N-slug) — render as themed cross-references
// (accent color, subtle underline) and navigate within the SPA when a `navigate`
// function is threaded through (see Body/Inline `navigate` prop).

import { Fragment } from 'react';
import { C, EYEBROW, SECTION_HEAD } from './theme';

// A link to another proposal: /N or /N-slug. Matched in splitLinks below.
const PROPOSAL_HREF = /^\/\d+(?:-|$)/;

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

// Cross-reference to another proposal. Styled with the current theme accent —
// distinct enough to read as "this jumps elsewhere", restrained enough not to
// shout. Navigates in-app when `navigate` is provided, else falls back to a
// normal link.
function ProposalRef({ href, accent, navigate, children }) {
  return (
    <a
      href={href}
      onClick={navigate ? (e) => { e.preventDefault(); navigate(href); } : undefined}
      style={{
        color: accent,
        fontWeight: 500,
        textDecoration: 'none',
        borderBottom: `1px solid ${accent}59`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </a>
  );
}

// Inline parser: handles **bold**, *italic*, ^N, ^[N]. `ctx` carries
// { onRefClick, navigate, accent } down to the link renderer.
function parseInline(text, ctx, keyPrefix = '') {
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
    if (p.kind === 'fn') return <FootnoteRef key={`${keyPrefix}fn-${i}`} n={p.n} onClick={ctx?.onRefClick} />;
    return splitLinks(p.value, ctx, `${keyPrefix}t${i}-`);
  });
}

// Split text on [label](url) markdown links. Non-link runs fall through to
// bold/italic. External links open in a new tab; internal proposal links
// (/N-slug) render as themed cross-references; the label keeps inline styling.
function splitLinks(text, ctx, keyPrefix) {
  // URL group allows one level of nested parentheses so DOIs / publisher URLs
  // like ".../PIIS0140-6736(16)30383-X/abstract" aren't truncated at the "(".
  const re = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;
  const out = [];
  let lastIdx = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(...splitBoldItalic(text.slice(lastIdx, m.index), `${keyPrefix}l${i}p-`));
    const href = m[2];
    const label = splitBoldItalic(m[1], `${keyPrefix}l${i}i-`);
    if (PROPOSAL_HREF.test(href)) {
      out.push(
        <ProposalRef key={`${keyPrefix}l${i}`} href={href} accent={ctx?.accent || C.ink} navigate={ctx?.navigate}>
          {label}
        </ProposalRef>,
      );
    } else {
      const external = /^https?:\/\//.test(href);
      out.push(
        <a
          key={`${keyPrefix}l${i}`}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          {label}
        </a>,
      );
    }
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

// Inline callout fence: ::: callout … ::: anywhere in a body string becomes a
// bordered box exactly where it sits in the prose flow. Multi-paragraph content
// (incl. a trailing "Πηγή: …" line) is supported. Mirrored in the PDF/DOCX
// generators so all three render identically. Build a fresh regex per use — a
// shared /g regex's lastIndex is fragile under reuse.
// Newline-tolerant: works whether the YAML used a literal "|" scalar (fence on
// its own lines) or a folded ">" scalar (newlines collapsed to spaces).
const calloutFence = () => /:::[ \t]*callout\s*([\s\S]*?)\s*:::/g;

// Bordered call-out box. Inner text is rendered recursively via BodyBlocks
// (kept here rather than importing CalloutBox to avoid a circular import).
function CalloutBlock({ text, ctx }) {
  return (
    <div style={{
      border: `1px solid ${C.rule}`,
      background: C.card,
      padding: '14px 18px',
      margin: '16px 0',
      borderRadius: 2,
    }}>
      <BodyBlocks text={text} ctx={ctx} style={{ fontSize: 14, marginBottom: 12 }} />
    </div>
  );
}

// Marker for an unordered-list item: a small bullet in the accent color.
function ArrowMarker({ accent }) {
  return (
    <span aria-hidden="true" style={{ color: accent, fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>
      •
    </span>
  );
}

// Render a multi-paragraph body string.
// Block types (each separated by a blank line):
//   `## Heading` / `### Heading`  → headings
//   every line `- item`           → unordered list (stylish arrow markers)
//   every line `N. item`          → ordered list (accent-colored numbers)
//   anything else                 → paragraph
// `accent` colors the list markers + proposal cross-references (defaults to ink;
// proposals pass their theme). `navigate` enables in-app cross-reference links.
export function Body({ text, onRefClick, style, accent = C.ink, navigate }) {
  if (!text) return null;
  const ctx = { onRefClick, navigate, accent };

  // Split out inline callout fences first; render the prose between/around them
  // as normal blocks and each fenced region as a bordered box, preserving order.
  if (text.includes(':::')) {
    const out = [];
    let last = 0, m, i = 0;
    const fence = calloutFence();
    while ((m = fence.exec(text)) !== null) {
      const chunk = text.slice(last, m.index);
      if (chunk.trim()) out.push(<BodyBlocks key={`bb${i}`} text={chunk} ctx={ctx} style={style} />);
      out.push(<CalloutBlock key={`co${i}`} text={m[1].trim()} ctx={ctx} />);
      last = m.index + m[0].length;
      i++;
    }
    const tail = text.slice(last);
    if (tail.trim()) out.push(<BodyBlocks key={`bb${i}`} text={tail} ctx={ctx} style={style} />);
    return <>{out}</>;
  }

  return <BodyBlocks text={text} ctx={ctx} style={style} />;
}

// Renders fence-free body text: paragraphs, headings, and lists.
function BodyBlocks({ text, ctx, style }) {
  if (!text) return null;
  const accent = ctx.accent || C.ink;
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} style={{ ...EYEBROW, fontSize: 13, marginTop: 32, marginBottom: 10, color: C.mid }}>
              {parseInline(trimmed.slice(4).trim(), ctx, `h3-${i}-`)}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} style={{ ...SECTION_HEAD, marginTop: 32, marginBottom: 14 }}>
              {parseInline(trimmed.slice(3).trim(), ctx, `h${i}-`)}
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
                  <span>{parseInline(text, ctx, `li${i}-${j}-`)}</span>
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
                  <span>{parseInline(it.text, ctx, `li${i}-${j}-`)}</span>
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
            {parseInline(trimmed.replace(/\n/g, ' '), ctx, `p${i}-`)}
          </p>
        );
      })}
    </>
  );
}

// Render a single line/paragraph (no paragraph wrappers).
export function Inline({ text, onRefClick, accent, navigate }) {
  if (!text) return null;
  return <>{parseInline(text.replace(/\n/g, ' '), { onRefClick, navigate, accent })}</>;
}
