/* global URLSearchParams */
// Video block model (pure): a YouTube / Vimeo link or an uploaded file → what the player embeds, what the printed
// sheet links to (QR) and which part of the video is shown. YouTube is embedded from youtube-nocookie.com (no
// cookies until the learner presses play), Vimeo with `dnt=1`. Both hosts are in the CSP `frame-src` (vercel.json).

export const MAX_VIDEO_BYTES = 19 * 1024 * 1024;

// „90”, „1:30”, „01:02:03”, „1m30s”, „90s”, „1h2m” → seconds (0 when empty or not a time)
export function parseTime(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return 0;
  if (/^\d+(\.\d+)?$/.test(text)) return Math.floor(Number(text));
  if (/^\d{1,3}(:\d{1,2}){1,2}$/.test(text)) return text.split(':').reduce((acc, part) => acc * 60 + Number(part), 0);
  const unit = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(text);
  if (unit && (unit[1] || unit[2] || unit[3])) return Number(unit[1] || 0) * 3600 + Number(unit[2] || 0) * 60 + Number(unit[3] || 0);
  return 0;
}

// seconds → „1:05” / „1:02:03”
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

// A pasted link → { provider: 'youtube' | 'vimeo', id, hash?, start } or null (not a supported video link).
export function parseVideoUrl(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m|music)\./, '');
  const path = url.pathname.split('/').filter(Boolean);
  const hashTime = /(?:^|&)t=([^&]+)/.exec(url.hash.replace(/^#/, ''))?.[1];
  const start = parseTime(url.searchParams.get('t') || url.searchParams.get('start') || hashTime || '');

  if (host === 'youtu.be') return YT_ID.test(path[0] || '') ? { provider: 'youtube', id: path[0], start } : null;
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = path[0] === 'watch' || !path.length ? url.searchParams.get('v')
      : ['embed', 'shorts', 'live', 'v', 'e'].includes(path[0]) ? path[1] : '';
    return YT_ID.test(id || '') ? { provider: 'youtube', id, start } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const at = path.findIndex((part) => /^\d{5,}$/.test(part));
    if (at < 0) return null;
    const next = path[at + 1];
    const hash = url.searchParams.get('h') || (next && /^[0-9a-f]{6,}$/i.test(next) ? next : '');
    return { provider: 'vimeo', id: path[at], ...(hash ? { hash } : {}), start };
  }
  return null;
}

// What a video block plays: an uploaded file wins over a link. start / end: the block's fields, else the link's time.
export function videoSource(data = {}) {
  const startField = parseTime(data.start);
  const end = parseTime(data.end);
  if (data.file?.src) return { kind: 'file', src: data.file.src, start: startField, end: end > startField ? end : 0, name: data.file.name || '' };
  const parsed = parseVideoUrl(data.url);
  if (!parsed) return null;
  const start = startField || parsed.start || 0;
  return { kind: parsed.provider, ...parsed, start, end: end > start ? end : 0 };
}

// the address of the embedded player (iframe) — null for a file
export function embedUrl(source) {
  if (!source) return null;
  if (source.kind === 'youtube') {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (source.start) params.set('start', String(source.start));
    if (source.end) params.set('end', String(source.end));
    return `https://www.youtube-nocookie.com/embed/${source.id}?${params}`;
  }
  if (source.kind === 'vimeo') {
    const params = new URLSearchParams({ dnt: '1' });
    if (source.hash) params.set('h', source.hash);
    return `https://player.vimeo.com/video/${source.id}?${params}${source.start ? `#t=${source.start}s` : ''}`;
  }
  return null;
}

// the address of the uploaded file with a media fragment (#t=start,end) so the browser plays only that part
export function fileUrl(source) {
  if (source?.kind !== 'file') return null;
  if (!source.start && !source.end) return source.src;
  return `${source.src}#t=${source.start || 0}${source.end ? `,${source.end}` : ''}`;
}

// the short public address for paper (QR code + text): the watch page, at the start time
export function watchUrl(source) {
  if (!source) return '';
  if (source.kind === 'youtube') return `https://youtu.be/${source.id}${source.start ? `?t=${source.start}` : ''}`;
  if (source.kind === 'vimeo') return `https://vimeo.com/${source.id}${source.hash ? `/${source.hash}` : ''}${source.start ? `#t=${source.start}s` : ''}`;
  return source.src || '';
}

// „0:30–1:20” / „alates 0:30” / ''
export function clipLabel(source) {
  if (!source?.start && !source?.end) return '';
  if (source.end) return `${formatTime(source.start)}–${formatTime(source.end)}`;
  return `alates ${formatTime(source.start)}`;
}
