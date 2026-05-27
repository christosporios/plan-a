import { C, THEMES, THEME_ORDER, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { ScrollLine } from './scroll-line';
import { SiteFooter } from './site-footer';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <img src="/astylab-logo.png" alt="" style={{ width: 18, height: 18, display: 'block' }} />
            <span style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.25em', fontWeight: 400 }}>
              Astylab
            </span>
          </div>
          <h1 style={{
            fontFamily: C.serif,
            fontSize: mobile ? 72 : 120,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            margin: 0,
            color: C.ink,
          }}>
            Plan A
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
          }}>
            20 προτάσεις για την Αθήνα
          </p>

          {/* Theme chips (clickable, scroll to TOC bucket).
              Desktop: one line, no wrap. Mobile: horizontal scroll if needed. */}
          <div style={{
            marginTop: mobile ? 14 : 20,
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'nowrap',
            gap: mobile ? 10 : 14,
            overflowX: mobile ? 'auto' : 'visible',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            // Hide scrollbar on mobile (it appears only when scrolling)
            scrollbarWidth: 'none',
          }}>
            {THEME_ORDER.map((t, i) => {
              const tinfo = THEMES[t];
              return (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'baseline', gap: mobile ? 10 : 14, flexShrink: 0 }}>
                  {i > 0 && (
                    <span style={{
                      color: C.mid,
                      fontSize: mobile ? 18 : 20,
                      lineHeight: 1,
                      fontWeight: 600,
                    }}>·</span>
                  )}
                  <a
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
                      fontSize: mobile ? 14 : 17,
                      color: tinfo.accent,
                      textDecoration: 'none',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tinfo.label}
                  </a>
                </span>
              );
            })}
          </div>

        </div>
      </section>

      {/* Intro + metrics share the same bounding box */}
      <section style={{ padding: mobile ? '8px 0 48px' : '8px 0 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>
          <div style={{
            paddingTop: 0,
            paddingBottom: 28,
            marginBottom: 8,
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr 1fr 1fr' : 'repeat(3, 1fr)',
            gap: mobile ? '0 12px' : '0 24px',
          }}>
            <Stat label="Πολίτες στη διαβούλευση" value="2.077" mobile={mobile} />
            <Stat label="Ψήφοι" value="126.819" mobile={mobile} />
            <Stat label="Ειδικοί" value="29" mobile={mobile} />
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: C.mid, marginTop: 0, marginBottom: 16 }}>
            Το Plan A διατυπώνει είκοσι συγκεκριμένες προτάσεις για την Αθήνα. Δεν λύνουν τα
            πάντα — αλλά είναι επιλεγμένες ώστε, με το μικρότερο κόστος εφαρμογής, να φέρουν
            το μεγαλύτερο όφελος στους περισσότερους.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.8, color: C.light, margin: 0 }}>
            <a
              href="/methodologia"
              onClick={(e) => { e.preventDefault(); navigate('/methodologia'); }}
              style={{ color: C.mid, textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              Πώς φτιάχτηκε το Plan A →
            </a>
          </p>
        </div>
      </section>

      {/* TOC */}
      <section style={{ padding: mobile ? '0 0 80px' : '0 0 120px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: `0 ${px}px` }}>

          {proposals.length === 0 && (
            <p style={{ color: C.light, fontSize: 14 }}>Σύντομα κοντά σας.</p>
          )}

          {orderedThemes.map(t => {
            const bucket = buckets[t];
            if (!bucket?.length) return null;
            const tinfo = THEMES[t];
            return (
              <div key={t} id={`theme-${t}`} style={{ marginBottom: 44, scrollMarginTop: 24 }}>
                {tinfo?.label && (
                  <div style={{
                    fontFamily: C.serif,
                    fontSize: mobile ? 26 : 32,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: tinfo.accent,
                    marginBottom: 14,
                    letterSpacing: '-0.01em',
                  }}>
                    {tinfo.label}
                  </div>
                )}
                {bucket.map(p => (
                  <a
                    key={p.slug}
                    href={`/p/${p.data.number}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/p/${p.data.number}`); }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: mobile ? '56px 1fr' : '72px 1fr',
                      gap: 16,
                      padding: '18px 0',
                      borderTop: `1px solid ${C.rule}`,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.15s',
                      alignItems: 'start',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.hover;
                      const num = e.currentTarget.querySelector('[data-num]');
                      if (num) num.style.color = tinfo.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      const num = e.currentTarget.querySelector('[data-num]');
                      if (num) num.style.color = C.faint;
                    }}
                  >
                    <span data-num style={{
                      fontFamily: C.serif,
                      fontSize: mobile ? 30 : 38,
                      fontWeight: 400,
                      color: C.faint,
                      lineHeight: 0.95,
                      letterSpacing: '-0.02em',
                      paddingTop: mobile ? 3 : 4,
                      transition: 'color 0.2s',
                    }}>
                      {String(p.data.number).padStart(2, '0')}
                    </span>
                    <div>
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
                        <div style={{
                          fontSize: 13.5,
                          color: C.light,
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}>
                          {p.data.one_line.trim().replace(/\n/g, ' ')}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <SiteFooter navigate={navigate} />
    </div>
  );
};

function Stat({ label, value, mobile }) {
  return (
    <div>
      <div style={{ ...EYEBROW, fontSize: mobile ? 10 : 11, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: C.serif, fontSize: mobile ? 22 : 28, fontWeight: 600, color: C.ink, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}
