import { useEffect } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { proposals } from '../lib/proposals';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';

// /parapombes: per-proposal collection of all references across the publication.
//
// kind = 'references'
export const AggregatedPage = ({ kind, navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  const config = KINDS[kind];

  useEffect(() => {
    document.title = `${config.title} — Plan A`;
    return () => { document.title = 'Plan A — 20 προτάσεις για την Αθήνα'; };
  }, [config.title]);

  const sections = proposals
    .map((p) => ({ p, items: p.data[config.field] || [] }))
    .filter(({ items }) => items.length > 0);

  return (
    <div style={{
      fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh',
      animation: 'fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <SolidLine color={C.ink} />
      <div style={{ padding: mobile ? '40px 0 56px' : '64px 0 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.15em', fontWeight: 400, textDecoration: 'none' }}
          >
            ← Plan A
          </a>
          <h1 style={{
            fontFamily: C.serif,
            fontSize: mobile ? 32 : 44,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginTop: 28,
            marginBottom: 8,
            color: C.ink,
          }}>
            {config.title}
          </h1>
          <p style={{ fontSize: 14.5, color: C.light, marginTop: 0, marginBottom: 32 }}>
            {config.subtitle.replace('{n}', sections.length)}
          </p>

          {sections.length === 0 && (
            <p style={{ color: C.light }}>Σύντομα κοντά σας.</p>
          )}

          {sections.map(({ p, items }) => (
            <section key={p.slug} style={{ marginBottom: 36 }}>
              <a
                href={`/${p.data.number}-${p.data.slug || p.slug}`}
                onClick={(e) => { e.preventDefault(); navigate(`/${p.data.number}-${p.data.slug || p.slug}`); }}
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  color: 'inherit',
                  marginBottom: 12,
                }}
              >
                <span style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.12em', color: C.faint, marginRight: 10 }}>
                  Πρόταση {String(p.data.number).padStart(2, '0')}
                </span>
                <span style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 600, color: C.ink, fontStyle: 'italic' }}>
                  {p.data.title}
                </span>
              </a>
              {kind === 'references' && (
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {items.map((r) => (
                    <li
                      key={r.n}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '8px 0',
                        borderBottom: `1px solid ${C.rule}`,
                        fontSize: 12.5,
                        color: C.light,
                        lineHeight: 1.55,
                      }}
                    >
                      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.faint, minWidth: 22, paddingTop: 2 }}>
                        {r.n}.
                      </span>
                      <span>
                        {(() => {
                          let body;
                          if (r.text) {
                            body = r.text;
                          } else {
                            // Join only the parts that exist so missing fields
                            // don't leave stray punctuation (e.g. "Author, , 2021").
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
              )}
            </section>
          ))}
        </div>
      </div>
      <SiteFooter navigate={navigate} />
    </div>
  );
};

const KINDS = {
  references: {
    field: 'references',
    title: 'Παραπομπές',
    subtitle: 'Όλες οι παραπομπές των {n} προτάσεων που τις χρησιμοποιούν.',
  },
};
