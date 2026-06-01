import { useRef, useState, useLayoutEffect } from 'react';
import { C, THEMES, THEME_ORDER, EYEBROW } from '../lib/theme';
import { PlanAMark } from './plan-a-mark';
import { SITE } from '../lib/site';
import { foreword } from '../lib/foreword';
import { useIsMobile } from '../hooks/use-is-mobile';
import { track } from '../lib/analytics';
import { ScrollLine } from './scroll-line';
import { SiteFooter } from './site-footer';
import { SignupCard } from './signup-card';
import { RELEASED } from '../lib/released';

// Choreographed cover entrance — each block fades + slides up in sequence.
// Keyframe `fade-up` is defined globally in main.jsx.
const enter = (delayMs) => ({
  animation: `fade-up 560ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
});

// Description type metrics — the leader is lifted by exactly one line to sit on
// the description's last line, and indented past the last word.
const BLURB_FONT = 13.5;
const BLURB_LINE_H = BLURB_FONT * 1.5;
// Gap between the description's last word and the start of the inline leader.
const LEADER_GAP = 8;

// A proposal's short description. On mobile it's followed by a "read more" cue:
// a thin dotted leader broken in the middle by an italic "διαβάστε" and ending
// in an arrowhead, signalling the card is tappable (touch devices get no hover
// affordance — see the card's onMouseEnter, which is desktop-only). The cue
// continues on the description's last line when at least 40% of that line is
// free; otherwise it drops to its own line. Deciding that needs measuring where
// the last line ends, so it's a JS-measured layout (re-measured on resize and
// after web fonts load).
//
// The cue is always a full-width flex row (its dotted segments flex-fill exactly
// to the right edge — no brittle pixel widths). For the inline case we lift it
// onto the last line with a negative top-margin and indent its content past the
// measured last-line width, so it reads as continuing that line.
function ProposalBlurb({ text, mobile, cue = true }) {
  const pRef = useRef(null);
  const [layout, setLayout] = useState({ inline: false, padLeft: 0 });

  useLayoutEffect(() => {
    if (!mobile || !cue) return;
    const el = pRef.current;
    const textNode = el?.firstChild;
    if (!textNode) return;
    const measure = () => {
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, textNode.textContent.length);
      const rects = range.getClientRects();
      if (!rects.length) return;
      const containerW = el.clientWidth;
      const lastW = rects[rects.length - 1].width;
      if (containerW - lastW >= 0.4 * containerW) {
        setLayout({ inline: true, padLeft: Math.ceil(lastW + LEADER_GAP) });
      } else {
        setLayout({ inline: false, padLeft: 0 });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    let cancelled = false;
    document.fonts?.ready.then(() => { if (!cancelled) measure(); });
    return () => { cancelled = true; window.removeEventListener('resize', measure); };
  }, [text, mobile, cue]);

  const dottedSeg = { flexGrow: 1, flexBasis: 0, minWidth: 6, borderTop: `1px dotted ${C.faint}` };
  // paddingRight keeps the rotated arrowhead from poking past the right edge.
  const wrapStyle = layout.inline
    ? { display: 'flex', alignItems: 'center', height: BLURB_LINE_H, marginTop: -BLURB_LINE_H, paddingLeft: layout.padLeft, paddingRight: 3, color: C.faint }
    : { display: 'flex', alignItems: 'center', marginTop: 7, paddingRight: 3, color: C.faint };

  return (
    <p ref={pRef} style={{ fontSize: BLURB_FONT, color: C.light, marginTop: 4, marginBottom: 0, lineHeight: 1.5 }}>
      {text}
      {mobile && cue && (
        <span aria-hidden="true" style={wrapStyle}>
          <span style={dottedSeg} />
          <span style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: BLURB_FONT, lineHeight: 1, padding: '0 8px', whiteSpace: 'nowrap' }}>
            διαβάστε
          </span>
          <span style={dottedSeg} />
          {/* Arrowhead drawn in the same 1px stroke as the leader so the dotted
              line appears to terminate in the arrow — one continuous mark. */}
          <span style={{ width: 5, height: 5, marginLeft: -1, flexShrink: 0, borderTop: `1px solid ${C.faint}`, borderRight: `1px solid ${C.faint}`, transform: 'rotate(45deg)' }} />
        </span>
      )}
    </p>
  );
}

export const PlanACover = ({ proposals, navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;

  // Group proposals by theme bucket for the TOC.
  const buckets = {};
  for (const p of proposals) {
    const t = p.data.theme || 'unsorted';
    (buckets[t] ||= []).push(p);
  }
  const orderedThemes = [...THEME_ORDER, 'unsorted'];

  return (
    <div style={{ fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh' }}>
      <ScrollLine />
      {/* Hero */}
      <section style={{ padding: mobile ? '60px 0 32px' : '96px 0 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>
          <a
            href="https://astylab.gr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 28,
              textDecoration: 'none',
              color: 'inherit',
              width: 'fit-content',
              ...enter(0),
            }}
          >
            <img src="/astylab-logo.png" alt="" style={{ width: 18, height: 18, display: 'block' }} />
            <span data-external-link style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.25em', fontWeight: 400 }}>
              Astylab
            </span>
          </a>
          <h1 style={{ margin: 0, ...enter(80) }}>
            <PlanAMark
              label={SITE.wordmark}
              style={{ fontSize: mobile ? 72 : 120, letterSpacing: '-0.03em', lineHeight: 0.95 }}
            />
          </h1>
          <p style={{
            fontFamily: C.serif,
            fontSize: mobile ? 24 : 36,
            fontStyle: 'italic',
            fontWeight: 400,
            color: C.mid,
            margin: 0,
            marginTop: 12,
            lineHeight: 1.25,
            ...enter(160),
          }}>
            {SITE.tagline}
          </p>

          {/* Theme links (clickable, scroll to TOC bucket). Always wrap so the
              labels never exceed the page width; each label stays intact. */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            columnGap: mobile ? 16 : 22,
            rowGap: mobile ? 10 : 12,
            marginTop: mobile ? 22 : 28,
            ...enter(260),
          }}>
            {THEME_ORDER.map((t) => {
              const tinfo = THEMES[t];
              return (
                <a
                  key={t}
                  data-hover-underline
                  href={`#theme-${t}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(`theme-${t}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  style={{
                    fontFamily: C.serif,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: mobile ? 17 : 19,
                    color: tinfo.accent,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tinfo.label}
                </a>
              );
            })}
          </div>

        </div>
      </section>

      {/* Intro + metrics share the same bounding box */}
      <section style={{ padding: mobile ? '8px 0 48px' : '8px 0 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>
          {/* Metrics — 2-row grid so values align horizontally across columns,
              regardless of whether labels wrap to 1 or 2 lines. */}
          <div style={{
            paddingTop: 0,
            paddingBottom: 4,
            marginBottom: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto auto',
            columnGap: mobile ? 12 : 24,
            rowGap: mobile ? 6 : 8,
            alignItems: 'end',
            ...enter(360),
          }}>
            {SITE.metrics.map((m) => <StatLabel key={m.label} mobile={mobile}>{m.label}</StatLabel>)}
            {SITE.metrics.map((m) => <StatValue key={m.label} mobile={mobile}>{m.value}</StatValue>)}
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: C.mid, marginTop: 0, marginBottom: 22, ...enter(440) }}>
            {foreword}{' '}
            <a
              href="/about"
              onClick={(e) => { e.preventDefault(); navigate('/about'); }}
              style={{
                color: C.mid,
                textDecoration: 'underline dotted',
                textDecorationThickness: 1,
                textUnderlineOffset: 3,
                transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.mid; }}
            >
              Τι είναι το Plan A;
            </a>
          </p>

          {/* Primary path. Released: pick a starting proposal. Pre-release: a
              prominent sign-up card for the launch presentation. */}
          {RELEASED ? (
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'baseline',
              gap: mobile ? '8px 18px' : '0 24px',
              ...enter(500),
            }}>
              <a
                href={proposals[0] ? `/${proposals[0].data.number}-${proposals[0].data.slug || proposals[0].slug}` : '/1'}
                onClick={(e) => {
                  e.preventDefault();
                  const p = proposals[0];
                  navigate(p ? `/${p.data.number}-${p.data.slug || p.slug}` : '/1');
                }}
                data-hover-underline
                style={{
                  fontFamily: C.serif, fontStyle: 'italic', fontSize: mobile ? 17 : 19,
                  fontWeight: 500, color: C.ink, textUnderlineOffset: 4,
                }}
              >
                Διαβάστε από την αρχή →
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const p = proposals[Math.floor(Math.random() * proposals.length)];
                  if (p) {
                    track('Random proposal');
                    navigate(`/${p.data.number}-${p.data.slug || p.slug}`);
                  }
                }}
                data-hover-underline
                style={{
                  fontFamily: C.serif, fontStyle: 'italic', fontSize: mobile ? 15 : 16,
                  color: C.light, textUnderlineOffset: 4,
                }}
              >
                ή από μια τυχαία πρόταση ↻
              </a>
            </div>
          ) : (
            <div style={enter(500)}>
              <SignupCard />
            </div>
          )}
        </div>
      </section>

      {/* TOC */}
      <section style={{ padding: mobile ? '0 0 80px' : '0 0 120px', ...enter(600) }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>

          {proposals.length === 0 && (
            <p style={{ color: C.light, fontSize: 14 }}>Σύντομα κοντά σας.</p>
          )}

          {orderedThemes.map(t => {
            const bucket = buckets[t];
            if (!bucket?.length) return null;
            const tinfo = THEMES[t];
            return (
              <div key={t} id={`theme-${t}`} style={{ marginBottom: 56, scrollMarginTop: 24 }}>
                {tinfo?.label && (
                  <>
                    {THEME_ORDER.indexOf(t) >= 0 && (
                      <div style={{
                        ...EYEBROW,
                        fontSize: mobile ? 11 : 12,
                        color: tinfo.accent,
                        marginBottom: 8,
                      }}>
                        {`ΣΤΟΧΟΣ ${THEME_ORDER.indexOf(t) + 1}`}
                      </div>
                    )}
                    <div style={{
                      fontFamily: C.serif,
                      fontSize: mobile ? 26 : 32,
                      fontStyle: 'italic',
                      fontWeight: 600,
                      color: tinfo.accent,
                      marginBottom: 14,
                      letterSpacing: '-0.01em',
                    }}>
                      {tinfo.label}
                    </div>
                  </>
                )}
                {/* Pre-release: each section shows summaries; point readers to the
                    launch event for the full proposals. */}
                {!RELEASED && (
                  <p style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: C.light,
                    marginTop: -2,
                    marginBottom: 18,
                    maxWidth: 640,
                  }}>
                    Οι πλήρεις προτάσεις του Plan A θα είναι διαθέσιμες σε αυτή την σελίδα μετά την παρουσίαση της{' '}
                    <a
                      href={SITE.luma_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('Luma signup')}
                      style={{ color: tinfo.accent, textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      Παρασκευής 5 Ιουνίου
                    </a>. Μέχρι τότε, μπορείτε να διαβάσετε μια σύντομη σύνοψη.
                  </p>
                )}
                {bucket.map(p => {
                  // Released: each row is a link into the proposal, with hover
                  // affordances + a "διαβάστε" cue. Pre-release: a static, plainly
                  // non-interactive teaser (no link, no hover, no cue, no blurb).
                  const rowStyle = {
                    display: 'grid',
                    gridTemplateColumns: mobile ? '56px 1fr' : '72px 1fr',
                    gap: 16,
                    padding: '18px 0',
                    borderTop: `1px solid ${C.rule}`,
                    textDecoration: 'none',
                    color: 'inherit',
                    alignItems: 'start',
                  };
                  const inner = (
                    <>
                      <span data-num style={{
                        fontFamily: C.serif,
                        fontSize: mobile ? 30 : 38,
                        fontWeight: 400,
                        color: C.faint,
                        lineHeight: 0.95,
                        letterSpacing: '-0.02em',
                        paddingTop: mobile ? 3 : 4,
                        transition: 'color 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}>
                        {String(p.data.number).padStart(2, '0')}
                      </span>
                      <div data-body style={{ transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{
                          fontFamily: C.serif,
                          fontSize: mobile ? 17 : 20,
                          fontWeight: 600,
                          color: C.ink,
                          lineHeight: 1.3,
                        }}>
                          {p.data.title}
                        </div>
                        {p.data.one_line && (
                          <ProposalBlurb text={p.data.one_line.trim().replace(/\n/g, ' ')} mobile={mobile} cue={RELEASED} />
                        )}
                      </div>
                    </>
                  );
                  if (!RELEASED) {
                    return <div key={p.slug} style={rowStyle}>{inner}</div>;
                  }
                  return (
                    <a
                      key={p.slug}
                      href={`/${p.data.number}-${p.data.slug || p.slug}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/${p.data.number}-${p.data.slug || p.slug}`); }}
                      style={{ ...rowStyle, transition: 'background 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                      {...(!mobile && {
                        onMouseEnter: (e) => {
                          e.currentTarget.style.background = C.hover;
                          const num = e.currentTarget.querySelector('[data-num]');
                          const body = e.currentTarget.querySelector('[data-body]');
                          if (num) num.style.color = tinfo.accent;
                          if (body) body.style.transform = 'translateX(6px)';
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.background = 'transparent';
                          const num = e.currentTarget.querySelector('[data-num]');
                          const body = e.currentTarget.querySelector('[data-body]');
                          if (num) num.style.color = C.faint;
                          if (body) body.style.transform = 'translateX(0)';
                        },
                      })}
                    >
                      {inner}
                    </a>
                  );
                })}
              </div>
            );
          })}

          {/* Pre-release: repeat the sign-up call after the full proposal list,
              for readers who scrolled all the way through the teasers. */}
          {!RELEASED && (
            <div style={{ marginTop: 8 }}>
              <SignupCard />
            </div>
          )}
        </div>
      </section>

      <SiteFooter navigate={navigate} />
    </div>
  );
};

// Metrics-grid cells. Label and value are separate grid children so that the
// values line up on a single baseline across all columns, even when some labels
// wrap to 2 lines and others fit on 1.
function StatLabel({ children, mobile }) {
  return (
    <div style={{ ...EYEBROW, fontSize: mobile ? 10 : 11, lineHeight: 1.25 }}>
      {children}
    </div>
  );
}

function StatValue({ children, mobile }) {
  return (
    <div style={{
      fontFamily: C.serif,
      fontSize: mobile ? 22 : 28,
      fontWeight: 600,
      color: C.ink,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {children}
    </div>
  );
}
