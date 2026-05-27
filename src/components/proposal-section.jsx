import { SECTION_HEAD } from '../lib/theme';
import { useIsMobile } from '../hooks/use-is-mobile';

// Section heading inside a proposal page. Italic serif Greek label, PDF-style.
// `id` makes the section anchorable; `accent` adds a colored left bar tying the
// heading to the proposal's theme color.
export const ProposalSection = ({ id, title, accent, children }) => {
  const mobile = useIsMobile();
  return (
    <section id={id} style={{ marginTop: 36, marginBottom: 12, scrollMarginTop: 24 }}>
      <h2 style={{
        ...SECTION_HEAD,
        fontSize: mobile ? 24 : 22,
        lineHeight: 1.15,
        marginBottom: 16,
        paddingLeft: accent ? 14 : 0,
        borderLeft: accent ? `3px solid ${accent}` : 'none',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
};
