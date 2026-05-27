import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

document.body.style.margin = '0';
document.body.style.padding = '0';
document.documentElement.style.margin = '0';
document.documentElement.style.padding = '0';

// Global styles: animation keyframes, print rules, reduced-motion override.
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  /* Animation keyframes. Transform + opacity only so they're GPU-accelerated. */
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Smooth scroll for in-page anchors (footnote jumps, theme chips). */
  html { scroll-behavior: smooth; }

  /* Opt-in hover underline (theme chips, footer links, etc). */
  [data-hover-underline] { text-decoration: none; text-underline-offset: 3px; }
  [data-hover-underline]:hover { text-decoration: underline; }

  /* Opt-in hover-darken: text shifts from its faint resting color to ink. */
  [data-hover-darken] { transition: color 200ms cubic-bezier(0.16, 1, 0.3, 1); }
  [data-hover-darken]:hover { color: #1a1a1a !important; }

  /* External-link indicator: faint ↗ that brightens on hover. */
  [data-external-link]::after {
    content: '↗';
    font-size: 0.85em;
    margin-left: 4px;
    opacity: 0.4;
    transition: opacity 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  [data-external-link]:hover::after { opacity: 1; }

  /* Section rail: only render at viewports wide enough to host it without
     overlapping the content column (max-width 720 + 24 gap + 160 rail width). */
  @media (max-width: 1199px) {
    [data-section-rail] { display: none !important; }
  }

  /* Accessibility: honor reduced-motion preference everywhere. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  @page { margin: 0; }

  @media print {
    [data-print-only] { display: block !important; }
    [data-no-print] { display: none !important; }
    [data-section] { page-break-after: always; break-after: page; }
    html, body, #root {
      background: #f7f6f4 !important;
      min-height: 100% !important;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;
document.head.appendChild(globalStyle);

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
