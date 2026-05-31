import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import qrcode from 'qrcode-generator';
import { C, THEMES, THEME_ORDER, EYEBROW, WORDMARK } from '../lib/theme';
import { SITE } from '../lib/site';
import { pages } from '../lib/pages';
import { proposals, proposalPath } from '../lib/proposals';
import { proposalImage } from '../lib/proposal-images';
import { acknowledgments } from '../lib/acknowledgments';
import { POLIS_GROUPS } from '../lib/polis-groups';
import { useIsMobile } from '../hooks/use-is-mobile';
import { setHueColor, flashHue } from '../lib/hue';
import { PolisStatement } from './polis-statement';

// Full-screen slide deck generated entirely from the same config/YAML the
// regular site uses (SITE, pages.methodologia, THEMES, proposals,
// acknowledgments). Lazy-loaded from app.jsx so none of this ships in the
// initial bundle. Fonts run large — it's meant for a projector.
//
// Deck order:
//   title → methodology (3+3) → for each theme: area title + one slide/proposal
//   → ευχαριστίες → ερωτήσεις (last).

// Public URL (for QR codes). Kept in env so the domain lives in one place.
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://planathens.gr').replace(/\/$/, '');
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

function buildSlides() {
  const slides = [{ type: 'title' }];
  slides.push({ type: 'methodology' });
  slides.push({ type: 'polis' });
  for (const themeKey of THEME_ORDER) {
    const inArea = proposals
      .filter((p) => p.data.theme === themeKey)
      .sort((a, b) => (a.data.number ?? 0) - (b.data.number ?? 0));
    if (!inArea.length) continue;
    slides.push({ type: 'area', themeKey });
    for (const entry of inArea) slides.push({ type: 'proposal', entry, themeKey });
  }
  slides.push({ type: 'thanks' });
  slides.push({ type: 'questions' });
  return slides;
}

// ── QR code (theme-colorable, rendered as a crisp SVG path) ───────────────────

