import { C, EYEBROW } from '../lib/theme';

// The signature Plan A widget: a Pol.is statement with agreement bars
// for OVERALL + group A + B + C, each annotated with percentages and count.
//
// Source PDF layout:
//   [statement text]    OVERALL nnn  A nn  B nn  C nnn
//                       97% 0% 1%    91%…  100%… 97%…
//                       (619)        (79)  (96)  (444)

function Bar({ agree, disagree, pass }) {
  // Normalize in case the numbers don't quite sum to 100 (rounding in source PDF).
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

function GroupCol({ label, count, data, mobile }) {
  return (
    <div style={{ minWidth: mobile ? 64 : 0 }}>
      <div style={{ ...EYEBROW, fontSize: 9, letterSpacing: '0.15em', marginBottom: 6 }}>
        {label} {count}
      </div>
      <Bar agree={data.agree} disagree={data.disagree} pass={data.pass} />
      <div style={{
        fontFamily: C.mono, fontSize: 10, color: C.mid, marginTop: 6,
        letterSpacing: '0.02em', lineHeight: 1.4,
      }}>
        <span style={{ color: C.agree, fontWeight: 600 }}>{data.agree}%</span>
        {' '}
        <span style={{ color: C.disagree, fontWeight: 600 }}>{data.disagree}%</span>
        {' '}
        <span style={{ color: C.light }}>{data.pass}%</span>
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 9.5, color: C.faint, marginTop: 1 }}>
        ({data.count})
      </div>
    </div>
  );
}

export const PolisStatement = ({ statement, overall, groups = [], statementId, mobile = false }) => {
  return (
    <div style={{
      borderTop: `1px solid ${C.rule}`,
      borderBottom: `1px solid ${C.rule}`,
      padding: '14px 0',
      margin: '12px 0',
      display: 'grid',
      gridTemplateColumns: mobile ? '1fr' : '1.6fr repeat(4, 1fr)',
      gap: mobile ? 16 : 18,
      alignItems: 'start',
    }}>
      <div>
        {statementId != null && (
          <div style={{ ...EYEBROW, fontSize: 9, letterSpacing: 0, marginBottom: 4 }}>
            #{statementId}
          </div>
        )}
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
          {statement}
        </div>
      </div>
      <GroupCol label="OVERALL" count={overall.count} data={overall} mobile={mobile} />
      {groups.map((g, i) => (
        <GroupCol key={i} label={g.label} count={g.count} data={g} mobile={mobile} />
      ))}
    </div>
  );
};

