import { useEffect, useState } from 'react';
import { C, THEMES, THEME_ORDER } from '../lib/theme';

// Fixed vertical line on the left edge of the viewport, used on the cover.
// Color is a linear gradient computed across the whole document height with stops at
// each theme section, so as the user scrolls the visible portion of the line
// transitions smoothly through the section colors.
export const ScrollLine = () => {
  const [scrollY, setScrollY] = useState(0);
  const [docHeight, setDocHeight] = useState(0);
  const [gradient, setGradient] = useState('linear-gradient(to bottom, #1a1a1a, #1a1a1a)');

  // Recompute gradient when layout might change (mount, resize, content load).
  useEffect(() => {
    const compute = () => {
      const total = document.documentElement.scrollHeight;
      if (!total) return;
      setDocHeight(total);

      // Reach a stable color (theme) BEFORE the section starts — a transition band of
      // 6% gives the "plateau when inside a section" feel rather than a constant slow shift.
      const BAND = 6; // percent of page height for the colour transition zone

      const stops = [];
      stops.push(`${C.ink} 0%`);

      let prevColor = C.ink;
      THEME_ORDER.forEach((t) => {
        const el = document.getElementById(`theme-${t}`);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const pos = (top / total) * 100;
        // Just before the section: still previous colour.
        stops.push(`${prevColor} ${Math.max(0, pos - BAND).toFixed(2)}%`);
        // At the section: switch to this section's accent.
        stops.push(`${THEMES[t].accent} ${pos.toFixed(2)}%`);
        prevColor = THEMES[t].accent;
      });
      stops.push(`${prevColor} 100%`);

      setGradient(`linear-gradient(to bottom, ${stops.join(', ')})`);
    };

    compute();
    // Re-measure once layout settles + after Google Fonts swap.
    const t1 = setTimeout(compute, 100);
    const t2 = setTimeout(compute, 600);
    window.addEventListener('resize', compute);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', compute);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 8,
        overflow: 'hidden',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 8,
          height: docHeight || '100vh',
          background: gradient,
          transform: `translateY(${-scrollY}px)`,
          willChange: 'transform',
        }}
      />
    </div>
  );
};

// Simpler variant for a single-color page (proposal pages).
export const SolidLine = ({ color }) => (
  <div
    aria-hidden
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: 8,
      background: color,
      zIndex: 50,
      pointerEvents: 'none',
    }}
  />
);
