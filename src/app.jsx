import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { proposals, getProposalByNumber } from './lib/proposals';
import { PlanACover } from './components/plan-a-cover';
import { ProposalPage } from './components/proposal-page';
import { StaticPage } from './components/static-page';
import { AggregatedPage } from './components/aggregated-page';
import { PolisPage } from './components/polis-page';
import { MethodologyPage } from './components/methodology-page';
import { PresentationContext } from './lib/presentation-context';
import { track } from './lib/analytics';
import { C } from './lib/theme';
import { RELEASED } from './lib/released';
import { DevReleaseToggle } from './components/dev-release-toggle';
import { WarningsPanel } from './components/warnings-panel';
import { ExportDocxButton } from './components/export-docx-button';

// Presentation mode lives in its own chunk. Referencing lazy() here does NOT
// fetch it — the import() only fires when <Presentation/> first renders (i.e.
// when the user clicks the footer button), keeping it out of the initial bundle.
const Presentation = lazy(() => import('./components/presentation'));

// Routing. Accepted forms for a proposal:
//   /<number>           e.g. /1
//   /<number>-<slug>    e.g. /1-mikres-pezodromiseis (canonical)
//   /p/<number>         legacy
//   /p/<number>-<slug>  legacy with slug
function parseRoute() {
  const path = window.location.pathname.replace(/\/$/, '');
  // Static pages first — these are word slugs, not numbers, so no conflict.
  if (path === '/about') return { kind: 'methodologia' };
  if (path === '/epomena-vimata') return { kind: 'epomena-vimata' };
  if (path === '/eucharisties') return { kind: 'eucharisties' };
  if (path === '/parapombes') return { kind: 'parapombes' };
  if (path === '/diavoulefsi') return { kind: 'diavoulefsi' };
  // Proposal: /N, /N-slug, /p/N, /p/N-slug
  const m = path.match(/^\/(?:p\/)?(\d+)(?:-[^/]+)?$/);
  if (m) return { kind: 'proposal', n: Number(m[1]) };
  return { kind: 'cover' };
}

function renderRoute(route, navigate) {
  if (route.kind === 'proposal') {
    const entry = getProposalByNumber(route.n);
    const idx = proposals.findIndex(p => p.data.number === route.n);
    const prev = idx > 0 ? proposals[idx - 1] : null;
    const next = idx >= 0 && idx < proposals.length - 1 ? proposals[idx + 1] : null;
    return <ProposalPage entry={entry} prev={prev} next={next} navigate={navigate} />;
  }
  if (route.kind === 'methodologia') return <MethodologyPage navigate={navigate} />;
  if (route.kind === 'epomena-vimata') return <StaticPage slug="epomena-vimata" navigate={navigate} />;
  if (route.kind === 'eucharisties') return <StaticPage slug="eucharisties" navigate={navigate} />;
  // References + Pol.is pages don't exist pre-launch — fall through to the cover.
  if (RELEASED && route.kind === 'parapombes') return <AggregatedPage kind="references" navigate={navigate} />;
  if (RELEASED && route.kind === 'diavoulefsi') return <PolisPage navigate={navigate} />;
  return <PlanACover proposals={proposals} navigate={navigate} />;
}

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [presentationOpen, setPresentationOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((path) => {
    window.history.pushState(null, '', path);
    // Instant jump to top on route change; CSS `scroll-behavior: smooth` only
    // applies to in-page anchor jumps (footnotes, theme chips).
    window.scrollTo({ top: 0, behavior: 'instant' });
    setRoute(parseRoute());
  }, []);

  const present = useCallback(() => {
    track('Presentation');
    setPresentationOpen(true);
  }, []);

  return (
    <PresentationContext.Provider value={present}>
      {renderRoute(route, navigate)}
      {presentationOpen && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: C.bg, zIndex: 9999 }} />}>
          <Presentation onExit={() => setPresentationOpen(false)} />
        </Suspense>
      )}
      <DevReleaseToggle />
      <WarningsPanel />
      <ExportDocxButton />
    </PresentationContext.Provider>
  );
}
