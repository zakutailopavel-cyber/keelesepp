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

// Too few measurements for a level percentage (audit 2026-11-24, finding 06: a parent saw „A2 keeleoskus 0 %” after
// two sheets). Without the teacher's starting point the % is „Oskan” goals / all course goals, so a learner who has
// just begun reads 0 % — which says nothing about what he can do. Thin = no teacher anchor and fewer than
// MIN_MEASURED_SHEETS submitted course sheets, or none of the course goals „Oskan” yet. Then the card shows what was
// done instead of the number.
export const MIN_MEASURED_SHEETS = 3;
export function isThinCurve(curve) {
  const line = curve?.line || [];
  if (!line.length) return false;
  if (curve.anchors?.length) return false;
  const latest = line.at(-1);
  return (Number(curve.measured) || 0) < MIN_MEASURED_SHEETS || !(Number(latest?.mastered) > 0);
}

// what the learner has done, for the neutral state: submitted sheets (any) and words learned
export function doneSheetCount(assignments = []) {
  return assignments.filter((item) => item && (item.status === 'done' || item.completedAt)).length;
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
