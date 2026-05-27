import { C } from '../lib/theme';

export const Note = ({ children }) => (
  <p style={{ fontSize: 13, color: C.light, fontStyle: 'italic', marginTop: 8, marginBottom: 8, lineHeight: 1.65 }}>
    {children}
  </p>
);
