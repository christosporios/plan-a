import { useEffect } from 'react';
import { C, EYEBROW, THEMES, THEME_ORDER } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';
import { pages } from '../lib/pages';
import { SiteFooter } from './site-footer';
import { SolidLine } from './scroll-line';

// Dedicated page for /methodologia. Renders a lead paragraph, a numbered
// list of principles each with a colored accent bar, and two long-form
// sections with inline cross-page wayfinding links.
export const MethodologyPage = ({ navigate }) => {
  const mobile = useIsMobile();
  const px = mobile ? 20 : 40;
  const page = pages.methodologia;

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

          {/* Principles — each with an accent bar in a rotating theme color */}
          {page.principles.map((p, i) => {
            const themeKey = THEME_ORDER[i % THEME_ORDER.length];
            const accent = THEMES[themeKey].accent;
            return (
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
                <div style={{ background: accent, borderRadius: 2 }} />
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
            );
          })}

          {/* Section 1: Πώς δουλέψαμε — with inline cross-links */}
          <section style={{ marginTop: mobile ? 40 : 56 }}>
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
              {page.sections[0].title}
            </h2>
            <p style={{ fontSize: 15.5, color: C.mid, lineHeight: 1.75, marginTop: 0, marginBottom: 16 }}>
              Για να φτάσουμε σε αυτές τις είκοσι προτάσεις, χρειάστηκε πολλή δουλειά.
              Το υλικό είναι, άλλωστε, άφθονο. Η δουλειά μας ήταν να ξεχωρίσουμε τι
              πραγματικά αξίζει να συζητηθεί στην Αθήνα απ' όλον αυτόν τον όγκο
              πληροφορίας. Κάναμε εκτενή βιβλιογραφική έρευνα. Παράλληλα,
              συνεργαστήκαμε με{' '}
              <InlineLink href="/eucharisties" navigate={navigate}>29 ειδικούς</InlineLink>
              {' '}— ερευνητές, πανεπιστημιακούς, αρχιτέκτονες, δρώντες από την κοινωνία
              των πολιτών αλλά και από τον ιδιωτικό τομέα, άτομα με εμπειρία στη χάραξη
              πολιτικής. Και πραγματοποιήσαμε{' '}
              <InlineLink href="/diavoulefsi" navigate={navigate}>μια δημόσια διαβούλευση μέσω της πλατφόρμας Pol.is</InlineLink>
              {' '}όπου συμμετείχαν{' '}
              <InlineLink href="/diavoulefsi" navigate={navigate}>2.077 πολίτες</InlineLink>
              {' '}οι οποίοι κατέθεσαν 817 σχόλια και ψήφισαν για 126.819 statements
              συνολικά.
            </p>
          </section>

          {/* Section 2: Πώς διαβάζουμε το Pol.is */}
          <section style={{ marginTop: mobile ? 40 : 56 }}>
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
              {page.sections[1].title}
            </h2>
            <p style={{ fontSize: 15.5, color: C.mid, lineHeight: 1.75, marginTop: 0, marginBottom: 16 }}>
              Μέσω της πλατφόρμας Pol.is, δεν πραγματοποιείται μια απλή ψηφοφορία. Ο
              αλγόριθμός της ομαδοποιεί τους συμμετέχοντες σε ομάδες απόψεων με βάση τα
              μοτίβα ψήφου τους. Στη συγκεκριμένη διαβούλευση προέκυψαν τρεις τέτοιες
              ομάδες — άνθρωποι που σκέφτονται για την πόλη με αρκετά διαφορετικό
              τρόπο. Αυτό που μας ενδιέφερε δεν ήταν τα statements όπου συμφωνεί η μία
              ομάδα. Ήταν τα statements όπου συμφώνησαν και οι τρεις — εκεί όπου μένει
              ο κοινός παρονομαστής που φαίνεται να εκφράζει όλη την πόλη, ανεξαρτώτως
              των σημείων διαφωνίας.
            </p>
            <p style={{ fontSize: 15.5, color: C.mid, lineHeight: 1.75, marginTop: 0, marginBottom: 16 }}>
              Σε αρκετές από τις προτάσεις θα δείτε ένα πλαίσιο{' '}
              <InlineLink href="/diavoulefsi" navigate={navigate}>«Από το Pol.is»</InlineLink>
              . Εκεί παραθέτουμε statements από τη διαβούλευση όπου και οι τρεις ομάδες
              γνώμης ψήφισαν θετικά.
            </p>
            <p style={{ fontSize: 15.5, color: C.mid, lineHeight: 1.75, marginTop: 0, marginBottom: 0 }}>
              Δύο επιφυλάξεις οφείλουμε να καταθέσουμε. Η ψηφοφορία στο Pol.is δεν
              περιλαμβάνει αντιπροσωπευτικό δείγμα των κατοίκων — συμμετέχουν όσοι ήδη
              σε κάποιο βαθμό νοιάζονται για τα ζητήματα της πόλης. Παράλληλα, η
              μεγαλύτερη ομάδα απόψεων υπερεκπροσωπείται στη γενική συμφωνία. Γι' αυτό
              εστιάζουμε στη συμφωνία και των τριών ομάδων μαζί, που είναι και η πιο
              σκληρή πληροφορία που μπορούμε να αντλήσουμε.
            </p>
          </section>
        </div>
      </div>
      <SiteFooter navigate={navigate} />
    </div>
  );
};

function InlineLink({ href, navigate, children }) {
  return (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); navigate(href); }}
      style={{
        color: C.ink,
        textDecoration: 'underline',
        textDecorationColor: C.rule,
        textDecorationThickness: 1,
        textUnderlineOffset: 3,
        transition: 'text-decoration-color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecorationColor = C.ink; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecorationColor = C.rule; }}
    >
      {children}
    </a>
  );
}
