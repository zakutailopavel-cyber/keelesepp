// Bookkeeping values a block keeps with the learner's answers (docs/E_EXAM_ENGINE.md): the start of an exam part's clock
// („blockId:$startedAt”) and how many times a recording was played („blockId:$plays”, „blockId:$plays.3”). The item of
// such a key starts with `$`: it is never an answer, never scored, and it does not make a task „answered”.
export const isMetaKey = (key) => {
  const text = String(key);
  return text.slice(text.indexOf(':') + 1).startsWith('$');
};
export const START_KEY = '$startedAt';
export const playsKey = (clip = '') => (clip === '' || clip === undefined || clip === null ? '$plays' : `$plays.${clip}`);

// a listening block heard a set number of times (data.lockPlays with data.plays; data.playGap = seconds between plays,
// 10 by default): what ListenAudio needs; null = played freely. `clip`: one of a task's own clips (examlisten 1.3).
export function playLimit(data, ctx, clip = '') {
  if (!data?.lockPlays || !(Number(data.plays) > 0) || !ctx) return null;
  const key = playsKey(clip);
  const gapSec = data.playGap === undefined || data.playGap === '' ? 10 : Number(data.playGap) || 0;
  return { plays: Number(data.plays), gapSec, used: Number(ctx.get?.(key)) || 0, onUse: (n) => ctx.set?.(key, n) };
}

export const formatClock = (seconds) => {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};
