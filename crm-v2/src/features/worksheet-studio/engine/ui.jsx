import { ASPECTS } from './schema.js';
import { MARK_COLORS, MARK_TOKEN } from './richText.js';
import { objectPosition } from './image.js';
import { Headphones } from 'lucide-react';

// Shared visual primitives used by all blocks. Keep them dumb: blocks decide what to show.

export function Photo({ img, aspect = '4:3', alt = '', children, className = '' }) {
  const ratio = ASPECTS[aspect] || 4 / 3;
  return (
    <div className={`ws-photo ${className}`} style={{ aspectRatio: String(ratio) }}>
      {img?.src ? (
        <img src={img.src} alt={alt} style={{ objectPosition: objectPosition(img) }} />
      ) : (
        <div className="ws-photo-empty">Foto</div>
      )}
      {children}
    </div>
  );
}

// a full-width answer grows downwards with what is written (owner 2026-10-10: a long answer was cut off on one line)
const grow = (node) => { if (node) { node.style.height = 'auto'; node.style.height = `${node.scrollHeight}px`; } };

export function Line({ value, onChange, interactive, state, width, label, className = '' }) {
  if (width === '100%') {
    return (
      <textarea
        ref={grow}
        rows={1}
        className={`ws-line ws-line--grow ${state ? 'is-' + state : ''} ${className}`}
        value={value || ''}
        readOnly={!interactive}
        tabIndex={interactive ? 0 : -1}
        aria-label={label}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => { grow(e.target); onChange?.(e.target.value); }}
      />
    );
  }
  return (
    <input
      className={`ws-line ${state ? 'is-' + state : ''} ${className}`}
      style={width ? { width } : undefined}
      value={value || ''}
      readOnly={!interactive}
      tabIndex={interactive ? 0 : -1}
      aria-label={label}
      autoComplete="off"
      spellCheck={false}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function Md({ text }) {
  // Learner-safe inline emphasis. {{term}} = curriculum keyword highlight; *italic*, **bold**, ==highlight==,
  // {red}colour{/red} (richText.js; written by the on-sheet editor).
  const parts = String(text || '').split(MARK_TOKEN);
  return parts.map((p, i) => {
    if (p.startsWith('{{') && p.endsWith('}}')) return <strong className="ws-keyword" key={i}>{p.slice(2, -2)}</strong>;
    const color = /^\{([a-z]+)\}([\s\S]+)\{\/\1\}$/.exec(p);
    if (color && MARK_COLORS[color[1]]) return <span key={i} style={{ color: MARK_COLORS[color[1]] }}><Md text={color[2]} /></span>;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('==') && p.endsWith('==') && p.length > 4) return <mark key={i} className="ws-mark-hl">{p.slice(2, -2)}</mark>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

export function Clock({ time = '07:00' }) {
  const [h, m] = String(time).split(':').map(Number);
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI;
    const r1 = i % 5 ? 43 : 40;
    return <line key={i} x1={50 + r1 * Math.sin(a)} y1={50 - r1 * Math.cos(a)} x2={50 + 46 * Math.sin(a)} y2={50 - 46 * Math.cos(a)} stroke="#0b2a4f" strokeWidth={i % 5 ? 0.8 : 2} />;
  });
  const nums = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const a = (n / 12) * 2 * Math.PI;
    return <text key={n} x={50 + 33.5 * Math.sin(a)} y={50 - 33.5 * Math.cos(a) + 3.6} fontSize="10" fontFamily="Nunito, sans-serif" fontWeight="800" textAnchor="middle" fill="#0b2a4f">{n}</text>;
  });
  const ha = ((((h || 0) % 12) + (m || 0) / 60) / 12) * 2 * Math.PI;
  const ma = ((m || 0) / 60) * 2 * Math.PI;
  return (
    <svg viewBox="0 0 100 100" className="ws-clock" aria-label={`Kell ${time}`}>
      <circle cx="50" cy="50" r="48" fill="#fff" stroke="#1f6b3a" strokeWidth="4" />
      {ticks}
      {nums}
      <line x1="50" y1="50" x2={50 + 18 * Math.sin(ha)} y2={50 - 18 * Math.cos(ha)} stroke="#0b2a4f" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" x2={50 + 27 * Math.sin(ma)} y2={50 - 27 * Math.cos(ma)} stroke="#0b2a4f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3.2" fill="#0b2a4f" />
    </svg>
  );
}

export const Bulb = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="10" r="6.5" fill="#f5b83d" /><rect x="9" y="16" width="6" height="4" rx="1" fill="#c98f1c" /></svg>
);
export const Speech = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#2f7d4c" /><path d="M7 9h10M7 13h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
);
export const Target = () => (
  <svg className="ws-target" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#fff" stroke="#1f6b3a" strokeWidth="3" /><circle cx="20" cy="20" r="11" fill="none" stroke="#1f6b3a" strokeWidth="3" /><circle cx="20" cy="20" r="4.5" fill="#1f6b3a" /><path d="M20 20 L35 6" stroke="#0b2a4f" strokeWidth="2.4" /></svg>
);
export const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13 l6 6 L21 5" fill="none" stroke="#0b2a4f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// The audio of a task: a player on screen, a note on paper (a printed sheet cannot play).
export function AudioBar({ audio, interactive, label = 'Kuula' }) {
  if (!audio?.src) return null;
  if (!interactive) return <div className="ws-audio is-print"><Headphones aria-hidden="true" /><span>{label}: heli on veebis, kuula õpetaja juures.</span></div>;
  return (
    <div className="ws-audio">
      <span className="ws-audio-ico" aria-hidden="true"><Headphones /></span>
      <b>{label}</b>
      <audio controls preload="metadata" src={audio.src} aria-label={label} />
    </div>
  );
}
