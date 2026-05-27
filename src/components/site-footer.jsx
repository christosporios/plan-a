import { C, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';

// Shared bottom-of-page footer with site nav.
// Appears on the cover, proposal pages, static pages, and aggregated lists.
const LINKS = [
  { href: '/methodologia',    label: 'Μεθοδολογία' },
  { href: '/diavoulefsi',     label: 'Διαβούλευση' },
  { href: '/kales-praktikes', label: 'Καλές πρακτικές' },
  { href: '/parapombes',      label: 'Παραπομπές' },
  { href: '/eucharisties',    label: 'Ευχαριστίες' },
];

export const SiteFooter = ({ navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  return (
    <footer style={{ borderTop: `1px solid ${C.rule}`, padding: mobile ? '28px 0' : '36px 0' }}>
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: `0 ${px}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: mobile ? '8px 18px' : '6px 24px',
        }}>
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
        </div>
        <span style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.15em', fontWeight: 400, color: C.faint }}>
          Astylab · Plan A · 2026
        </span>
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
