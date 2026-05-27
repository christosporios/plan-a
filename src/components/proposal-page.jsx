import { useEffect } from 'react';
import { C, themeOf, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { Body } from '../lib/format-text';
import { CalloutBox } from './callout-box';
import { PolisStatement } from './polis-statement';
import { PhaseList } from './phase-list';
import { LimitationQA } from './limitation-qa';
import { GoodPractice } from './good-practice';
import { BudgetTable } from './budget-line';
import { FootnotesSection } from './footnotes-section';
import { ProposalSection } from './proposal-section';
import { SolidLine } from './scroll-line';
import { SiteFooter } from './site-footer';

export const ProposalPage = ({ entry, prev, next, navigate }) => {
  const mobile = useIsMobile();
  const d = entry?.data;

  useEffect(() => {
    if (d) document.title = `Πρόταση ${d.number}: ${d.title} — Plan A`;
    return () => { document.title = 'Plan A — 20 προτάσεις για την Αθήνα'; };
  }, [d]);

  const onRefClick = (e, n) => {
    e.preventDefault();
    const el = document.getElementById(`ref-${n}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.background = 'rgba(26,26,26,0.08)';
      setTimeout(() => { el.style.background = ''; }, 1500);
    }
    window.history.replaceState(null, '', `#ref-${n}`);
  };

  if (!d) {
    return (
      <div style={{ fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh', padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={backLinkStyle}>← Plan A</a>
          <h1 style={{ fontFamily: C.serif, fontSize: 32, marginTop: 24 }}>Η πρόταση δεν βρέθηκε</h1>
        </div>
      </div>
    );
  }

  const theme = themeOf(d.theme);
  const px = mobile ? 20 : 40;

  return (
    <div style={{ fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh', fontSize: 15, lineHeight: 1.7, WebkitFontSmoothing: 'antialiased' }}>
      <SolidLine color={theme.accent} />
      {/* Header */}
      <header style={{
        padding: mobile ? '40px 0 24px' : '64px 0 36px',
        borderBottom: `1px solid ${C.rule}`,
        background: C.bg,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            style={backLinkStyle}
          >
            ← Plan A
          </a>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 28, marginBottom: 8 }}>
            <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.12em', color: theme.accent }}>
              Πρόταση {String(d.number).padStart(2, '0')}
            </span>
            {theme.label && (
              <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.12em', color: theme.accent }}>
                · {theme.label}
              </span>
            )}
          </div>
          <h1 style={{
            fontFamily: C.serif,
            fontSize: mobile ? 32 : 44,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: 0,
            color: C.ink,
          }}>
            {d.title}
          </h1>
          {d.one_line && (
            <p style={{
              fontFamily: C.serif,
              fontSize: mobile ? 17 : 19,
              fontStyle: 'italic',
              fontWeight: 400,
              color: C.mid,
              marginTop: 16,
              marginBottom: 0,
              lineHeight: 1.5,
            }}>
              {d.one_line.trim().replace(/\n/g, ' ')}
            </p>
          )}
        </div>
      </header>

      {/* Body */}
      <main style={{ padding: mobile ? '8px 0 40px' : '8px 0 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>

          {d.problem && (
            <ProposalSection title="Το πρόβλημα">
              <Body text={d.problem.body} onRefClick={onRefClick} />
              {d.problem.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.proposal && (
            <ProposalSection title="Η πρόταση">
              <Body text={d.proposal.body} onRefClick={onRefClick} />
              {d.proposal.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.implementation && (
            <ProposalSection title="Υλοποίηση">
              {d.implementation.body && <Body text={d.implementation.body} onRefClick={onRefClick} />}
              {d.implementation.phases?.length > 0 && (
                <PhaseList phases={d.implementation.phases} onRefClick={onRefClick} />
              )}
              {d.implementation.budget && (
                <BudgetTable
                  items={d.implementation.budget.items}
                  total={d.implementation.budget.total}
                  period={d.implementation.budget.period}
                />
              )}
            </ProposalSection>
          )}

          {d.limitations?.length > 0 && (
            <ProposalSection title="Περιορισμοί & τρόποι αντιμετώπισης">
              {d.limitations.map((l, i) => (
                <LimitationQA key={i} q={l.q} a={l.a} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.benefits?.length > 0 && (
            <ProposalSection title="Επιπρόσθετα οφέλη">
              {d.benefits.map((b, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: C.ink, fontSize: 15, marginBottom: 6 }}>
                    {b.title}
                  </div>
                  <Body text={b.body} onRefClick={onRefClick} style={{ marginBottom: 0, fontSize: 14.5 }} />
                </div>
              ))}
            </ProposalSection>
          )}

          {d.good_practices?.length > 0 && (
            <ProposalSection title="Καλές πρακτικές">
              {d.good_practices.map((gp, i) => (
                <GoodPractice key={i} city={gp.city} period={gp.period} body={gp.body} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.polis?.length > 0 && (
            <ProposalSection title="Από το Pol.is">
              {d.polis.map((p, i) => (
                <PolisStatement
                  key={i}
                  statement={p.statement}
                  overall={p.overall}
                  groups={p.groups}
                  statementId={p.statement_id}
                  mobile={mobile}
                />
              ))}
            </ProposalSection>
          )}

          <FootnotesSection references={d.references} />
        </div>
      </main>

      {/* Prev / next nav */}
      <nav style={{ borderTop: `1px solid ${C.rule}`, padding: mobile ? '20px 0' : '24px 0' }}>
        <div style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: `0 ${px}px`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          <div>
            {prev && (
              <a
                href={`/p/${prev.data.number}`}
                onClick={(e) => { e.preventDefault(); navigate(`/p/${prev.data.number}`); }}
                style={navLinkStyle}
              >
                <div style={{ ...EYEBROW, fontSize: 9, marginBottom: 4 }}>← Προηγούμενη</div>
                <div style={{ fontSize: 14, color: C.ink, fontFamily: C.serif }}>{prev.data.title}</div>
              </a>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {next && (
              <a
                href={`/p/${next.data.number}`}
                onClick={(e) => { e.preventDefault(); navigate(`/p/${next.data.number}`); }}
                style={navLinkStyle}
              >
                <div style={{ ...EYEBROW, fontSize: 9, marginBottom: 4 }}>Επόμενη →</div>
                <div style={{ fontSize: 14, color: C.ink, fontFamily: C.serif }}>{next.data.title}</div>
              </a>
            )}
          </div>
        </div>
      </nav>
      <SiteFooter navigate={navigate} />
    </div>
  );
};

const backLinkStyle = { ...EYEBROW, fontSize: 11, letterSpacing: '0.15em', fontWeight: 400, textDecoration: 'none' };
const navLinkStyle = { display: 'inline-block', textDecoration: 'none' };
