import { C, EYEBROW } from '../lib/theme';
import { SITE } from '../lib/site';
import { useIsMobile } from '../hooks/use-is-mobile';
import { track } from '../lib/analytics';

// Pre-release call-to-action (shown while RELEASED is false). Invites visitors to
// the launch presentation on Luma, where the full Plan A is unveiled. Used on the
// cover (in place of the "read from start / random" links) and on every proposal
// page (in place of the hidden body). `accent` themes the button to the proposal.
export const SignupCard = ({ accent = C.ink }) => {
  const mobile = useIsMobile();
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.rule}`,
      borderRadius: 6,
      padding: mobile ? '20px 18px' : '24px 26px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'stretch' : 'center',
      gap: mobile ? 16 : 28,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...EYEBROW, fontSize: 10.5, letterSpacing: '0.16em', color: accent, marginBottom: 8 }}>
          Παρασκευή 5 Ιουνίου
        </div>
        <h2 style={{
          fontFamily: C.serif,
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: mobile ? 21 : 24,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: C.ink,
          margin: 0,
        }}>
          Δηλώστε συμμετοχή στην παρουσίαση
        </h2>
        <p style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: C.mid,
          marginTop: 8,
          marginBottom: 0,
          maxWidth: 480,
        }}>
          Θα παρουσιάσουμε το Plan A την Παρασκευή 5 Ιουνίου. Μετά την παρουσίαση,
          όλο το περιεχόμενο θα είναι διαθέσιμο και σε αυτήν εδώ τη σελίδα.
        </p>
      </div>
      <a
        href={SITE.luma_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('Luma signup')}
        style={{
          flexShrink: 0,
          alignSelf: mobile ? 'flex-start' : 'center',
          background: accent,
          color: '#fff',
          fontFamily: C.sans,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          padding: '12px 22px',
          borderRadius: 4,
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), filter 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Δηλώστε συμμετοχή →
      </a>
    </div>
  );
};
