import { useState, useRef, useEffect } from 'react';
import { C, THEMES, THEME_ORDER, WORDMARK } from '../lib/theme';

// The "Plan A" wordmark with a hidden easter egg: click it and the A pulls away
// from "Plan", springs back and pops, while the whole mark flashes a (random)
// theme colour before settling back — a little dance. No pointer cursor: it's an
// egg, discovered by accident. Used on the landing hero and the footer.
export function PlanAMark({ style, label = 'Plan A' }) {
  const [run, setRun] = useState(0);   // bump to retrigger the keyframe
  const [flash, setFlash] = useState(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dance = () => {
    timers.current.forEach(clearTimeout);
    setRun((k) => k + 1);
    const accent = THEMES[THEME_ORDER[Math.floor(Math.random() * THEME_ORDER.length)]].accent;
    timers.current = [
      setTimeout(() => setFlash(accent), 330),   // colour flashes in as the A pops
      setTimeout(() => setFlash(null), 1150),    // settle back to the base colour
    ];
  };

  const [plan, a] = label.split(/(?=A$)/); // "Plan " + "A"
  return (
    <span
      onClick={dance}
      style={{
        ...WORDMARK,
        ...style,
        color: flash || style?.color || C.ink,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'color 360ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {plan}
      <span key={run} style={{ display: 'inline-block', animation: run ? 'plan-a-dance 760ms cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none' }}>
        {a}
      </span>
    </span>
  );
}
