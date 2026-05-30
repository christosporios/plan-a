import { createContext } from 'react';

// Lets the shared SiteFooter open presentation mode without prop-drilling a
// callback through every page. App provides the function; the footer consumes
// it. Defined in its own module so app.jsx and site-footer.jsx don't form an
// import cycle. (The PDF export is a plain download link to a pre-generated
// file, so it needs no context.)
export const PresentationContext = createContext(() => {});
