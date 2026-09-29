import { Eraser, PenLine, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '../../components/ui/index.js';
import { liveLessonWhiteboardService } from '../../services/firebase/liveLessonWhiteboard.js';

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 700;
const COLORS = ['#1C2B3A', '#2F5D50', '#2563EB', '#DC2626'];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function pathFor(points = []) {
  if (!points.length) return '';
  return points.reduce((path, point, index) => `${path}${index ? ' L' : 'M'} ${point.x} ${point.y}`, '');
}

function eventPoint(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = rect.width || VIEWBOX_WIDTH;
  const height = rect.height || VIEWBOX_HEIGHT;
  return {
    x: Math.max(0, Math.min(VIEWBOX_WIDTH, ((event.clientX - rect.left) / width) * VIEWBOX_WIDTH)),
    y: Math.max(0, Math.min(VIEWBOX_HEIGHT, ((event.clientY - rect.top) / height) * VIEWBOX_HEIGHT)),
  };
}

export default function LiveLessonWhiteboard({
  invitation,
  role,
  user,
  service = liveLessonWhiteboardService,
}) {
  const [elements, setElements] = useState([]);
  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const drawingRef = useRef(false);
  const pointsRef = useRef([]);

  const isTeacher = role === 'teacher';
  const writable = invitation.status === 'accepted';

  useEffect(() => service.subscribe(
    invitation.id,
    (items) => {
      setElements(items);
      setReady(true);
    },
    (nextError) => {
      setReady(true);
      setError(nextError?.message || 'Tahvlit ei saanud laadida.');
    },
  ), [invitation.id, service]);

  const strokes = useMemo(
    () => elements.filter((element) => element.type === 'stroke' && Array.isArray(element.points)),
    [elements],
  );

  const begin = (event) => {
    if (!writable) return;
    if (tool === 'eraser') {
      const elementId = event.target?.dataset?.elementId;
      if (!elementId) return;
      const element = elements.find((item) => item.id === elementId);
      if (!isTeacher && element?.updatedByUid !== user.uid) return;
      setSaving(true);
      setError('');
      service.removeElement(invitation.id, elementId)
        .catch((nextError) => setError(nextError?.message || 'Joont ei saanud kustutada.'))
        .finally(() => setSaving(false));
      return;
    }
    const point = eventPoint(event);
    drawingRef.current = true;
    pointsRef.current = [point];
    setDraft([point]);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = (event) => {
    if (!drawingRef.current || tool !== 'pen') return;
    const point = eventPoint(event);
    const previous = pointsRef.current[pointsRef.current.length - 1];
    if (previous && distance(previous, point) < 3) return;
    if (pointsRef.current.length >= 800) return;
    pointsRef.current = [...pointsRef.current, point];
    setDraft(pointsRef.current);
  };

  const finish = async (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const points = pointsRef.current;
    pointsRef.current = [];
    setDraft([]);
    if (points.length < 2) return;
    setSaving(true);
    setError('');
    try {
      await service.addStroke(invitation.id, { points, color, strokeWidth: 4 }, user);
    } catch (nextError) {
      setError(nextError?.message || 'Joont ei saanud salvestada.');
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (!isTeacher || !writable) return;
    setSaving(true);
    setError('');
    try {
      await service.clear(invitation.id);
    } catch (nextError) {
      setError(nextError?.message || 'Tahvlit ei saanud tühjendada.');
    } finally {
      setSaving(false);
    }
  };

  return <Card className="live-whiteboard-card">
    <div className="live-whiteboard-header">
      <div>
        <span className="eyebrow">Ühine tahvel</span>
        <h2>{invitation.title}</h2>
        <p>Õpetaja ja õpilane näevad joonistusi reaalajas.</p>
      </div>
      <span className={ready ? 'live-whiteboard-sync is-ready' : 'live-whiteboard-sync'}>{ready ? 'Sünkroonitud' : 'Ühendan…'}</span>
    </div>

    <div className="live-whiteboard-toolbar" aria-label="Tahvli tööriistad">
      <Button variant={tool === 'pen' ? 'primary' : 'secondary'} disabled={!writable} onClick={() => setTool('pen')}><PenLine size={17} /> Pliiats</Button>
      <Button variant={tool === 'eraser' ? 'primary' : 'secondary'} disabled={!writable} onClick={() => setTool('eraser')}><Eraser size={17} /> Kustutaja</Button>
      <div className="live-whiteboard-colors" aria-label="Joone värv">
        {COLORS.map((nextColor) => <button
          key={nextColor}
          type="button"
          className={color === nextColor ? 'live-whiteboard-color is-active' : 'live-whiteboard-color'}
          style={{ backgroundColor: nextColor }}
          aria-label={`Värv ${nextColor}`}
          aria-pressed={color === nextColor}
          onClick={() => { setColor(nextColor); setTool('pen'); }}
        />)}
      </div>
      {isTeacher ? <Button variant="secondary" disabled={saving || !writable || !elements.length} onClick={clear}><Trash2 size={17} /> Tühjenda tahvel</Button> : null}
      <span className="live-whiteboard-count">{strokes.length} joont</span>
    </div>

    {error ? <p className="form-error" role="alert">{error}</p> : null}

    <div className={tool === 'eraser' ? 'live-whiteboard-stage is-eraser' : 'live-whiteboard-stage'}>
      <svg
        role="img"
        aria-label="Ühine tahvel"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {strokes.map((stroke) => <path
          key={stroke.id}
          data-element-id={stroke.id}
          data-testid={`whiteboard-stroke-${stroke.id}`}
          d={pathFor(stroke.points)}
          fill="none"
          stroke={stroke.color || '#1C2B3A'}
          strokeWidth={stroke.strokeWidth || 4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />)}
        {draft.length ? <path d={pathFor(draft)} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" /> : null}
      </svg>
      {ready && !strokes.length && !draft.length ? <div className="live-whiteboard-empty">Joonista siia — teine osaleja näeb tulemust kohe.</div> : null}
    </div>

    <p className="live-whiteboard-note">Tahvel kuulub ainult sellele Live Classroom tunnile. Jooned salvestatakse eraldi dokumentidena ning vanema või muu kõrvalise konto juurdepääs on Firestore reeglites blokeeritud.</p>
  </Card>;
}
