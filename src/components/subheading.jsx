import { C } from '../lib/theme';

export const Subheading = ({ children }) => (
  <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.faint, marginTop: 32, marginBottom: 14, paddingBottom: 6, borderBottom: `1px solid ${C.rule}` }}>
    {children}
  </div>
);
