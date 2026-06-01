import { C } from '../lib/theme';
import { RELEASED, IS_LOCALHOST, setReleasedOverride } from '../lib/released';

// Localhost-only floating switch (bottom-left) to flip the RELEASED flag at
// runtime, so both the released and pre-release sites can be previewed without
// restarting the dev server. Renders nothing off localhost — it can never reach
// production. Flipping persists the choice (localStorage) and reloads.
export const DevReleaseToggle = () => {
  if (!IS_LOCALHOST) return null;
  const on = RELEASED;
  return (
    <button
      type="button"
      onClick={() => setReleasedOverride(!on)}
      title="Dev only — toggle the RELEASED flag (localhost)"
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 12px',
        background: C.ink,
        color: '#fff',
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: C.mono,
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
        opacity: 0.92,
        userSelect: 'none',
      }}
    >
      {/* Track + knob */}
      <span style={{
        position: 'relative',
        width: 30,
        height: 16,
        borderRadius: 999,
        background: on ? C.agree : 'rgba(255,255,255,0.28)',
        transition: 'background 180ms ease',
        flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute',
          top: 2,
          left: on ? 16 : 2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 180ms ease',
        }} />
      </span>
      <span>{on ? 'released' : 'pre-release'}</span>
    </button>
  );
};
