import { useContext, useEffect, useRef, useState } from 'react';
import { C, EYEBROW, WORDMARK } from '../lib/theme';
import { SITE } from '../lib/site';
import { useIsMobile } from '../hooks/use-is-mobile';
import { PresentationContext } from '../lib/presentation-context';
import { track } from '../lib/analytics';
import { RELEASED, SHOW_DEV_TOOLS } from '../lib/released';
import { acknowledgments } from '../lib/acknowledgments';
import { NAV_LINKS } from '../lib/nav-links';

// The short funding line, with its closing phrase linked to /eucharisties.
const FUND_LINK = 'δέκα κοινωφελείς οργανισμούς';
const fundShortLead = acknowledgments.funding_short.split(FUND_LINK)[0];

// Shared bottom-of-page footer with site nav. Appears on the cover, proposal
// pages, static pages, and aggregated lists. Nav entries are shared with the
// top nav (src/lib/nav-links.js).
const LINKS = NAV_LINKS;

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
          {/* Left — the wordmark. Clicking it goes home: scrolls to top if already
              on the landing page, otherwise navigates there. */}
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              style={{
                ...WORDMARK,
                fontSize: mobile ? 34 : 40,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                display: 'inline-block',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {SITE.wordmark}
            </a>
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
              {LINKS.filter(l => RELEASED || !l.released).map(({ href, label }) => (
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
            {/* PDF download (the pre-generated report) is released-only — hidden
                pre-launch since the report isn't available yet. The presentation
                button is staging-only (localhost + Vercel preview, never prod). */}
            {(RELEASED || SHOW_DEV_TOOLS) && (
            <div data-no-print style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: mobile ? 'center' : 'flex-end', gap: mobile ? '8px 18px' : '8px 22px' }}>
              {SHOW_DEV_TOOLS && (
                <button
                  type="button"
                  onClick={() => present()}
                  style={presentButton}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = C.faint; }}
                >
                  ▷ Παρουσίαση
                </button>
              )}
              {RELEASED && <PdfDownload mobile={mobile} />}
            </div>
            )}
            <a
              href="mailto:adam@astylab.gr,vasiliki@astylab.gr"
              aria-label="Επικοινωνία με email"
              title="adam@astylab.gr, vasiliki@astylab.gr"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: C.faint,
                textDecoration: 'none',
                ...EYEBROW,
                fontSize: 10,
                letterSpacing: '0.18em',
                fontWeight: 400,
                transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.faint; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
                <path d="M3 6l9 7 9-7" />
              </svg>
              Email
            </a>
            <a
              href="https://astylab.gr"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                textDecoration: 'none',
                ...EYEBROW,
                fontSize: 10,
                letterSpacing: '0.15em',
                color: C.faint,
                transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.faint; }}
            >
              <img src="/astylab-logo.png" alt="" style={{ width: 12, height: 12, display: 'block' }} />
              Astylab
            </a>
          </div>
        </div>

        {/* Funding line — small print. The divider spans the full footer width
            (aligning with the columns above); the copy stays narrow for reading. */}
        <div style={{ marginTop: mobile ? 28 : 32, paddingTop: 18, borderTop: `1px solid ${C.rule}` }}>
          <p style={{
            margin: 0,
            fontSize: 10.5,
            lineHeight: 1.6,
            color: C.faint,
            textAlign: mobile ? 'center' : 'left',
          }}>
            {fundShortLead}
            <a
              href="/eucharisties"
              data-hover-underline
              onClick={(e) => { e.preventDefault(); navigate('/eucharisties'); }}
              style={{ color: C.light, textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              {FUND_LINK}
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

// PDF download as a single button that opens a small menu: the full report
// (A4 / A5) plus a one-page A5 flyer. The menu opens upward (the footer sits at
// the page foot) and closes on outside click or Escape.
const PDF_FORMATS = [
  { href: '/plan-a.pdf', label: 'Α4', size: 'A4' },
  { href: '/plan-a-a5.pdf', label: 'Α5', size: 'A5' },
  { href: '/plan-a-flyer.pdf', label: 'Φυλλάδιο Α5', size: 'Flyer' },
];

function PdfDownload({ mobile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ ...presentButton, color: open ? C.ink : C.faint }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.color = C.faint; } }}
      >
        ↓ PDF
        <span style={{ marginLeft: 7, fontSize: 8, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}>▾</span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', zIndex: 10,
            left: mobile ? '50%' : 'auto', right: mobile ? 'auto' : 0,
            transform: mobile ? 'translateX(-50%)' : 'none',
            minWidth: 120, padding: 4,
            background: C.bg, border: `1px solid ${C.rule}`, borderRadius: 4,
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
            animation: 'fade-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          {PDF_FORMATS.map(({ href, label, size }) => (
            <a
              key={href}
              role="menuitem"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { track('PDF download', { size }); setOpen(false); }}
              style={{
                display: 'block',
                padding: '8px 10px', borderRadius: 3, textDecoration: 'none',
                transition: 'background 160ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.rule; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.14em', fontWeight: 400, color: C.ink }}>↓ {label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

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
  color: C.faint,
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: 1,
  transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
};
