import { useEffect, useState } from 'react';
import { C, EYEBROW } from '../lib/theme';

// Fixed right-side anchor rail for navigating sections within a proposal.
// Highlights the section currently in the upper third of the viewport.
// Hidden on mobile (the viewport is too narrow to host both rail + content).
//
// Vertical position: tracks the page header so the rail always sits BELOW the
// header's bottom border. Once the header scrolls out of view, the rail
// settles to a fixed offset near the top of the viewport.
export const SectionRail = ({ sections, accent }) => {
  const [active, setActive] = useState(sections[0]?.id ?? null);
  const [topPx, setTopPx] = useState(160);

  useEffect(() => {
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActive(visible[0].target.id);
      },
      {
        rootMargin: '-25% 0px -65% 0px',
        threshold: 0,
      }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const compute = () => {
      const header = document.querySelector('header');
      if (!header) {
        setTopPx(160);
        return;
      }
      const bottom = header.getBoundingClientRect().bottom;
      // While header is visible, anchor the rail 32px below it.
      // Once the header scrolls out, settle the rail near the top of the viewport.
      setTopPx(Math.max(120, bottom + 32));
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, []);

  return (
    <nav
      aria-label="Πλοήγηση ενοτήτων"
      data-no-print
      data-section-rail
      style={{
        position: 'fixed',
        top: topPx,
        // Anchored to the left edge of the viewport, just to the right of the
        // theme-colored progress bar (8px wide at x=0). CSS media query in
        // main.jsx hides the rail below ~1200px so it can't overlap content.
        left: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        zIndex: 40,
        width: 160,
        transition: 'top 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(s.id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              ...EYEBROW,
              fontSize: 10.5,
              letterSpacing: '0.12em',
              color: isActive ? accent : C.light,
              opacity: isActive ? 1 : 0.75,
              textDecoration: 'none',
              transition: 'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.75'; }}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
};
