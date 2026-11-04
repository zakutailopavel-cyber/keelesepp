import { useEffect, useRef, useState } from 'react';
import { formatPercent, pointLabel, pointText } from './proficiencyCurve.js';
import './proficiency.css';

const DAY = 86400000;
const H = 210;
const PAD = { left: 36, right: 16, top: 24, bottom: 24 };
const ms = (date) => Date.parse(`${date}T12:00:00Z`);
const MONTHS_SHORT = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];

// the chart is drawn at the width it really has, so its text stays readable on a phone
function useWidth(fallback = 600) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof globalThis.ResizeObserver !== 'function') return undefined;
    const observer = new globalThis.ResizeObserver(([entry]) => { const next = Math.round(entry.contentRect.width); if (next > 0) setWidth(next); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

function monthTicks(from, to) {
  const ticks = [];
  const date = new Date(from);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  while (date.getTime() <= to) { ticks.push({ at: date.getTime(), label: MONTHS_SHORT[date.getUTCMonth()] }); date.setUTCMonth(date.getUTCMonth() + 1); }
  return ticks;
}

/**
 * One quiet line: the level % from the coursework (dots only at the start, the end and the point picked), the
 * teacher's start / corrections as labelled rings, mock exams as labelled diamonds that do not move the line;
 * gridlines at 0 / 50 / 100 % (100 % = the level).
 */
export default function ProficiencyChart({ line = [], exams = [], level }) {
  const [ref, width] = useWidth();
  const marks = [...line, ...exams.map((exam) => ({ ...exam, isExam: true }))].sort((a, b) => a.date.localeCompare(b.date));
  const [active, setActive] = useState(null);
  const picked = active === null ? null : marks[active];
  const W = Math.max(280, width);
  const dates = marks.map((mark) => ms(mark.date));
  const first = Math.min(...dates);
  const last = Math.max(...dates);
  const from = first - Math.max(3 * DAY, (last - first) * 0.04);
  const to = last + Math.max(3 * DAY, (last - first) * 0.04);
  const xAt = (time) => PAD.left + ((time - from) / (to - from)) * (W - PAD.left - PAD.right);
  const x = (date) => xAt(ms(date));
  const y = (value) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - value / 100);
  const path = line.map((point, index) => `${index ? 'L' : 'M'}${x(point.date).toFixed(1)},${y(point.percent).toFixed(1)}`).join('');
  const lastLine = line.at(-1);
  const anchors = line.filter((point) => point.kind !== 'computed');
  const shownDot = (point, index) => point.kind === 'computed' && (index === 0 || index === line.length - 1 || picked === point);
  const summary = `${level} keeleoskus: ${line.length ? `${formatPercent(line[0].percent)} → ${formatPercent(lastLine.percent)}` : ''}${exams.length ? `; ${exams.map(pointText).join('; ')}` : ''}`;
  const text = (mark) => (mark.isExam ? `${pointText(mark)} (kontroll)` : pointText(mark));
  // the picked point's words, inside the chart beside the point (no caption under it)
  const tip = picked && !picked.isExam && picked.kind === 'computed' ? { x: x(picked.date), y: y(picked.percent), text: `${pointText(picked).split(' · ')[0]} · ${formatPercent(picked.percent)}` } : null;
  return <div className="pf-chart" ref={ref}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={summary} onMouseLeave={() => setActive(null)}>
      {[0, 50].map((value) => <g key={value}><line className="pf-grid" x1={PAD.left} x2={W - PAD.right} y1={y(value)} y2={y(value)} /><text className="pf-axis" x={PAD.left - 6} y={y(value) + 4} textAnchor="end">{value}%</text></g>)}
      {/* the goal: 100 % = the level */}
      <line className="pf-target" x1={PAD.left} x2={W - PAD.right} y1={y(100)} y2={y(100)} />
      <text className="pf-axis" x={PAD.left - 6} y={y(100) + 4} textAnchor="end">100%</text>
      <text className="pf-target-label" x={W - PAD.right} y={y(100) - 7} textAnchor="end">{level} tase</text>
      {monthTicks(from, to).map((tick) => <text key={tick.at} className="pf-axis" x={xAt(tick.at)} y={H - 6} textAnchor="middle">{tick.label}</text>)}
      {line.length > 1 ? <path className="pf-line" d={path} /> : null}
      {line.map((point, index) => (shownDot(point, index) ? <circle key={`${point.date}-${point.kind}`} className="pf-dot" cx={x(point.date)} cy={y(point.percent)} r={picked === point ? 5 : 4} /> : null))}
      {anchors.map((point) => <g key={`a-${point.date}`}>
        <circle className="pf-dot is-anchor" cx={x(point.date)} cy={y(point.percent)} r="6" />
        <text className="pf-anchor-label" x={Math.max(PAD.left + 2, x(point.date))} y={y(point.percent) - 11} textAnchor={x(point.date) < PAD.left + 50 ? 'start' : 'middle'}>{`${pointLabel(point)} ${formatPercent(point.percent)}`}</text>
      </g>)}
      {exams.map((point) => {
        const cx = x(point.date);
        const cy = y(point.percent);
        const above = cy - 14 > PAD.top + 4;
        return <g key={point.id || `${point.date}-exam`} className="pf-exam">
          <rect x={cx - 6} y={cy - 6} width="12" height="12" transform={`rotate(45 ${cx} ${cy})`} />
          <text className="pf-exam-label" x={Math.min(cx, W - PAD.right - 4)} y={above ? cy - 13 : cy + 22} textAnchor={cx > W - PAD.right - 90 ? 'end' : 'middle'}>{`${point.label || 'Proovieksam'} ${formatPercent(point.percent)}`}</text>
        </g>;
      })}
      {lastLine && picked !== lastLine ? <text className="pf-value" x={x(lastLine.date) - 2} y={y(lastLine.percent) + 20} textAnchor="end">{formatPercent(lastLine.percent)}</text> : null}
      {tip ? <text className="pf-tip" x={Math.min(Math.max(tip.x, PAD.left + 40), W - PAD.right - 40)} y={tip.y + 22} textAnchor="middle">{tip.text}</text> : null}
      {/* hit targets bigger than the marks (pointer only: the image has a label and the table has every point) */}
      {marks.map((mark, index) => <circle key={`hit-${mark.date}-${mark.kind}-${index}`} className="pf-hit" data-point={text(mark)} cx={x(mark.date)} cy={y(mark.percent)} r={mark.kind === 'computed' ? 9 : 16} onMouseEnter={() => setActive(index)} onClick={() => setActive(index)}><title>{text(mark)}</title></circle>)}
    </svg>
    {anchors.length || exams.length ? <ul className="pf-legend">
      {anchors.length ? <li><i className="pf-legend__anchor" aria-hidden="true" />Õpetaja hinnang</li> : null}
      {exams.length ? <li><i className="pf-legend__exam" aria-hidden="true" />Proovieksam (kontroll)</li> : null}
    </ul> : null}
  </div>;
}
