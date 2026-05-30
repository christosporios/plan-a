import { useEffect } from 'react';
import { C, themeOf, EYEBROW, WORDMARK } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { Body } from '../lib/format-text';
import { CalloutBox } from './callout-box';
import { PolisStatement } from './polis-statement';
import { LimitationQA } from './limitation-qa';
import { FootnotesSection } from './footnotes-section';
import { ProposalSection } from './proposal-section';
import { SolidLine } from './scroll-line';
import { SiteFooter } from './site-footer';
import { SectionRail } from './section-rail';

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

  // Section anchors for the right-side rail (desktop only).
  const sectionList = [
    d.problem && { id: 'problem', label: 'Το πρόβλημα' },
    d.proposal && { id: 'proposal', label: 'Η πρόταση' },
    d.implementation && { id: 'implementation', label: 'Υλοποίηση' },
    d.limitations?.length && { id: 'limitations', label: 'Περιορισμοί' },
    d.benefits?.length && { id: 'benefits', label: 'Οφέλη' },
    d.polis?.length && { id: 'polis', label: 'Από το Pol.is' },
    d.references?.length && { id: 'references', label: 'Παραπομπές' },
  ].filter(Boolean);

  return (
    <div style={{
      fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh',
      fontSize: 15, lineHeight: 1.7, WebkitFontSmoothing: 'antialiased',
      animation: 'fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <SolidLine color={theme.accent} showProgress />
      {!mobile && <SectionRail sections={sectionList} accent={theme.accent} />}
      {/* Header */}
      <header style={{
        padding: mobile ? '40px 0 24px' : '64px 0 36px',
        borderBottom: `1px solid ${C.rule}`,
        background: C.bg,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: `0 ${px}px` }}>
          {/* Top nav: ← prev title | Plan A | next title → */}
          <nav style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'baseline',
            gap: mobile ? 10 : 20,
            marginBottom: mobile ? 24 : 28,
          }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              {prev && (
                <a
                  href={`/${prev.data.number}-${prev.data.slug || prev.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/${prev.data.number}-${prev.data.slug || prev.slug}`); }}
                  data-hover-underline
                  title={prev.data.title}
                  style={{ ...topNavLink, justifyContent: 'flex-start' }}
                >
                  <span style={{ flexShrink: 0 }}>←</span>
                  <span style={navTitleEllipsis}>{prev.data.title}</span>
                </a>
              )}
            </div>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              data-hover-underline
              data-hover-darken
              style={backLinkStyle}
            >
              Plan A
            </a>
            <div style={{ minWidth: 0, overflow: 'hidden', textAlign: 'right' }}>
              {next && (
                <a
                  href={`/${next.data.number}-${next.data.slug || next.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/${next.data.number}-${next.data.slug || next.slug}`); }}
                  data-hover-underline
                  title={next.data.title}
                  style={{ ...topNavLink, justifyContent: 'flex-end' }}
                >
                  <span style={navTitleEllipsis}>{next.data.title}</span>
                  <span style={{ flexShrink: 0 }}>→</span>
                </a>
              )}
            </div>
          </nav>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 28, marginBottom: 8 }}>
            <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.12em', color: theme.accent, fontWeight: 700 }}>
              Πρόταση {String(d.number).padStart(2, '0')}
            </span>
            {theme.label && (
              <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.12em', color: theme.accent, fontWeight: 700 }}>
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
            textWrap: 'balance',
          }}>
            {d.title}
          </h1>
          {d.one_line && (
            <p style={{
              fontFamily: C.serif,
              fontSize: mobile ? 17 : 19,
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
        <div style={{ maxWidth: 720, margin: '0 auto', padding: `0 ${px}px` }}>

          {d.problem && (
            <ProposalSection id="problem" title="Το πρόβλημα" accent={theme.accent}>
              <Body text={d.problem.body} onRefClick={onRefClick} />
              {d.problem.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.proposal && (
            <ProposalSection id="proposal" title="Η πρόταση" accent={theme.accent}>
              <Body text={d.proposal.body} onRefClick={onRefClick} />
              {d.proposal.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.implementation?.body && (
            <ProposalSection id="implementation" title="Υλοποίηση" accent={theme.accent}>
              <Body text={d.implementation.body} onRefClick={onRefClick} />
            </ProposalSection>
          )}

          {d.limitations?.length > 0 && (
            <ProposalSection id="limitations" title="Περιορισμοί & τρόποι αντιμετώπισης" accent={theme.accent}>
              {d.limitations.map((l, i) => (
                <LimitationQA key={i} q={l.q} a={l.a} onRefClick={onRefClick} />
              ))}
            </ProposalSection>
          )}

          {d.benefits?.length > 0 && (
            <ProposalSection id="benefits" title="Επιπρόσθετα οφέλη" accent={theme.accent}>
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

          {d.polis?.length > 0 && (
            <ProposalSection id="polis" title="Από το Pol.is" accent={theme.accent}>
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

          <div id="references">
            <FootnotesSection references={d.references} />
          </div>
        </div>
      </main>

      {/* Prev / next nav */}
      <nav style={{ borderTop: `1px solid ${C.rule}`, padding: mobile ? '20px 0' : '24px 0' }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: `0 ${px}px`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          <div>
            {prev && (
              <a
                href={`/${prev.data.number}-${prev.data.slug || prev.slug}`}
                onClick={(e) => { e.preventDefault(); navigate(`/${prev.data.number}-${prev.data.slug || prev.slug}`); }}
                style={navLinkStyle}
              >
                <div style={{ ...EYEBROW, fontSize: 10, marginBottom: 4 }}>← Προηγούμενη</div>
                <div style={{ fontSize: 15, color: C.ink, fontFamily: C.serif }}>{prev.data.title}</div>
              </a>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {next && (
              <a
                href={`/${next.data.number}-${next.data.slug || next.slug}`}
                onClick={(e) => { e.preventDefault(); navigate(`/${next.data.number}-${next.data.slug || next.slug}`); }}
                style={navLinkStyle}
              >
                <div style={{ ...EYEBROW, fontSize: 10, marginBottom: 4 }}>Επόμενη →</div>
                <div style={{ fontSize: 15, color: C.ink, fontFamily: C.serif }}>{next.data.title}</div>
              </a>
            )}
          </div>
        </div>
      </nav>
      <SiteFooter navigate={navigate} />
    </div>
  );
};

const backLinkStyle = { ...WORDMARK, fontSize: 18, letterSpacing: '0.01em', textDecoration: 'none' };
const navLinkStyle = { display: 'inline-block', textDecoration: 'none' };

// Inline prev/next link at the top of a proposal — italic serif. Laid out as a
// flex row so the directional arrow can sit OUTSIDE the truncating title span,
// keeping the arrow visible even when the title is ellipsized (e.g. on mobile).
const topNavLink = {
  fontFamily: C.serif,
  fontStyle: 'italic',
  fontSize: 15,
  color: C.light,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'baseline',
  gap: 6,
  maxWidth: '100%',
  minWidth: 0,
};
// The title half of a prev/next link — shrinks and ellipsizes; the arrow doesn't.
const navTitleEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
};