function QRCode({ value, color = C.ink, size = 150 }) {
  const qr = useMemo(() => {
    const q = qrcode(0, 'M');
    q.addData(value);
    q.make();
    const n = q.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { d, n };
  }, [value]);
  const margin = 2;
  const vb = qr.n + margin * 2;
  return (
    <div style={{ background: '#fff', padding: 10, borderRadius: 10, display: 'inline-block', lineHeight: 0, border: `1px solid ${C.rule}` }}>
      <svg width={size} height={size} viewBox={`${-margin} ${-margin} ${vb} ${vb}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
        <path d={qr.d} fill={color} />
      </svg>
    </div>
  );
}

function QRBlock({ value, color, size, mobile, caption = SITE_HOST }) {
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <QRCode value={value} color={color} size={size} />
      <div style={{ ...EYEBROW, fontSize: mobile ? 11 : 13, color: C.light, marginTop: 10, letterSpacing: '0.12em' }}>{caption}</div>
    </div>
  );
}

function Astylab({ mobile }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <img src="/astylab-logo.png" alt="" style={{ width: mobile ? 26 : 34, height: mobile ? 26 : 34, display: 'block' }} />
      <span style={{ ...EYEBROW, fontSize: mobile ? 14 : 17, letterSpacing: '0.28em', fontWeight: 400, color: C.mid }}>Astylab</span>
    </div>
  );
}

// ── Slide renderers ──────────────────────────────────────────────────────────

function TitleSlide({ mobile }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: mobile ? 28 : 40 }}>
        <Astylab mobile={mobile} />
      </div>
      <div style={{ ...WORDMARK, fontSize: mobile ? 66 : 116, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
        {SITE.wordmark}
      </div>
      <div style={{
        fontFamily: C.serif, fontStyle: 'italic', fontWeight: 400,
        fontSize: mobile ? 24 : 40, color: C.mid, marginTop: 16, lineHeight: 1.25,
      }}>
        {SITE.tagline}
      </div>
      {/* Thematic areas, each in its colour */}
      <div style={{
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'baseline',
        columnGap: mobile ? 14 : 20, rowGap: 8, marginTop: mobile ? 24 : 32, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto',
      }}>
        {THEME_ORDER.map((t, i) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'baseline', gap: mobile ? 14 : 20 }}>
            {i > 0 && <span style={{ color: C.rule, fontSize: mobile ? 14 : 18 }}>·</span>}
            <span style={{ fontFamily: C.serif, fontStyle: 'italic', fontWeight: 500, fontSize: mobile ? 15 : 21, color: THEMES[t].accent }}>
              {THEMES[t].label}
            </span>
          </span>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: mobile ? '20px 36px' : '0 72px', marginTop: mobile ? 36 : 56,
      }}>
        {SITE.metrics.map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: C.serif, fontWeight: 600, fontSize: mobile ? 34 : 56,
              color: C.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}>
              {m.value}
            </div>
            <div style={{ ...EYEBROW, fontSize: mobile ? 11 : 14, marginTop: 10 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: mobile ? 40 : 60 }}>
        <QRBlock value={SITE_URL} color={C.ink} size={mobile ? 120 : 156} mobile={mobile} />
      </div>
      {/* A sliver of every proposal's image — a mosaic of the city. */}
      <div style={{
        display: 'flex', gap: 2, marginTop: mobile ? 40 : 60, borderRadius: 10, overflow: 'hidden',
        maxWidth: mobile ? 460 : 820, marginLeft: 'auto', marginRight: 'auto',
      }}>
        {proposals.map((p) => {
          const img = proposalImage(p.data.number);
          return (
            <div key={p.slug} style={{ flex: 1, height: mobile ? 66 : 96, backgroundColor: THEMES[p.data.theme]?.accent || C.ink }}>
              {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Methodology overview — the lead, then just the principle titles (the full
// bodies live on the methodology page / PDF). Reads as the deck's "our basis".
function MethodologySlide({ mobile }) {
  const P = pages.methodologia.principles;
  return (
    <div>
      <div style={{ ...EYEBROW, fontSize: mobile ? 12 : 14, color: C.faint, marginBottom: 16 }}>
        {pages.methodologia.title}
      </div>
      <p style={{
        fontFamily: C.serif, fontStyle: 'italic', fontSize: mobile ? 22 : 30,
        color: C.ink, lineHeight: 1.4, marginTop: 0, marginBottom: mobile ? 28 : 40,
      }}>
        {pages.methodologia.lead}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 14 : 18 }}>
        {P.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: mobile ? 14 : 20 }}>
            <span style={{
              ...EYEBROW, fontSize: mobile ? 13 : 16, fontVariantNumeric: 'tabular-nums',
              color: THEMES[THEME_ORDER[i % THEME_ORDER.length]].accent,
              width: mobile ? 22 : 30, flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{
              fontFamily: C.serif, fontStyle: 'italic', fontWeight: 600,
              fontSize: mobile ? 20 : 27, color: C.ink, lineHeight: 1.25, letterSpacing: '-0.01em',
            }}>
              {p.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Three overlapping circles (one per opinion group). Per-circle multiply blend
// darkens the overlaps, so the triple-overlap centre — the consensus, where
// Plan A builds — is visibly the darkest. That's the whole point of Pol.is.
function PolisVenn({ mobile }) {
  const [A, B, Cg] = POLIS_GROUPS;
  const w = mobile ? 270 : 340;
  const circle = (cx, cy, fill) => (
    <circle cx={cx} cy={cy} r="76" fill={fill} opacity="0.55" style={{ mixBlendMode: 'multiply' }} />
  );
  const letter = (x, y, t, fill) => (
    <text x={x} y={y} textAnchor="middle" fontFamily={C.serif} fontStyle="italic" fontWeight="700" fontSize="26" fill={fill}>{t}</text>
  );
  return (
    <svg viewBox="0 0 300 252" width={w} height={w * 252 / 300} role="img" aria-label="Τρεις ομάδες απόψεων που μοιράζονται ένα κοινό έδαφος στο κέντρο">
      {circle(110, 100, A.color)}
      {circle(190, 100, B.color)}
      {circle(150, 172, Cg.color)}
      {letter(56, 96, 'A', A.color)}
      {letter(244, 96, 'B', B.color)}
      {letter(150, 224, 'C', Cg.color)}
      <rect x="101" y="115" width="98" height="34" rx="17" fill="#fff" stroke={C.rule} />
      <text x="150" y="137" textAnchor="middle" fontFamily={C.sans} fontWeight="600" fontSize="13" fill={C.ink}>Κοινό έδαφος</text>
    </svg>
  );
}

function PolisExplainerSlide({ mobile }) {
  return (
    <div>
      <div style={{ ...EYEBROW, fontSize: mobile ? 12 : 14, color: C.faint, marginBottom: 16 }}>
        Πώς διαβάζουμε το Pol.is
      </div>
      <p style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: mobile ? 20 : 28, color: C.ink, lineHeight: 1.4, margin: 0 }}>
        Ένας αλγόριθμος ομαδοποίησε τους 2.077 συμμετέχοντες σε τρεις ομάδες απόψεων, με βάση τα μοτίβα ψήφου τους.
      </p>

      {/* The diagram — three groups, one shared centre. */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: mobile ? '24px 0' : '34px 0' }}>
        <PolisVenn mobile={mobile} />
      </div>

      {/* The three groups, side by side, each under its colour. */}
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 18 : 24 }}>
        {POLIS_GROUPS.map((g) => (
          <div key={g.label} style={{ flex: 1, borderTop: `3px solid ${g.color}`, paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <g.icon size={mobile ? 22 : 26} color={g.color} strokeWidth={1.75} aria-hidden />
              <div style={{ fontSize: mobile ? 16 : 19, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
                <span style={{ color: g.color }}>{g.label}</span> · {g.title}
              </div>
            </div>
            <div style={{ ...EYEBROW, fontSize: mobile ? 10 : 11, color: C.faint, marginBottom: 7 }}>
              ~{g.size.toLocaleString('el')} ψηφοφόροι
            </div>
            <div style={{ fontSize: mobile ? 14 : 17, color: C.mid, lineHeight: 1.5 }}>{g.desc}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: mobile ? 16 : 21, color: C.ink, lineHeight: 1.5, marginTop: mobile ? 26 : 34, marginBottom: 0, textAlign: 'center' }}>
        Δεν μας ενδιαφέρουν οι διαφωνίες, αλλά το <strong>κοινό έδαφος</strong> — εκεί όπου συμφωνούν και οι τρεις ομάδες. Εκεί χτίζει το Plan A.
      </p>
    </div>
  );
}

function AreaSlide({ themeKey, mobile }) {
  const t = THEMES[themeKey];
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...EYEBROW, fontSize: mobile ? 14 : 18, color: t.accent, marginBottom: 20, letterSpacing: '0.2em' }}>
        {`ΣΤΟΧΟΣ ${THEME_ORDER.indexOf(themeKey) + 1}`}
      </div>
      <div style={{
        fontFamily: C.serif, fontStyle: 'italic', fontWeight: 600,
        fontSize: mobile ? 50 : 84, color: t.accent, lineHeight: 1.05, letterSpacing: '-0.02em',
      }}>
        {t.label}
      </div>
    </div>
  );
}

function ProposalSlide({ entry, themeKey, mobile }) {
  const d = entry.data;
  const accent = THEMES[themeKey]?.accent || C.ink;
  const qrUrl = `${SITE_URL}${proposalPath(entry)}`;
  return (
    <div>
      {/* Title + summary get the full content width — the QR floats outside it
          (in the right gutter on desktop; stacked + centered on mobile). */}
      <div style={{ ...EYEBROW, fontSize: mobile ? 13 : 15, letterSpacing: '0.12em', color: accent, fontWeight: 700, marginBottom: 12 }}>
        Πρόταση {String(d.number).padStart(2, '0')} · {THEMES[themeKey]?.label}
      </div>
      <h2 style={{
        fontFamily: C.serif, fontWeight: 700, fontSize: mobile ? 30 : 46,
        color: C.ink, margin: 0, lineHeight: 1.15, letterSpacing: '-0.02em',
      }}>
        {d.title}
      </h2>
      {d.one_line && (
        <p style={{ fontSize: mobile ? 17 : 24, color: C.mid, lineHeight: 1.5, marginTop: 16, marginBottom: 0 }}>
          {d.one_line.trim().replace(/\n/g, ' ')}
        </p>
      )}

      {mobile && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 4px' }}>
          <QRBlock value={qrUrl} color={accent} size={116} mobile />
        </div>
      )}

      <div style={{ marginTop: mobile ? 20 : 28 }}>
        {d.polis?.map((p, i) => (
          <PolisStatement
            key={i}
            statement={p.statement}
            overall={p.overall}
            groups={p.groups}
            statementId={p.statement_id}
            mobile={mobile}
            large={!mobile}
          />
        ))}
      </div>

      {!mobile && (
        <div style={{
          position: 'fixed', top: '50%', right: 'max(24px, calc(50vw - 580px))',
          transform: 'translateY(-50%)', zIndex: 1,
        }}>
          <QRBlock value={qrUrl} color={accent} size={140} mobile={false} />
        </div>
      )}
    </div>
  );
}

function ThanksSlide({ mobile }) {
  return (
    <div>
      <h2 style={{
        fontFamily: C.serif, fontStyle: 'italic', fontWeight: 700,
        fontSize: mobile ? 42 : 64, color: C.ink, margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em',
      }}>
        Ευχαριστίες
      </h2>
      <p style={{ fontSize: mobile ? 15 : 18, color: C.light, lineHeight: 1.55, marginTop: 18, marginBottom: 0 }}>
        {acknowledgments.funding.replace(/\*\*/g, '')}
      </p>
      <div style={{ fontSize: mobile ? 17 : 22, color: C.mid, marginTop: 18, lineHeight: 1.5 }}>
        <span style={{ ...EYEBROW, fontSize: mobile ? 12 : 14, color: C.faint, marginRight: 12 }}>Σύνταξη</span>
        {acknowledgments.authors.join(' · ')}
      </div>
      <div style={{ ...EYEBROW, fontSize: mobile ? 12 : 14, color: C.faint, marginTop: mobile ? 24 : 32, marginBottom: 16 }}>
        {acknowledgments.experts.length} ειδικοί
      </div>
      <div style={{ columnCount: mobile ? 2 : 3, columnGap: mobile ? 24 : 44 }}>
        {acknowledgments.experts.map((name) => (
          <div key={name} style={{ fontSize: mobile ? 15 : 19, color: C.ink, lineHeight: 1.45, marginBottom: 9, breakInside: 'avoid' }}>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsSlide({ mobile }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...WORDMARK, fontSize: mobile ? 52 : 100, color: C.ink, lineHeight: 1.05 }}>
        Ας συζητήσουμε
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: mobile ? 32 : 48 }}>
        <QRBlock value={SITE_URL} color={C.ink} size={mobile ? 132 : 172} mobile={mobile} />
      </div>
    </div>
  );
}

function Slide({ slide, mobile }) {
  if (slide.type === 'title') return <TitleSlide mobile={mobile} />;
  if (slide.type === 'methodology') return <MethodologySlide mobile={mobile} />;
  if (slide.type === 'polis') return <PolisExplainerSlide mobile={mobile} />;
  if (slide.type === 'area') return <AreaSlide themeKey={slide.themeKey} mobile={mobile} />;
  if (slide.type === 'proposal') return <ProposalSlide entry={slide.entry} themeKey={slide.themeKey} mobile={mobile} />;
  if (slide.type === 'thanks') return <ThanksSlide mobile={mobile} />;
  return <QuestionsSlide mobile={mobile} />;
}

// ── Deck shell ───────────────────────────────────────────────────────────────

export default function Presentation({ onExit }) {
  const mobile = useIsMobile();
  const slides = useMemo(buildSlides, []);
  const [index, setIndex] = useState(0);

  const go = useCallback((delta) => {
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));
  }, [slides.length]);

  // Keyboard navigation + lock background scroll while the deck is open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onExit(); return; }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { e.preventDefault(); setIndex(0); }
      else if (e.key === 'End') { e.preventDefault(); setIndex(slides.length - 1); }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onExit, slides.length]);

  // Sync Philips Hue lights to the current slide's theme colour (no-op unless a
  // relay is configured via VITE_HUE_RELAY). On entry, flash three times first;
  // restore warm white on exit.
  const firstHue = useRef(true);
  useEffect(() => {
    const tk = slides[index]?.themeKey;
    const hex = tk ? THEMES[tk].accent : null;
    if (firstHue.current) { firstHue.current = false; flashHue(hex); }
    else setHueColor(hex);
  }, [index, slides]);
  useEffect(() => () => setHueColor(null), []);

  const px = mobile ? 24 : 56;

  return (
    <div
      data-no-print
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: C.bg, color: C.ink, fontFamily: C.sans,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Exit — floats at the top-right (Esc also works). */}
      <button
        type="button"
        onClick={onExit}
        aria-label="Κλείσιμο παρουσίασης"
        style={{
          position: 'absolute', top: 14, right: 16, zIndex: 2,
          ...EYEBROW, fontSize: 14, color: C.light,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.ink; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.light; }}
      >
        ✕
      </button>

      {/* Slide — keyed by index so each slide remounts (fresh fade-in + scroll reset) */}
      <div
        key={index}
        style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          animation: 'fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div style={{
          margin: 'auto', width: '100%', maxWidth: 880, boxSizing: 'border-box',
          padding: `${mobile ? 40 : 56}px ${px}px ${mobile ? 48 : 64}px`,
        }}>
          <Slide slide={slides[index]} mobile={mobile} />
        </div>
      </div>

      {/* Bottom chrome: slide counter + a per-slide progress strip — one rounded
          bar per slide, colored by its theme accent (black for neutral slides).
          Thick enough to read on a projector. */}
      <div style={{ flexShrink: 0, padding: `${mobile ? 10 : 12}px ${mobile ? 16 : 24}px calc(${mobile ? 12 : 14}px + env(safe-area-inset-bottom, 0px))` }}>
        <div style={{ marginBottom: mobile ? 8 : 10 }}>
          <span style={{ ...EYEBROW, fontSize: mobile ? 11 : 12, color: C.light, fontVariantNumeric: 'tabular-nums' }}>
            {index + 1} / {slides.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: mobile ? 3 : 5 }}>
          {slides.map((s, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              title={`${i + 1} / ${slides.length}`}
              style={{
                flex: 1, height: mobile ? 6 : 8, borderRadius: 4, cursor: 'pointer',
                background: s.themeKey ? THEMES[s.themeKey].accent : C.ink,
                opacity: i <= index ? 1 : 0.22,
                transition: 'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
