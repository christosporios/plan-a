import { useState, useMemo, useEffect } from 'react';
import { C } from '../lib/theme';
import { SHOW_DEV_TOOLS } from '../lib/released';
import { proposals } from '../lib/proposals';
import { collectWarnings, topLevel } from '../lib/proposal-warnings';

const LEVEL_COLOR = { error: C.disagree, warn: '#c8941f', info: C.faint };
const LEVEL_LABEL = { error: 'error', warn: 'warning', info: 'info' };

// Dev/staging-only content linter. A floating badge (bottom-left, above the
// release toggle) shows how many potential issues were found across all
// proposals; clicking opens a popup listing them grouped by proposal.
export const WarningsPanel = () => {
  const [open, setOpen] = useState(false);
  const warnings = useMemo(() => collectWarnings(proposals), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!SHOW_DEV_TOOLS) return null;

  const count = warnings.length;
  const level = topLevel(warnings);
  const counts = {
    error: warnings.filter((w) => w.level === 'error').length,
    warn: warnings.filter((w) => w.level === 'warn').length,
    info: warnings.filter((w) => w.level === 'info').length,
  };
  const badgeColor = level ? LEVEL_COLOR[level] : C.agree;

  // Group warnings by proposal for the popup.
  const groups = [];
  for (const w of warnings) {
    let g = groups.find((x) => x.number === w.number);
    if (!g) { g = { number: w.number, title: w.title, items: [] }; groups.push(g); }
    g.items.push(w);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Dev/staging only — content checks across all proposals"
        style={{
          position: 'fixed', left: 16, bottom: 58, zIndex: 99999,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: C.ink, color: '#fff',
          fontFamily: C.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          boxShadow: '0 4px 16px rgba(0,0,0,0.28)', opacity: 0.92, userSelect: 'none',
        }}
      >
        <span style={{
          width: 9, height: 9, borderRadius: '50%', background: badgeColor, flexShrink: 0,
        }} />
        <span>{count === 0 ? 'checks ok' : `${count} ${count === 1 ? 'issue' : 'issues'}`}</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100000,
            background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'fade-in 160ms ease both',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 580, maxHeight: '82vh', display: 'flex', flexDirection: 'column',
              background: C.card, borderRadius: 6, boxShadow: '0 12px 48px rgba(0,0,0,0.35)', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontFamily: C.serif, fontWeight: 700, fontSize: 18, color: C.ink }}>
                  Έλεγχος περιεχομένου
                </div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.light, marginTop: 3, letterSpacing: '0.04em' }}>
                  {counts.error} errors · {counts.warn} warnings · {counts.info} info
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Κλείσιμο"
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: C.light, padding: 4 }}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '8px 20px 20px' }}>
              {count === 0 ? (
                <div style={{ padding: '28px 0', textAlign: 'center', color: C.light, fontSize: 14 }}>
                  ✓ Δεν βρέθηκαν προβλήματα στις προτάσεις.
                </div>
              ) : (
                groups.map((g) => (
                  <div key={g.number} style={{ marginTop: 18 }}>
                    <div style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint, marginBottom: 8 }}>
                      Πρόταση {String(g.number).padStart(2, '0')} · {g.title}
                    </div>
                    {g.items.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderTop: i ? `1px solid ${C.bg}` : 'none' }}>
                        <span style={{ marginTop: 5, width: 8, height: 8, borderRadius: '50%', background: LEVEL_COLOR[w.level], flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{w.message}</div>
                          <div style={{ fontFamily: C.mono, fontSize: 10.5, color: C.faint, marginTop: 2 }}>
                            {LEVEL_LABEL[w.level]}{w.field ? ` · ${w.field}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
