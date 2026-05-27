import { useEffect, useState, useCallback } from 'react';
import { proposals, getProposalByNumber } from './lib/proposals';
import { PlanACover } from './components/plan-a-cover';
import { ProposalPage } from './components/proposal-page';
import { StaticPage } from './components/static-page';

// Routing: / (cover), /p/:n (proposal), /methodologia, /eucharisties
function parseRoute() {
  const path = window.location.pathname.replace(/\/$/, '');
  const m = path.match(/^\/p\/(\d+)/);
  if (m) return { kind: 'proposal', n: Number(m[1]) };
  if (path === '/methodologia') return { kind: 'methodologia' };
  if (path === '/eucharisties') return { kind: 'eucharisties' };
  return { kind: 'cover' };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((path) => {
    window.history.pushState(null, '', path);
    window.scrollTo(0, 0);
    setRoute(parseRoute());
  }, []);

  if (route.kind === 'proposal') {
    const entry = getProposalByNumber(route.n);
    const idx = proposals.findIndex(p => p.data.number === route.n);
    const prev = idx > 0 ? proposals[idx - 1] : null;
    const next = idx >= 0 && idx < proposals.length - 1 ? proposals[idx + 1] : null;
    return <ProposalPage entry={entry} prev={prev} next={next} navigate={navigate} />;
  }

  if (route.kind === 'methodologia') {
    return <StaticPage slug="methodologia" navigate={navigate} />;
  }

  if (route.kind === 'eucharisties') {
    return <StaticPage slug="eucharisties" navigate={navigate} />;
  }

  return <PlanACover proposals={proposals} navigate={navigate} />;
}
