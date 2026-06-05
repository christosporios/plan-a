import { useEffect } from 'react';
import { C, themeOf, EYEBROW, WORDMARK } from '../lib/theme';
import { proposalImage } from '../lib/proposal-images';
import { useIsMobile } from '../hooks/use-is-mobile';
import { Body } from '../lib/format-text';
import { CalloutBox } from './callout-box';
import { PolisStatement } from './polis-statement';
import { LimitationQA } from './limitation-qa';
import { ChartGroup } from './chart-group';
import { FootnotesSection } from './footnotes-section';
import { ProposalSection } from './proposal-section';
import { nextStepTitles } from '../lib/next-steps.mjs';
import { SolidLine } from './scroll-line';
import { TopNav } from './top-nav';
import { SiteFooter } from './site-footer';
import { SectionRail } from './section-rail';
import { SignupCard } from './signup-card';
import { RELEASED } from '../lib/released';

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
  const img = proposalImage(d.number);
  const px = mobile ? 20 : 40;

  // Section anchors for the right-side rail (desktop only). Order matches the
  // body flow below: lead proposal → goal contribution → Q&A → benefits →
  // next steps → Pol.is → references. `problem`/`implementation` are legacy
  // fields kept for proposals not yet migrated to the new structure.
  const sectionList = [
    d.problem && { id: 'problem', label: 'Το πρόβλημα' },
    d.proposal && { id: 'proposal', label: 'Η πρόταση' },
    d.contribution && { id: 'contribution', label: 'Συμβολή στον στόχο' },
    d.implementation && { id: 'implementation', label: 'Υλοποίηση' },
    d.limitations?.length && { id: 'limitations', label: 'Ζητήματα υλοποίησης' },
    d.benefits?.length && { id: 'benefits', label: 'Οφέλη' },
    d.next_steps?.length && { id: 'next-steps', label: 'Επόμενα βήματα' },
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
      <TopNav navigate={navigate} variant="dark" />
      {!mobile && RELEASED && <SectionRail sections={sectionList} accent={theme.accent} />}
      {/* Header — darkened image (or themed placeholder) behind white text.
          Top padding clears the fixed TopNav above the contextual prev/next row. */}
      <header style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: mobile ? 340 : 460,
        padding: mobile ? '64px 0 40px' : '84px 0 56px',
        background: C.ink,
      }}>
        {img ? (
          <img src={img} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${theme.accent} 0%, #1a1a1a 130%)`,
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.7) 100%)',
        }} />
        <div style={{ position: 'relative', width: '100%', maxWidth: 720, margin: '0 auto', padding: `0 ${px}px`, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Contextual prev/next within the goal — home/menu live in the TopNav. */}
          <nav style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'baseline',
            gap: mobile ? 10 : 20,
            marginBottom: mobile ? 24 : 28,
          }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              {RELEASED && prev && (
                <a
                  href={`/${prev.data.number}-${prev.data.slug || prev.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/${prev.data.number}-${prev.data.slug || prev.slug}`); }}
                  data-hover-underline
                  title={prev.data.title}
                  style={{ ...topNavLink, justifyContent: 'flex-start', color: 'rgba(255,255,255,0.82)' }}
                >
                  <span style={{ flexShrink: 0 }}>←</span>
                  <span style={navTitleEllipsis}>{prev.data.title}</span>
                </a>
              )}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden', textAlign: 'right' }}>
              {RELEASED && next && (
                <a
                  href={`/${next.data.number}-${next.data.slug || next.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/${next.data.number}-${next.data.slug || next.slug}`); }}
                  data-hover-underline
                  title={next.data.title}
                  style={{ ...topNavLink, justifyContent: 'flex-end', color: 'rgba(255,255,255,0.82)' }}
                >
                  <span style={navTitleEllipsis}>{next.data.title}</span>
                  <span style={{ flexShrink: 0 }}>→</span>
                </a>
              )}
            </div>
          </nav>
          <div style={{ marginTop: mobile ? 28 : 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
              <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>
                Πρόταση {String(d.number).padStart(2, '0')}
              </span>
              {theme.label && (
                <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>
                  · ΣΤΟΧΟΣ: {theme.label}
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
              color: '#fff',
              textWrap: 'balance',
              textShadow: '0 1px 16px rgba(0,0,0,0.45)',
            }}>
              {d.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Body */}
      <main style={{ padding: mobile ? '8px 0 40px' : '8px 0 56px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: `0 ${px}px` }}>

          {d.one_line && (
            <p style={{
              fontFamily: C.serif,
              fontSize: mobile ? 18 : 21,
              fontWeight: 400,
              color: C.mid,
              marginTop: mobile ? 24 : 32,
              marginBottom: mobile ? 8 : 16,
              lineHeight: 1.5,
            }}>
              {d.one_line.trim().replace(/\n/g, ' ')}
            </p>
          )}

          {/* Pre-release: the full proposal text stays hidden behind the launch.
              Show only the one-line teaser above, then the sign-up card. */}
          {!RELEASED && (
            <div style={{ marginTop: mobile ? 24 : 32 }}>
              <SignupCard accent={theme.accent} />
            </div>
          )}

          {/* Legacy "Το πρόβλημα" — only proposals not yet migrated to the new
              goal-contribution structure carry a standalone `problem` field. */}
          {RELEASED && d.problem && (
            <ProposalSection id="problem" title="Το πρόβλημα" accent={theme.accent}>
              <Body text={d.problem.body} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              {d.problem.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              ))}
            </ProposalSection>
          )}

          {RELEASED && d.proposal && (
            <ProposalSection id="proposal" title="Η πρόταση" accent={theme.accent}>
              <Body text={d.proposal.body} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              {d.proposal.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              ))}
            </ProposalSection>
          )}

          {RELEASED && d.contribution?.body && (
            <ProposalSection
              id="contribution"
              title={`Πώς συμβάλλει στον στόχο «${theme.label}»`}
              accent={theme.accent}
            >
              <Body text={d.contribution.body} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              {d.contribution.callouts?.map((c, i) => (
                <CalloutBox key={i} text={c} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              ))}
              {d.contribution.charts?.length > 0 && (
                <ChartGroup charts={d.contribution.charts} accent={theme.accent} mobile={mobile} />
              )}
              {d.contribution.body_after && (
                <Body text={d.contribution.body_after} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              )}
            </ProposalSection>
          )}

          {RELEASED && d.implementation?.body && (
            <ProposalSection id="implementation" title="Υλοποίηση" accent={theme.accent}>
              <Body text={d.implementation.body} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
            </ProposalSection>
          )}

          {RELEASED && d.limitations?.length > 0 && (
            <ProposalSection id="limitations" title="Ζητήματα υλοποίησης" accent={theme.accent}>
              {d.limitations.map((l, i) => (
                <LimitationQA key={i} q={l.q} a={l.a} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
              ))}
            </ProposalSection>
          )}

          {RELEASED && d.benefits?.length > 0 && (
            <ProposalSection id="benefits" title="Επιπρόσθετα οφέλη" accent={theme.accent}>
              {d.benefits.map((b, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: C.ink, fontSize: 15, marginBottom: 6 }}>
                    {b.title}
                  </div>
                  <Body text={b.body} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} style={{ marginBottom: 0, fontSize: 14.5 }} />
                  {b.callouts?.map((c, j) => (
                    <CalloutBox key={j} text={c} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} />
                  ))}
                </div>
              ))}
            </ProposalSection>
          )}

          {RELEASED && d.next_steps?.length > 0 && (
            <ProposalSection id="next-steps" title="Δύο ενδεικτικά επόμενα βήματα" accent={theme.accent}>
              {(() => {
                const titles = nextStepTitles(d.next_steps);
                return d.next_steps.map((s, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: C.ink, fontSize: 15, marginBottom: 6 }}>
                    {titles[i]}
                  </div>
                  <Body text={s.body} onRefClick={onRefClick} accent={theme.accent} navigate={navigate} style={{ marginBottom: 0, fontSize: 14.5 }} />
                </div>
                ));
              })()}
              <a
                href="/epomena-vimata"
                onClick={(e) => { e.preventDefault(); navigate('/epomena-vimata'); }}
                style={{ display: 'inline-block', marginTop: 6, color: theme.accent, fontWeight: 600, fontSize: 14.5, textDecoration: 'none', borderBottom: `1px solid ${theme.accent}` }}
              >
                Δείτε πώς μπορείτε να συμβάλετε →
              </a>
            </ProposalSection>
          )}

          {RELEASED && d.polis?.length > 0 && (
            <ProposalSection id="polis" title="Από το Pol.is" accent={theme.accent}>
              {d.polis.map((p, i) => (
                <PolisStatement
                  key={i}
                  statement={p.statement}
                  overall={p.overall}
                  groups={p.groups}
                  statementId={p.statement_id}
                  mobile={mobile}
                  navigate={navigate}
                  accent={theme.accent}
                />
              ))}
            </ProposalSection>
          )}

          {RELEASED && (
            <div id="references">
              <FootnotesSection references={d.references} />
            </div>
          )}
        </div>
      </main>

      {/* Prev / next nav — released only (pre-release proposals aren't navigable) */}
      {RELEASED && (
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
      )}
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
