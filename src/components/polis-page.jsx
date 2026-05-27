import { useEffect } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { proposals } from '../lib/proposals';
import { PolisStatement } from './polis-statement';
import { SiteFooter } from './site-footer';

// /diavoulefsi: every Pol.is statement that surfaced in the deliberation,
// grouped by statement and mapped to the proposals each one led to.
export const PolisPage = ({ navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;

  useEffect(() => {
    document.title = 'Από τη διαβούλευση — Plan A';
    return () => { document.title = 'Plan A — 20 προτάσεις για την Αθήνα'; };
  }, []);

  // Group polis entries across all proposals by statement_id (or text).
  // Each entry keeps its first occurrence's data and a list of source proposals.
  const map = new Map();
  for (const p of proposals) {
    for (const entry of p.data.polis || []) {
      const key = entry.statement_id ?? entry.statement;
      if (!map.has(key)) map.set(key, { entry, sources: [] });
      map.get(key).sources.push(p);
    }
  }
  const grouped = [...map.values()].sort((a, b) => {
    const aId = a.entry.statement_id ?? Infinity;
    const bId = b.entry.statement_id ?? Infinity;
    return aId - bId;
  });

  return (
    <div style={{ fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh' }}>
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
            Από τη διαβούλευση
          </h1>
          <p style={{ fontSize: 14.5, color: C.light, marginTop: 0, marginBottom: 32, lineHeight: 1.7 }}>
            {grouped.length} statements από τη διαβούλευση Pol.is που τροφοδότησαν τις
            προτάσεις του Plan A. Κάθε statement συνοδεύεται από τις προτάσεις που
            το χρησιμοποιούν ως υποστηρικτικό στοιχείο.
          </p>

          {grouped.length === 0 && (
            <p style={{ color: C.light }}>Σύντομα κοντά σας.</p>
          )}

          {grouped.map(({ entry, sources }, i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <PolisStatement
                statement={entry.statement}
                overall={entry.overall}
                groups={entry.groups}
                statementId={entry.statement_id}
                mobile={mobile}
              />
              <div style={{ marginTop: 4, marginBottom: 8 }}>
                <span style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.15em', marginRight: 12 }}>
                  Τροφοδοτεί
                </span>
                <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px 10px', verticalAlign: 'middle' }}>
                  {sources.map((p, j) => (
                    <a
                      key={p.slug}
                      href={`/p/${p.data.number}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/p/${p.data.number}`); }}
                      style={{
                        fontFamily: C.serif,
                        fontStyle: 'italic',
                        fontSize: 14,
                        color: C.mid,
                        textDecoration: 'none',
                      }}
                    >
                      {j > 0 && <span style={{ color: C.faint, marginRight: 10 }}>·</span>}
                      <span style={{ fontFamily: C.mono, fontStyle: 'normal', fontSize: 11, color: C.faint, marginRight: 4 }}>
                        {String(p.data.number).padStart(2, '0')}
                      </span>
                      {p.data.title}
                    </a>
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter navigate={navigate} />
    </div>
  );
};
