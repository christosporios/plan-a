import { useContext } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { SITE } from '../lib/site';
import { useIsMobile } from '../hooks/use-is-mobile';
import { PresentationContext } from '../lib/presentation-context';
import { PlanAMark } from './plan-a-mark';

// Shared bottom-of-page footer with site nav.
// Appears on the cover, proposal pages, static pages, and aggregated lists.
const LINKS = [
  { href: '/methodologia',    label: 'Μεθοδολογία' },
  { href: '/diavoulefsi',     label: 'Διαβούλευση' },
  { href: '/parapombes',      label: 'Παραπομπές' },
  { href: '/eucharisties',    label: 'Ευχαριστίες' },
];

export const SiteFooter = ({ navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  const present = useContext(PresentationContext);
  return (
    <footer style={{ borderTop: `1px solid ${C.rule}`, padding: mobile ? '36px 0 32px' : '52px 0 40px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: `0 ${px}px` }}>
        <div style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: mobile ? 'center' : 'flex-start',
          gap: mobile ? 28 : 24,
          textAlign: mobile ? 'center' : 'left',
        }}>
          {/* Left — the wordmark, written the signature way (click it for a dance). */}
          <div>
            <PlanAMark label={SITE.wordmark} style={{ fontSize: mobile ? 34 : 40, letterSpacing: '-0.02em', lineHeight: 1 }} />
            <div style={{
              fontFamily: C.serif, fontStyle: 'italic', fontSize: mobile ? 15 : 17,
              color: C.mid, marginTop: 8, lineHeight: 1.3,
            }}>
              {SITE.tagline}
            </div>
          </div>

          {/* Right — nav, controls, signature line. */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: mobile ? 'center' : 'flex-end',
            gap: 16,
          }}>
            <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: mobile ? 'center' : 'flex-end', gap: mobile ? '8px 18px' : '8px 22px' }}>
              {LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  data-hover-underline
                  href={href}
                  onClick={(e) => { e.preventDefault(); navigate(href); }}
                  style={footLink}
                >
                  {label}
                </a>
              ))}
            </nav>
            {/* Presentation + PDF (download link to the pre-generated report). */}
            <div data-no-print style={{ display: 'flex', flexWrap: 'wrap', justifyContent: mobile ? 'center' : 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => present()}
                style={presentButton}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; e.currentTarget.style.borderColor = C.light; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.light; e.currentTarget.style.borderColor = C.rule; }}
              >
                ▷ Παρουσίαση
              </button>
              <a
                href="/plan-a.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...presentButton, textDecoration: 'none', display: 'inline-block' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; e.currentTarget.style.borderColor = C.light; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.light; e.currentTarget.style.borderColor = C.rule; }}
              >
                ↓ PDF
              </a>
            </div>
            <span style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.15em', color: C.faint }}>
              Astylab · Μάιος 2026
            </span>
          </div>
        </div>

        {/* Funding line — small print. */}
        <p style={{
          marginTop: mobile ? 28 : 32,
          paddingTop: 18,
          borderTop: `1px solid ${C.rule}`,
          fontSize: 10.5,
          lineHeight: 1.6,
          color: C.faint,
          maxWidth: 640,
          textAlign: mobile ? 'center' : 'left',
          marginLeft: mobile ? 'auto' : 0,
          marginRight: mobile ? 'auto' : 0,
        }}>
          Η δράση υλοποιείται με την υποστήριξη του Helidoni Foundation στο πλαίσιο του προγράμματος «Σημεία Στήριξης», το οποίο συγχρηματοδοτείται από{' '}
          <a
            href="/eucharisties"
            data-hover-underline
            onClick={(e) => { e.preventDefault(); navigate('/eucharisties'); }}
            style={{ color: C.light, textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            δέκα κοινωφελείς οργανισμούς
          </a>.
        </p>
      </div>
    </footer>
  );
};

const footLink = {
  ...EYEBROW,
  fontSize: 11,
  letterSpacing: '0.12em',
  fontWeight: 400,
  color: C.light,
};

const presentButton = {
  ...EYEBROW,
  fontSize: 10,
  letterSpacing: '0.18em',
  fontWeight: 400,
  color: C.light,
  background: 'transparent',
  border: `1px solid ${C.rule}`,
  borderRadius: 3,
  padding: '7px 14px',
  cursor: 'pointer',
  transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
};
