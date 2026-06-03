import { useState } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { BarChart } from './bar-chart';

// A swipeable/clickable group of related bar charts that share a source. Only
// one chart shows at a time; prev/next step through them and the source line is
// rendered once below. Works on mobile (large touch targets, wrap-around).
export function ChartGroup({ charts = [], accent = C.ink, mobile = false }) {
  const [i, setI] = useState(0);
  if (!charts.length) return null;
  if (charts.length === 1) return <BarChart {...charts[0]} accent={accent} mobile={mobile} />;

  const n = charts.length;
  const active = charts[i];
  const go = (d) => setI((prev) => (prev + d + n) % n);
  const label = active.label || active.title;

  const navBtn = {
    appearance: 'none',
    border: `1px solid ${C.rule}`,
    background: C.card,
    color: accent,
    width: 38,
    height: 38,
    borderRadius: 999,
    fontSize: 18,
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <figure style={{ margin: '22px 0', padding: 0 }}>
      {/* Control bar: prev · active dimension + counter · next */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <button type="button" onClick={() => go(-1)} aria-label="Προηγούμενο διάγραμμα" style={navBtn}>‹</button>
        <div style={{ minWidth: 0, textAlign: 'center', flexGrow: 1 }}>
          <div style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.08em', color: accent, fontWeight: 700 }}>
            {label}
          </div>
          <div style={{ ...EYEBROW, fontSize: 10, color: C.faint, marginTop: 2 }}>
            {i + 1} / {n}
          </div>
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Επόμενο διάγραμμα" style={navBtn}>›</button>
      </div>

      {/* Active chart — its own source line is suppressed; shown once below. */}
      <BarChart {...active} accent={accent} mobile={mobile} showSource={false} />

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}>
        {charts.map((_, j) => (
          <button
            key={j}
            type="button"
            onClick={() => setI(j)}
            aria-label={`Διάγραμμα ${j + 1}`}
            aria-current={j === i}
            style={{
              appearance: 'none', border: 'none', padding: 0, cursor: 'pointer',
              width: j === i ? 18 : 7, height: 7, borderRadius: 999,
              background: j === i ? accent : C.rule, transition: 'width 160ms ease',
            }}
          />
        ))}
      </div>

      {/* Shared source line, rendered once for the whole group. */}
      {active.source && (
        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 10, textAlign: 'center' }}>
          Πηγή:{' '}
          {active.source_url ? (
            <a href={active.source_url} target="_blank" rel="noopener noreferrer" style={{ color: C.light, textDecoration: 'underline', textUnderlineOffset: 2 }}>
              {active.source}
            </a>
          ) : active.source}
          {active.year ? `, ${active.year}` : ''}
        </div>
      )}
    </figure>
  );
}
