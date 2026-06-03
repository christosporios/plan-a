import { C, EYEBROW } from '../lib/theme';

// On-brand vertical bar chart for cross-city comparisons (e.g. the EU "Quality
// of Life in European Cities" transport-satisfaction series). No charting
// library — inline styles like the rest of the site.
//
// Props:
//   title      short chart title (bold serif)
//   subtitle   one-line description under the title (optional)
//   unit       value suffix shown on labelled bars, e.g. '%' (optional)
//   data       [{ label, value }], PRE-SORTED in the order to display
//   highlight  label to emphasise in the accent color (default 'Αθήνα')
//   source     source attribution text, e.g. 'Survey on the Quality of Life…'
//   source_url optional link wrapping the source text
//   year       optional year appended to the source line
//   accent     theme accent (injected by the proposal page)
//   mobile     layout flag
//
// The highlighted bar carries its value label above and its name (bold) below;
// every other bar shows only a tiny rotated city name, keeping ~30 bars legible.
export function BarChart({
  title,
  subtitle,
  unit = '',
  data = [],
  highlight = 'Αθήνα',
  source,
  source_url,
  year,
  accent = C.ink,
  mobile = false,
  showSource = true,
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const chartH = mobile ? 150 : 180;
  const isHi = (label) => label === highlight;
  // Few categories (e.g. 4 Athens neighbourhoods) get wide bars and short
  // labels: cap the bar width, center the row, and set labels horizontally.
  // Many cities (~30) keep the dense, full-width layout with rotated labels.
  const few = data.length <= 6;
  const barMax = mobile ? 64 : 96;
  const gap = few ? (mobile ? 14 : 24) : (mobile ? 2 : 3);

  return (
    <figure style={{ margin: '22px 0', padding: 0 }}>
      <figcaption style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: C.serif, fontWeight: 700, fontSize: mobile ? 16 : 17, color: C.ink, lineHeight: 1.3 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: C.light, lineHeight: 1.45, marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </figcaption>

      {/* Plot: a flex row of bars, each a column that grows from the baseline. */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: few ? 'center' : 'flex-start',
        gap,
        height: chartH,
        borderBottom: `1px solid ${C.rule}`,
        overflow: 'visible',
      }}>
        {data.map((d, i) => {
          const hi = isHi(d.label);
          const h = Math.max(2, Math.round((d.value / max) * (chartH - 22)));
          return (
            <div key={i} style={{ flex: 1, maxWidth: few ? barMax : undefined, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', minWidth: 0 }}>
              {hi && (
                <div style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.02em', color: accent, marginBottom: 3 }}>
                  {d.value}{unit}
                </div>
              )}
              <div
                title={`${d.label}: ${d.value}${unit}`}
                style={{
                  width: '100%',
                  height: h,
                  background: hi ? accent : C.rule,
                  borderRadius: '1px 1px 0 0',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels. Few categories: horizontal, wrapped, under each bar. Many
          cities: rotated to fit. The highlighted entry reads bold/accent. */}
      <div style={{ display: 'flex', justifyContent: few ? 'center' : 'flex-start', gap, marginTop: few ? 8 : 6 }}>
        {data.map((d, i) => {
          const hi = isHi(d.label);
          return (
            <div key={i} style={{ flex: 1, maxWidth: few ? barMax : undefined, minWidth: 0, height: few ? 'auto' : (mobile ? 48 : 56), display: 'flex', justifyContent: 'center' }}>
              <span style={{
                fontSize: few ? (mobile ? 11 : 12.5) : (mobile ? 8 : 9),
                lineHeight: few ? 1.25 : 1,
                color: hi ? accent : C.faint,
                fontWeight: hi ? 700 : 400,
                textAlign: few ? 'center' : undefined,
                whiteSpace: few ? 'normal' : 'nowrap',
                transform: few ? undefined : 'rotate(-90deg)',
                transformOrigin: 'center',
                alignSelf: few ? 'flex-start' : 'flex-start',
                marginTop: few ? 0 : (mobile ? 22 : 26),
              }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {source && showSource && (
        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>
          Πηγή:{' '}
          {source_url ? (
            <a href={source_url} target="_blank" rel="noopener noreferrer" style={{ color: C.light, textDecoration: 'underline', textUnderlineOffset: 2 }}>
              {source}
            </a>
          ) : source}
          {year ? `, ${year}` : ''}
        </div>
      )}
    </figure>
  );
}
