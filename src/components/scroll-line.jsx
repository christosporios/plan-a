import { useEffect, useState } from 'react';
import { C, THEMES, THEME_ORDER } from '../lib/theme';

// Fixed vertical line on the left edge of the viewport, used on the cover.
// Gradient is computed across the whole document height with stops at each theme
// section, then translated by -scrollY so the visible portion corresponds to
// the current scroll position. No progress dimming.
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
      const BAND = 6;

      const stops = [];
      stops.push(`${C.ink} 0%`);

      let prevColor = C.ink;
      THEME_ORDER.forEach((t) => {
        const el = document.getElementById(`theme-${t}`);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const pos = (top / total) * 100;
        stops.push(`${prevColor} ${Math.max(0, pos - BAND).toFixed(2)}%`);
        stops.push(`${THEMES[t].accent} ${pos.toFixed(2)}%`);
        prevColor = THEMES[t].accent;
      });
      stops.push(`${prevColor} 100%`);

      setGradient(`linear-gradient(to bottom, ${stops.join(', ')})`);
    };

    compute();
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

// Simpler variant for a single-color page (proposal + static pages).
// `showProgress`: also tracks scroll progress as a filled portion at the top
// of the rail, against a faded background of the same color.
export const SolidLine = ({ color, showProgress = false }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return undefined;
    let raf = 0;
    const compute = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [showProgress]);

  if (!showProgress) {
    return (
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, width: 8, height: '100dvh',
          background: color, zIndex: 50, pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: '100dvh',
        background: alpha(color, 0.22),
        zIndex: 50, pointerEvents: 'none', overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: `${progress}%`,
          background: color,
          transition: 'height 80ms linear',
        }}
      />
    </div>
  );
};

// hex (#rrggbb) → rgba with given alpha. Used to fade the rail background.
function alpha(hex, a) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${a})`;
}
