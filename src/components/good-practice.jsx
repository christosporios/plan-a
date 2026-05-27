import { C, EYEBROW } from '../lib/theme';
import { Body } from '../lib/format-text';

// "Καλές πρακτικές" entry: case study from another city.
export const GoodPractice = ({ city, period, body, onRefClick }) => (
  <div style={{
    borderLeft: `2px solid ${C.ink}`,
    padding: '12px 18px',
    margin: '16px 0',
    background: C.hover,
  }}>
    <div style={{ ...EYEBROW, fontSize: 9, marginBottom: 8 }}>
      <strong style={{ color: C.ink }}>{city}</strong>
      {period && <> · {period}</>}
    </div>
    <Body text={body} onRefClick={onRefClick} style={{ marginBottom: 0, fontSize: 14 }} />
  </div>
);
