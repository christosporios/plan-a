import { useEffect } from 'react';
import { C, EYEBROW, THEMES, THEME_ORDER } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { pages } from '../lib/pages';
import { Body } from '../lib/format-text';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';

// Dedicated page for /methodologia. Renders a lead paragraph, a numbered
// list of principles each with a colored accent bar, and two long-form
// sections with inline cross-page wayfinding links.
export const MethodologyPage = ({ navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  const page = pages.methodologia;

  // Top-to-bottom bar of every subject-area accent as strict, equal-height
  // bands (hard stops, no blending), shared by all principle bars.
  const accents = THEME_ORDER.map((t) => THEMES[t].accent);
  const accentGradient = `linear-gradient(180deg, ${accents
    .map((c, i) => `${c} ${((i / accents.length) * 100).toFixed(2)}%, ${c} ${(((i + 1) / accents.length) * 100).toFixed(2)}%`)
    .join(', ')})`;

  useEffect(() => {
    document.title = `${page.title} — Plan A`;
    return () => { document.title = 'Plan A — 20 προτάσεις για την Αθήνα'; };
  }, [page.title]);

  return (
    <div style={{
      fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh',
      animation: 'fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <SolidLine color={C.ink} />
      <div style={{ padding: mobile ? '40px 0 56px' : '64px 0 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: `0 ${px}px` }}>
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            data-hover-underline
            style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.15em', color: C.faint }}
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
            marginBottom: 18,
            color: C.ink,
            textWrap: 'balance',
          }}>
            {page.title}
          </h1>

          {/* Lead paragraph — slightly larger, darker, sits apart */}
          <p style={{
            fontFamily: C.serif,
            fontSize: mobile ? 18 : 21,
            fontStyle: 'italic',
            color: C.ink,
            lineHeight: 1.5,
            marginTop: 0,
            marginBottom: mobile ? 40 : 52,
          }}>
            {page.lead}
          </p>

          {/* Principles — each with an accent bar carrying the full vertical
              gradient of every subject-area color. */}
          {page.principles.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4px 1fr',
                  gap: mobile ? 18 : 22,
                  paddingBottom: mobile ? 24 : 28,
                  marginBottom: mobile ? 24 : 28,
                  borderBottom: i === page.principles.length - 1 ? 'none' : `1px solid ${C.rule}`,
                }}
              >
                <div style={{ background: accentGradient, borderRadius: 2 }} />
                <div>
                  <h2 style={{
                    fontFamily: C.serif,
                    fontSize: mobile ? 19 : 22,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    color: C.ink,
                    margin: 0,
                    marginBottom: 8,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25,
                  }}>
                    {p.title}
                  </h2>
                  <p style={{
                    fontSize: 15,
                    color: C.mid,
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    {p.body}
                  </p>
                </div>
              </div>
          ))}

          {/* Long-form sections — text pulled from pages.methodologia config. */}
          {page.sections.map((section) => (
            <section key={section.id} style={{ marginTop: mobile ? 40 : 56 }}>
              <h2 style={{
                fontFamily: C.serif,
                fontSize: mobile ? 24 : 28,
                fontStyle: 'italic',
                fontWeight: 700,
                color: C.ink,
                margin: 0,
                marginBottom: 16,
                letterSpacing: '-0.01em',
              }}>
                {section.title}
              </h2>
              <Body text={section.body} style={{ fontSize: 15.5, lineHeight: 1.75 }} />
            </section>
          ))}
        </div>
      </div>
      <SiteFooter navigate={navigate} />
    </div>
  );
};
