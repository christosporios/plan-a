import { useEffect } from 'react';
import { C, EYEBROW, SECTION_HEAD, themeOf } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { Body } from '../lib/format-text';
import { proposals, proposalPath } from '../lib/proposals';
import { NEXT_STEP_CATEGORIES, nextStepTitles } from '../lib/next-steps.mjs';
import { pages } from '../lib/pages';
import { RELEASED } from '../lib/released';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';
import { TopNav } from './top-nav';

// /epomena-vimata — the contribute intro, then every proposal's "επόμενα βήματα"
// grouped by their shared category, so readers can see all the work of one kind
// (e.g. «Χαρτογράφηση σημείων εφαρμογής») in one place.
export const NextStepsPage = ({ navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  const page = pages['epomena-vimata'];

  useEffect(() => {
    document.title = 'Επόμενα βήματα — Plan A';
    return () => { document.title = 'Plan A — 20 προτάσεις για την Αθήνα'; };
  }, []);

  // category key → [{ entry, title, body }]
  const groups = NEXT_STEP_CATEGORIES.map((cat) => {
    const items = [];
    for (const entry of proposals) {
      const steps = entry.data.next_steps || [];
      const titles = nextStepTitles(steps);
      steps.forEach((s, i) => {
        if (s.category === cat.key) items.push({ entry, title: titles[i], body: s.body });
      });
    }
    return { ...cat, items };
  }).filter((g) => g.items.length > 0);

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
            marginBottom: 28,
            color: C.ink,
          }}>
            {page?.title || 'Επόμενα βήματα'}
          </h1>

          {page?.body && <Body text={page.body} navigate={navigate} style={{ fontSize: 15.5 }} />}

          {/* Grouped per-proposal next steps, by shared category. The concrete
              per-proposal work stays behind the launch, like the rest of the
              proposal content. */}
          {RELEASED && (
          <div style={{ marginTop: mobile ? 40 : 56 }}>
            <p style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.15em', color: C.faint, marginBottom: 28 }}>
              Συγκεκριμένα, ανά είδος εργασίας
            </p>
            {groups.map((g) => (
              <section key={g.key} style={{ marginBottom: 44 }}>
                <h2 style={{ ...SECTION_HEAD, fontSize: mobile ? 20 : 24, marginBottom: 18 }}>
                  {g.label}
                </h2>
                {g.items.map(({ entry, body }, i) => {
                  const accent = themeOf(entry.data.theme).accent;
                  return (
                    <div key={i} style={{
                      marginBottom: 18,
                      paddingLeft: 16,
                      borderLeft: `2px solid ${accent}59`,
                    }}>
                      <a
                        href={proposalPath(entry)}
                        onClick={(e) => { e.preventDefault(); navigate(proposalPath(entry)); }}
                        style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 4 }}
                      >
                        <span style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.12em', color: C.faint, marginRight: 8 }}>
                          Πρόταση {String(entry.data.number).padStart(2, '0')}
                        </span>
                        <span style={{ fontFamily: C.serif, fontSize: 17, fontWeight: 600, fontStyle: 'italic', color: accent }}>
                          {entry.data.title}
                        </span>
                      </a>
                      <Body text={body} navigate={navigate} accent={accent} style={{ fontSize: 14, marginBottom: 0, color: C.light }} />
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
          )}
        </div>
      </div>
      <SiteFooter navigate={navigate} />
    </div>
  );
};
