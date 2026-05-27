import { C, EYEBROW } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';

// Shared bottom-of-page footer with site nav (methodology + acknowledgements).
// Appears on the cover, proposal pages, and static pages.
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
        flexDirection: mobile ? 'column' : 'row',
        gap: mobile ? 16 : 12,
        justifyContent: 'space-between',
        alignItems: mobile ? 'flex-start' : 'baseline',
      }}>
        <span style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.15em', fontWeight: 400 }}>
          Astylab · Plan A · 2026
        </span>
        <div style={{ display: 'flex', gap: mobile ? 18 : 24 }}>
          <a href="/methodologia" onClick={(e) => { e.preventDefault(); navigate('/methodologia'); }} style={footLink}>
            Μεθοδολογία
          </a>
          <a href="/eucharisties" onClick={(e) => { e.preventDefault(); navigate('/eucharisties'); }} style={footLink}>
            Ευχαριστίες
          </a>
        </div>
      </div>
    </footer>
  );
};

const footLink = {
  ...EYEBROW,
  fontSize: 13,
  letterSpacing: '0.12em',
  color: C.mid,
  textDecoration: 'none',
};
