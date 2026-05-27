import { C } from '../lib/theme';
import { Body } from '../lib/format-text';

// Bordered call-out box used in problem / proposal / benefits sections.
// Renders multi-paragraph body text.
export const CalloutBox = ({ children, text, onRefClick }) => (
  <div style={{
    border: `1px solid ${C.rule}`,
    background: C.card,
    padding: '14px 18px',
    margin: '16px 0',
    borderRadius: 2,
  }}>
    {text
      ? <Body text={text} onRefClick={onRefClick} style={{ fontSize: 14, marginBottom: 12 }} />
      : children}
  </div>
);
