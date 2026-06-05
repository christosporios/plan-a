import { useEffect } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { proposals } from '../lib/proposals';
import { POLIS_GROUPS } from '../lib/polis-groups';
import { PolisStatement } from './polis-statement';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';
import { TopNav } from './top-nav';

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
    <div style={{
      fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh',
      animation: 'fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <SolidLine color={C.ink} />
      <TopNav navigate={navigate} variant="light" />
      <div style={{ padding: mobile ? '56px 0 56px' : '80px 0 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>
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
          <p style={{ fontSize: 14.5, color: C.light, marginTop: 0, marginBottom: 20, lineHeight: 1.7 }}>
            {grouped.length} statements από τη διαβούλευση Pol.is που τροφοδότησαν τις
            προτάσεις του Plan A. Κάθε statement συνοδεύεται από τις προτάσεις που
            το χρησιμοποιούν ως υποστηρικτικό στοιχείο.
          </p>

          {/* Prominent link to the full, interactive Pol.is report. */}
          <a
            href="https://pol.is/report/r7brycbsvbxe94w2mufnf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              ...EYEBROW,
              fontSize: 12,
              letterSpacing: '0.12em',
              fontWeight: 500,
              color: C.ink,
              textDecoration: 'none',
              border: `1px solid ${C.ink}`,
              borderRadius: 4,
              padding: '11px 18px',
              marginBottom: 32,
              transition: 'background 200ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.ink; }}
          >
            Δείτε την πλήρη αναφορά στο Pol.is ↗
          </a>

          {/* Opinion groups explainer */}
          <div style={{ borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}`, padding: '20px 0', marginBottom: 36 }}>
            <p style={{ fontSize: 14.5, color: C.mid, marginTop: 0, marginBottom: 18, lineHeight: 1.65 }}>
              Ο αλγόριθμος του Pol.is ομαδοποίησε τους συμμετέχοντες σε <strong>τρεις ομάδες απόψεων</strong>,
              με βάση τα μοτίβα ψήφου τους. Αυτό που μετράει για το Plan A είναι το <strong>κοινό έδαφος</strong>:
              τα statements όπου συμφωνούν και οι τρεις.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
              gap: mobile ? 16 : 24,
            }}>
              {POLIS_GROUPS.map((g) => (
                <div key={g.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                    <g.icon size={20} color={g.color} strokeWidth={1.75} aria-hidden />
                    <span style={{ fontWeight: 700, fontSize: 14.5, color: C.ink }}>
                      <span style={{ color: g.color }}>{g.label}</span> · {g.title}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.light, lineHeight: 1.5 }}>
                    <span style={{ ...EYEBROW, fontSize: 10, color: C.faint, marginRight: 6 }}>~{g.size.toLocaleString('el')}</span>
                    {g.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                      href={`/${p.data.number}-${p.data.slug || p.slug}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/${p.data.number}-${p.data.slug || p.slug}`); }}
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
