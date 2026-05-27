import { C, EYEBROW } from '../lib/theme';

// The signature Plan A widget: a Pol.is statement with agreement bars
// for OVERALL + group A + B + C.
//
// Card layout: statement spans full width on top; below, a row of 4 mini-bar
// cards (OVERALL · A · B · C). Wraps to 2 columns on narrow viewports.

function Bar({ agree, disagree, pass }) {
  // Normalize in case numbers don't sum to exactly 100 (rounding in source PDF).
  const total = Math.max(1, agree + disagree + pass);
  const a = (agree / total) * 100;
  const d = (disagree / total) * 100;
  const p = (pass / total) * 100;
  return (
    <div style={{
      display: 'flex', height: 8, width: '100%',
      background: C.rule, borderRadius: 1, overflow: 'hidden',
    }}>
      <div style={{ width: `${a}%`, background: C.agree }} />
      <div style={{ width: `${d}%`, background: C.disagree }} />
      <div style={{ width: `${p}%`, background: C.pass }} />
    </div>
  );
}

function GroupBlock({ label, data }) {
  return (
    <div>
      <div style={{
        ...EYEBROW, fontSize: 10, letterSpacing: '0.15em', marginBottom: 8,
        fontWeight: 700,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span>{label}</span>
        <span style={{ color: C.ink, fontWeight: 700 }}>{data.count}</span>
      </div>
      <Bar agree={data.agree} disagree={data.disagree} pass={data.pass} />
      <div style={{
        fontFamily: C.mono, fontSize: 11, color: C.mid, marginTop: 8,
        letterSpacing: '0.02em', lineHeight: 1.3,
        fontVariantNumeric: 'tabular-nums',
        display: 'flex', justifyContent: 'space-between', gap: '0 8px',
      }}>
        <span>
          <span style={{ color: C.agree, fontWeight: 700 }}>{data.agree}%</span>
          <span style={{ color: C.faint, marginLeft: 4 }}>ΝΑΙ</span>
        </span>
        <span>
          <span style={{ color: C.disagree, fontWeight: 700 }}>{data.disagree}%</span>
          <span style={{ color: C.faint, marginLeft: 4 }}>ΟΧΙ</span>
        </span>
        <span>
          <span style={{ color: C.light, fontWeight: 700 }}>{data.pass}%</span>
          <span style={{ color: C.faint, marginLeft: 4 }}>ΠΑΣΟ</span>
        </span>
      </div>
    </div>
  );
}

export const PolisStatement = ({ statement, overall, groups = [], statementId, mobile = false }) => {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.rule}`,
      borderRadius: 4,
      padding: mobile ? '18px 18px 20px' : '22px 24px 24px',
      margin: '14px 0',
    }}>
      {/* Statement + # inline; the serif numeral acts as a hanging indent so
          the prompt text aligns with the cap-height of the number, not its
          baseline (which would leave the number visually floating above). */}
      <div style={{
        marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${C.rule}`,
        display: 'flex', alignItems: 'flex-start', gap: mobile ? 12 : 16,
      }}>
        {statementId != null && (
          <div style={{
            fontFamily: C.serif,
            fontSize: mobile ? 22 : 26,
            fontWeight: 600,
            fontStyle: 'italic',
            color: C.faint,
            lineHeight: 1.15,
            flexShrink: 0,
            letterSpacing: '-0.01em',
            // Nudge down slightly so the cap-top of the number aligns with the
            // x-height-top of the prompt text — they look anchored together.
            marginTop: mobile ? 0 : 1,
          }}>
            #{statementId}
          </div>
        )}
        <div style={{ fontSize: mobile ? 14 : 15, color: C.ink, lineHeight: 1.5, paddingTop: 2 }}>
          {statement}
        </div>
      </div>
      {/* OVERALL — full width */}
      <div style={{ marginBottom: 18 }}>
        <GroupBlock label="OVERALL" data={overall} />
      </div>
      {/* Groups A · B · C — 3 equal columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: mobile ? '0 12px' : '0 22px',
      }}>
        {groups.map((g, i) => (
          <GroupBlock key={i} label={g.label} data={g} />
        ))}
      </div>
    </div>
  );
};

