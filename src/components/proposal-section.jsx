import { SECTION_HEAD } from '../lib/theme';

// Section heading inside a proposal page. Italic serif Greek label, PDF-style.
export const ProposalSection = ({ title, children }) => (
  <section style={{ marginTop: 36, marginBottom: 12 }}>
    <h2 style={{ ...SECTION_HEAD, marginBottom: 16 }}>{title}</h2>
    {children}
  </section>
);
