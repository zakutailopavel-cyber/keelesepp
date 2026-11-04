// Words and numbers around the level curve (levelCurve.js): the big value, the change since the start, labels.
import { PROGRESS_KINDS } from '../../services/firebase/progressPoints.js';

const MONTHS = ['jaanuarist', 'veebruarist', 'märtsist', 'aprillist', 'maist', 'juunist', 'juulist', 'augustist', 'septembrist', 'oktoobrist', 'novembrist', 'detsembrist'];
const MONTHS_SHORT = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];

export const sinceText = (date) => MONTHS[Number(String(date).slice(5, 7)) - 1] || '';
export const shortDate = (date) => `${Number(String(date).slice(8, 10))}. ${MONTHS_SHORT[Number(String(date).slice(5, 7)) - 1] || ''}`;
export const formatPercent = (value) => `${String(Math.round(Number(value) * 10) / 10).replace('.', ',')} %`;

// the newest point of the curve is the level now; a mock exam is only a marker beside it
export function curveSummary(curve) {
  const line = curve?.line || [];
  const latest = line.at(-1) || null;
  const first = line[0] || null;
  return { latest, first, change: line.length > 1 ? latest.percent - first.percent : null };
}

export function changeText(summary) {
  if (summary.change === null) return '';
  const sign = summary.change > 0 ? '+' : summary.change < 0 ? '−' : '±';
  return `${sign}${formatPercent(Math.abs(summary.change))} alates ${sinceText(summary.first.date)}`;
}

// what one point is, in a few words
export function pointLabel(point) {
  if (point.kind === 'computed') return 'kursuse eesmärkide järgi';
  const stored = point.anchor || point;
  return stored.label || PROGRESS_KINDS[stored.kind]?.label || '';
}
export const pointText = (point) => `${shortDate(point.date)} · ${pointLabel(point)} · ${formatPercent(point.percent)}`;
