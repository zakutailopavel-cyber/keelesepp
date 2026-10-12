// The school's material on a student's screen carries who it was given to (owner 2026-10-12: protect the course from
// being spread): a faint repeating watermark (also printed) and a line added to copied text. It does not stop a
// screenshot, but a leaked page shows whose account it came from.
export const OWNER = 'EP Koolitus';

const clean = (value) => String(value || '').replace(/[<>&"']/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);

// the student's label, or '' for staff (teachers see their own material without marks)
export function markLabel(user) {
  const roles = [user?.role, ...(Array.isArray(user?.roles) ? user.roles : [])].filter(Boolean);
  const staff = roles.some((role) => ['admin', 'teacher', 'finance'].includes(role));
  if (!user || staff) return '';
  const who = [clean(user.displayName), clean(user.email)].filter(Boolean).join(' · ');
  return who ? `${who} · © ${OWNER}` : '';
}

// a tiled SVG as a CSS background: the label written diagonally, very light
export function watermarkStyle(label) {
  if (!label) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><text x="10" y="130" transform="rotate(-24 210 110)" font-family="sans-serif" font-size="15" fill="#0b2a4f" fill-opacity="0.07">${label}</text></svg>`;
  return { backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`, backgroundRepeat: 'repeat' };
}

export function copyWithMark(text, label) {
  return label ? `${text}\n\n— © ${OWNER} · ${label.split(' · ©')[0]} · ainult isiklikuks õppimiseks` : text;
}
