import { C, EYEBROW } from '../lib/theme';

// Simple budget table used only by a few proposals (12, 13, 14).
// Plan A uses pre-formatted Greek currency strings (e.g. "€250.000"),
// so we don't try to format numerically.
export const BudgetTable = ({ items, total, period }) => (
  <div style={{ margin: '20px 0' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
      <thead>
        <tr>
          <th style={thStyle}>Κατηγορία</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Κόστος</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.rule}` }}>
            <td style={{ padding: '10px 0', color: C.mid }}>
              {item.label}
              {item.note && <span style={{ color: C.faint, fontSize: 12, marginLeft: 8 }}>({item.note})</span>}
            </td>
            <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: C.mono, fontSize: 12.5, color: C.mid, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {item.cost}
            </td>
          </tr>
        ))}
        {total && (
          <tr>
            <td style={{ padding: '12px 0', fontWeight: 600, color: C.ink, borderTop: `1.5px solid ${C.ink}` }}>
              Σύνολο{period && <span style={{ fontWeight: 400, color: C.light, marginLeft: 8 }}>· {period}</span>}
            </td>
            <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: C.mono, fontSize: 13, fontWeight: 500, color: C.ink, whiteSpace: 'nowrap', borderTop: `1.5px solid ${C.ink}`, fontVariantNumeric: 'tabular-nums' }}>
              {total}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const thStyle = {
  ...EYEBROW,
  fontSize: 9,
  fontWeight: 400,
  textAlign: 'left',
  paddingBottom: 10,
  borderBottom: `1.5px solid ${C.ink}`,
};
