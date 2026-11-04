import { useEffect, useState } from 'react';
import { lessonCopiesService } from '../../services/firebase/studentBoard.js';
import { arrowHeads, arrowPathD, calloutBox, isArrowLike } from './arrows.js';
import { COLORS, fontCss, isMarker, pathFor, textBox, unionBounds } from './boardModel.js';
import { INK_BOX, isBookmark } from './bookmarkModel.js';
import { spanCss, spansOf } from './richText.js';
import './board.css';

const MARGIN = 40;

// one element drawn as on the board, without any editing
function StaticElement({ element }) {
  if (element.type === 'stroke') return <path d={pathFor(element.points)} fill="none" stroke={element.color || COLORS[0]} strokeWidth={element.strokeWidth || 4} strokeLinecap="round" strokeLinejoin="round" style={isMarker(element) ? { mixBlendMode: 'multiply' } : undefined} />;
  if (element.type === 'shape') {
    const stroke = { stroke: element.color || COLORS[0], strokeWidth: element.strokeWidth || 3, fill: 'none' };
    if (element.shape === 'ellipse') return <ellipse {...stroke} cx={element.x + element.w / 2} cy={element.y + element.h / 2} rx={Math.abs(element.w / 2)} ry={Math.abs(element.h / 2)} />;
    if (isArrowLike(element)) {
      const label = element.shape === 'callout' ? calloutBox(element) : null;
      return <g>
        <path {...stroke} d={arrowPathD(element)} strokeLinecap="round" />
        {arrowHeads(element).map((points, index) => <polyline key={index} {...stroke} points={points} strokeLinecap="round" strokeLinejoin="round" />)}
        {label ? <g className="sb-callout">
          <rect x={label.x} y={label.y} width={label.w} height={label.h} rx="10" fill="#fff" stroke={stroke.stroke} strokeWidth={Math.max(1.5, stroke.strokeWidth * 0.6)} />
          <foreignObject x={label.x} y={label.y} width={label.w} height={label.h}><div className="sb-callout__text" style={{ fontSize: label.fontSize, color: stroke.stroke }}>{element.text || ''}</div></foreignObject>
        </g> : null}
      </g>;
    }
    return <rect {...stroke} x={element.x} y={element.y} width={element.w} height={element.h} rx="4" />;
  }
  if (isBookmark(element)) {
    return <foreignObject x={element.x} y={element.y} width={element.w} height={element.h}>
      <div className="sb-note sb-note--bookmark" style={{ background: element.color }}>
        {element.ink?.length ? <svg className="sb-note__ink" viewBox={`0 0 ${INK_BOX.w} ${INK_BOX.h}`} preserveAspectRatio="none" aria-hidden="true">{element.ink.map((item, index) => <path key={index} d={item.d} stroke={item.c} strokeWidth={item.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}</svg> : null}
        {element.text ? <span className="sb-note__text">{element.text}</span> : null}
      </div>
    </foreignObject>;
  }
  if (element.type === 'note' || element.type === 'text') {
    const isNote = element.type === 'note';
    const runs = isNote ? null : spansOf(element);
    const rich = runs && runs.some((span) => Object.keys(span).length > 1);
    const height = isNote ? element.h : Math.max(element.h, textBox(element.text || '', element.fontSize || 18, 60, { width: element.w }).h);
    return <foreignObject x={element.x} y={element.y} width={element.w} height={height}>
      <div className={isNote ? 'sb-note' : 'sb-text'} style={isNote ? { background: element.color } : { color: element.color, fontSize: element.fontSize || 18, fontFamily: fontCss(element.fontFamily) }}>{rich
        ? runs.map((span, index) => <span key={index} style={spanCss(span, element.fontSize || 18)}>{span.t}</span>)
        : element.text || ''}</div>
    </foreignObject>;
  }
  if (element.type === 'image') return <image href={element.url} x={element.x} y={element.y} width={element.w} height={element.h} preserveAspectRatio="xMidYMid meet"><title>{element.credit || ''}</title></image>;
  if (element.type === 'pdf') return <foreignObject x={element.x} y={element.y} width={Math.max(element.w, 160)} height={Math.max(Math.min(element.h, 120), 60)}>
    <div className="sb-pdf"><strong>{element.name || 'PDF'}</strong><a href={element.url} target="_blank" rel="noreferrer">Ava PDF</a></div>
  </foreignObject>;
  return null;
}

/** A finished lesson copy (lessonBoards.js) drawn read-only and fitted to its content. */
export default function LessonBoardView({ studentId, pageId, service = lessonCopiesService }) {
  const [state, setState] = useState({ key: '', items: null, error: '' });
  const key = `${studentId}/${pageId}`;
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => service.listElements(studentId, pageId))
      .then((items) => { if (alive) setState({ key, items, error: '' }); })
      .catch((error) => { if (alive) setState({ key, items: [], error: error?.message || 'Tahvlit ei saanud avada.' }); });
    return () => { alive = false; };
  }, [key, pageId, service, studentId]);
  if (state.key !== key || state.items === null) return <p className="lb-muted">Laen tahvlit…</p>;
  if (state.error) return <p className="lb-error" role="alert">{state.error}</p>;
  const bounds = unionBounds(state.items);
  if (!bounds) return <p className="lb-muted">Sellel lehel ei ole midagi.</p>;
  const x = bounds.x1 - MARGIN;
  const y = bounds.y1 - MARGIN;
  const w = Math.max(200, bounds.x2 - bounds.x1 + MARGIN * 2);
  const h = Math.max(120, bounds.y2 - bounds.y1 + MARGIN * 2);
  return <div className="lb-view">
    <svg viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label="Tunni tahvel (ainult vaatamiseks)" preserveAspectRatio="xMidYMin meet">
      {state.items.map((element) => <StaticElement key={element.id} element={element} />)}
    </svg>
  </div>;
}
