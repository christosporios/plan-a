import { C } from '../lib/theme';
import { Inline } from '../lib/format-text';

// Recurring Plan A pattern: "Concern; → Mitigation."
// Rendered as a question/answer block.
export const LimitationQA = ({ q, a, onRefClick }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{
      fontWeight: 600,
      color: C.ink,
      fontSize: 15,
      marginBottom: 6,
      lineHeight: 1.5,
    }}>
      <Inline text={q} onRefClick={onRefClick} />
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: C.faint, fontSize: 14, lineHeight: 1.75, flexShrink: 0 }}>→</span>
      <div style={{ fontSize: 14.5, color: C.mid, lineHeight: 1.75 }}>
        <Inline text={a} onRefClick={onRefClick} />
      </div>
    </div>
  </div>
);
