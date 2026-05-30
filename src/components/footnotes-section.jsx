import { C, EYEBROW } from '../lib/theme';

// Numbered footnotes at the bottom of a proposal page.
// Anchors are #ref-N (matches FootnoteRef in format-text.jsx).
export const FootnotesSection = ({ references }) => {
  if (!references?.length) return null;
  return (
    <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.rule}` }}>
      <div style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.25em', marginBottom: 12 }}>
        Παραπομπές
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {references.map((r) => (
          <li
            key={r.n}
            id={`ref-${r.n}`}
            style={{
              display: 'flex',
              gap: 10,
              padding: '8px 0',
              borderBottom: `1px solid ${C.rule}`,
              fontSize: 13,
              color: C.light,
              lineHeight: 1.55,
            }}
          >
            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.faint, minWidth: 22, paddingTop: 2 }}>
              {r.n}.
            </span>
            <span>
              {(() => {
                let body;
                if (r.text) {
                  body = r.text;
                } else {
                  // Join only the parts that exist so missing fields don't leave
                  // stray punctuation (e.g. "Author, , 2021" when there's no title).
                  const cite = [
                    r.author,
                    r.title && <em key="t">{r.title}</em>,
                    r.year,
                  ].filter(Boolean);
                  body = <>
                    {cite.map((part, i) => <span key={i}>{i > 0 && ', '}{part}</span>)}
                    {r.publication && <>. {r.publication}</>}
                  </>;
                }
                return r.url
                  ? <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-hover-underline
                      data-external-link
                      style={{ color: 'inherit' }}
                    >{body}</a>
                  : body;
              })()}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};
