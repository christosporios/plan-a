import { C } from '../lib/theme';
import { SHOW_DEV_TOOLS } from '../lib/released';

// Floating button (bottom-left, above the warnings panel + release toggle) that
// downloads every proposal as editable Word documents, bundled in one zip.
//
// The zip is a build artifact (scripts/generate-docx.mjs → public/, regenerated
// every `npm run build`), so this is just a download link to a static file —
// no docx/zip code ships in the client bundle. Dev/staging only: on localhost
// run `npm run generate-docx` once so the file exists; on Vercel preview the
// build has already produced it.
const ZIP_PATH = '/plan-a-proposals-docx.zip';

export const ExportDocxButton = () => {
  if (!SHOW_DEV_TOOLS) return null;
  return (
    <a
      href={ZIP_PATH}
      download
      title="Dev/staging only — download all proposals as editable .docx files (zip)"
      style={{
        position: 'fixed', left: 16, bottom: 100, zIndex: 99999,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
        background: C.ink, color: '#fff', textDecoration: 'none',
        fontFamily: C.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        boxShadow: '0 4px 16px rgba(0,0,0,0.28)', opacity: 0.92, userSelect: 'none',
      }}
    >
      <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>↓</span>
      <span>export .docx</span>
    </a>
  );
};
