import { useEffect } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { proposals } from '../lib/proposals';
import { GoodPractice } from './good-practice';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';

// /kales-praktikes and /parapombes: per-proposal collections of all good
// practices / references across the whole publication.
//
// kind = 'good_practices' | 'references'
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
              {kind === 'good_practices' && items.map((gp, i) => (
                <GoodPractice key={i} city={gp.city} period={gp.period} body={gp.body} />
              ))}
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
  good_practices: {
    field: 'good_practices',
    title: 'Καλές πρακτικές',
    subtitle: 'Παραδείγματα από {n} προτάσεις. Κάθε καρτέλα συνδέεται με την αρχική πρόταση.',
  },
  references: {
    field: 'references',
    title: 'Παραπομπές',
    subtitle: 'Όλες οι παραπομπές των {n} προτάσεων που τις χρησιμοποιούν.',
  },
};
