import { C } from '../lib/theme';
import { Inline, Body } from '../lib/format-text';

// Recurring Plan A pattern: "Concern; → Mitigation."
// Rendered as a question/answer block.
// Most answers are a single inline paragraph; some carry a callout box or
// multiple paragraphs, which need the block renderer (Body) so fences/paragraphs
// resolve instead of leaking as literal text.
export const LimitationQA = ({ q, a, onRefClick, accent, navigate }) => {
  const rich = typeof a === 'string' && (a.includes(':::') || /\n\s*\n/.test(a));
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontWeight: 600,
        color: C.ink,
        fontSize: 15,
        marginBottom: 6,
        lineHeight: 1.5,
      }}>
        <Inline text={q} onRefClick={onRefClick} accent={accent} navigate={navigate} />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ color: C.faint, fontSize: 14, lineHeight: 1.75, flexShrink: 0 }}>→</span>
        <div style={{ fontSize: 14.5, color: C.mid, lineHeight: 1.75, flex: 1, minWidth: 0 }}>
          {rich
            ? <Body text={a} onRefClick={onRefClick} accent={accent} navigate={navigate} style={{ fontSize: 14.5, marginBottom: 0 }} />
            : <Inline text={a} onRefClick={onRefClick} accent={accent} navigate={navigate} />}
        </div>
      </div>
    </div>
  );
};
