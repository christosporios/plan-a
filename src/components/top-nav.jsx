import { useEffect, useRef, useState } from 'react';
import { C, EYEBROW } from '../lib/theme';
import { RELEASED } from '../lib/released';
import { NAV_LINKS } from '../lib/nav-links';
import { PlanAMark } from './plan-a-mark';

// Below this viewport width the five Greek labels no longer fit inline next to
// the wordmark, so the nav collapses to the menu toggle. Above it, links inline.
const INLINE_MIN_WIDTH = 900;

// Sleek, full-width minimal top nav for HERO pages only (the cover + proposal
// pages). It floats transparently over the hero and fades to a solid, blurred
// bar once the reader scrolls (or opens the mobile menu).
//
// The "Plan A" wordmark is HIDDEN at the top — where the page's own large
// "Plan A" / hero is on screen — so it never reads twice. As the bar solidifies
// on scroll the wordmark animates in and plays the easter-egg dance once.
//
// Link colour adapts: white while transparent over a dark hero (proposal image),
// ink otherwise. Interior pages keep their own "← Plan A" back-link and don't
// render this nav.
//
// `variant`: 'dark' = dark image hero (white links when transparent);
//            'light' = light cover hero (ink links throughout).
export function TopNav({ navigate, variant = 'light' }) {
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [danceToken, setDanceToken] = useState(0);
  const hasPlayed = useRef(false);
  const ref = useRef(null);

  // Track viewport width: `small` drives phone-scale sizing, `compact` decides
  // whether the links collapse into the menu toggle.
  useEffect(() => {
    const fn = () => setVw(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  const small = vw < 640;
  const compact = vw < INLINE_MIN_WIDTH;
  const px = small ? 20 : 40;

  // Solidify the bar a touch after the top so it reads as "on scroll".
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, []);

  // Close the mobile menu on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // The bar is "solid" when scrolled or when the mobile menu is open.
  const solid = scrolled || open;

  // The wordmark: on the cover (light hero) it's hidden at the top — where the
  // page's own large "Plan A" sits — and revealed (with a one-time dance) as the
  // bar solidifies on scroll. On proposal pages (dark hero) there's no other
  // "Plan A", so it's shown in the header at all times.
  const alwaysShowWordmark = variant === 'dark';
  const showWordmark = alwaysShowWordmark || solid;
  useEffect(() => {
    if (!alwaysShowWordmark && solid && !hasPlayed.current) {
      hasPlayed.current = true;
      setDanceToken((t) => t + 1);
    }
  }, [alwaysShowWordmark, solid]);

  // White links only while transparent over a dark hero; ink once solid/light.
  const fg = variant === 'dark' && !solid ? '#fff' : C.ink;
  const links = NAV_LINKS.filter((l) => RELEASED || !l.released);

  const goHome = (e) => {
    e.preventDefault();
    setOpen(false);
    if (window.location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
    else navigate('/');
  };

  return (
    <header
      data-no-print
      ref={ref}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: solid ? 'rgba(247, 246, 244, 0.82)' : 'transparent',
        backdropFilter: solid ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${solid ? C.rule : 'transparent'}`,
        transition: 'background 280ms ease, border-color 280ms ease',
      }}
    >
      <div style={{
        padding: `0 ${px}px`,
        height: small ? 52 : 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: fg, transition: 'color 280ms ease',
      }}>
        {/* Wordmark — see showWordmark above. When hidden, pointer-events off so
            the invisible mark isn't clickable. */}
        <a
          href="/"
          onClick={goHome}
          aria-hidden={!showWordmark}
          tabIndex={showWordmark ? 0 : -1}
          style={{
            color: 'inherit', textDecoration: 'none', lineHeight: 1,
            opacity: showWordmark ? 1 : 0,
            transform: showWordmark ? 'translateY(0)' : 'translateY(-6px)',
            pointerEvents: showWordmark ? 'auto' : 'none',
            transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <PlanAMark
            label="Plan A"
            playToken={danceToken}
            style={{ color: 'inherit', fontSize: small ? 20 : 23, letterSpacing: '-0.01em' }}
          />
        </a>

        {!compact && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                data-hover-underline
                onClick={(e) => { e.preventDefault(); navigate(href); }}
                style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.12em', fontWeight: 400, color: 'inherit', textUnderlineOffset: 3 }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {compact && (
          <button
            type="button"
            aria-label="Μενού"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ background: 'none', border: 'none', padding: 6, margin: -6, cursor: 'pointer', color: 'inherit', display: 'inline-flex' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              {open
                ? (<><path d="M5 5l14 14" /><path d="M19 5L5 19" /></>)
                : (<><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></>)}
            </svg>
          </button>
        )}
      </div>

      {compact && open && (
        <nav style={{
          borderTop: `1px solid ${C.rule}`,
          padding: `2px ${px}px 12px`,
          display: 'flex', flexDirection: 'column',
          animation: 'fade-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>
          {links.map(({ href, label }, i) => (
            <a
              key={href}
              href={href}
              onClick={(e) => { e.preventDefault(); setOpen(false); navigate(href); }}
              style={{
                ...EYEBROW, fontSize: 12, letterSpacing: '0.1em', fontWeight: 400,
                color: C.ink, textDecoration: 'none', padding: '12px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${C.rule}`,
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
