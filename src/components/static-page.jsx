import { C } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { Body } from '../lib/format-text';
import { pages } from '../lib/pages';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';
import { TopNav } from './top-nav';

// Renders a markdown-frontmatter static page from src/pages/.
// Used for: /eucharisties.
export const StaticPage = ({ slug, navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  const page = pages[slug];

  return (
    <div style={{
      fontFamily: C.sans, background: C.bg, color: C.ink, minHeight: '100vh',
      animation: 'fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <SolidLine color={C.ink} />
      <TopNav navigate={navigate} variant="light" />
      <div style={{ padding: mobile ? '56px 0 56px' : '80px 0 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: `0 ${px}px` }}>
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
            {page?.title || 'Δεν βρέθηκε'}
          </h1>
          {page?.body ? (
            <Body text={page.body} style={{ fontSize: 15.5 }} />
          ) : (
            <p style={{ color: C.light }}>Η σελίδα δεν είναι ακόμη διαθέσιμη.</p>
          )}
        </div>
      </div>
      <SiteFooter navigate={navigate} />
    </div>
  );
};
