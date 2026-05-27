import { C, EYEBROW } from '../lib/theme';

// Numbered footnotes at the bottom of a proposal page.
// Anchors are #ref-N (matches FootnoteRef in format-text.jsx).
export const FootnotesSection = ({ references }) => {
  if (!references?.length) return null;
  return (
    <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.rule}` }}>
      <div style={{ ...EYEBROW, fontSize: 9, letterSpacing: '0.25em', marginBottom: 12 }}>
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
              fontSize: 12,
              color: C.light,
              lineHeight: 1.55,
            }}
          >
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.faint, minWidth: 22, paddingTop: 2 }}>
              {r.n}.
            </span>
            <span>
              {r.text
                ? <>{r.text} {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: C.light }}>{r.url}</a>}</>
                : <>
                    {r.author && <>{r.author}, </>}
                    <em>{r.title}</em>
                    {r.year && <>, {r.year}</>}
                    {r.publication && <>. {r.publication}</>}
                    {r.url && <>. <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: C.light }}>{r.url}</a></>}
                  </>
              }
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};
