import { C, EYEBROW } from '../lib/theme';
import { Body } from '../lib/format-text';

// Implementation-phase list, used when a proposal stages work over time.
// e.g. Φάση 1 (Μήνες 1–9): Σχεδιασμός & προκήρυξη...
export const PhaseList = ({ phases, onRefClick }) => (
  <div style={{ margin: '20px 0' }}>
    {phases.map((ph, i) => (
      <div key={i} style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, max-content) 1fr',
        gap: 24,
        padding: '14px 0',
        borderTop: i === 0 ? `1px solid ${C.rule}` : 'none',
        borderBottom: `1px solid ${C.rule}`,
      }}>
        <div>
          <div style={{ fontFamily: C.serif, fontSize: 16, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>
            {ph.title}
          </div>
          {ph.months && (
            <div style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.12em', marginTop: 4 }}>
              Μήνες {ph.months}
            </div>
          )}
        </div>
        <div>
          <Body text={ph.body} onRefClick={onRefClick} style={{ marginBottom: 0, fontSize: 14 }} />
        </div>
      </div>
    ))}
  </div>
);
