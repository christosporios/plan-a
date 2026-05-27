import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

document.body.style.margin = '0';
document.body.style.padding = '0';
document.documentElement.style.margin = '0';
document.documentElement.style.padding = '0';

// Print styles
const printStyle = document.createElement('style');
printStyle.textContent = `
@page {
    margin: 0;
  }

  @media print {
  /* Force all accordion bodies open */
  [data-accordion-body] {
    height: auto !important;
    opacity: 1 !important;
    overflow: visible !important;
    display: block !important;
  }

  /* Show print-only elements */
  [data-print-only] {
    display: block !important;
  }

  /* Hide interactive-only elements */
  [data-no-print] {
    display: none !important;
  }

  /* Hide accordion toggle buttons */
  button[aria-expanded] > div > div:last-child {
    display: none !important;
  }

  /* Page break after each section */
  [data-section] {
    page-break-after: always;
    break-after: page;
  }

  /* Ensure background covers full page */
  html, body, #root {
    background: #f7f6f4 !important;
    min-height: 100% !important;
  }

  /* Ensure all text is dark */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;
document.head.appendChild(printStyle);

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
