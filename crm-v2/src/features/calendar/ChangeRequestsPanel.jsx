import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { slotLabel } from './rescheduleModel.js';

/**
 * Calendar: the teacher's pending „Ei saa tulla?” requests. „Kinnita” moves that one lesson to the chosen time (the
 * normal calendar move) and answers the student; „Keeldu” keeps the lesson and answers with an optional note.
 */
export default function ChangeRequestsPanel({ requests = [], focusId = '', busy = '', onAccept, onDecline }) {
  const [notes, setNotes] = useState({});
  if (!requests.length) return null;
  const when = (request) => `${new Date(`${request.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' })} kell ${request.occurrenceTime}`;
  return <Card className="cal2-requests">
    <div className="section-heading"><div><span className="eyebrow">Õpilaste palved</span><h2>Tunni ülekandmine ({requests.length})</h2></div><CalendarClock size={20} aria-hidden="true" /></div>
    <div className="simple-list">{requests.map((request) => <div key={request.id} className={request.id === focusId ? 'is-focused' : ''}>
      <div>
        <strong>{request.studentName} · {when(request)}{request.late ? <> <Badge tone="danger">vähem kui 24 h</Badge></> : null}</strong>
        <span>{[request.reason, request.other ? `Sobiks: ${request.other}` : '', request.requestedByRole === 'parent' ? `küsis ${request.requestedByName}` : ''].filter(Boolean).join(' · ') || 'Põhjust ei lisatud'}</span>
        <div className="form-actions">
          {(request.proposals || []).map((slot) => <Button key={`${slot.date} ${slot.time}`} loading={busy === `${request.id}|${slot.date} ${slot.time}`} onClick={() => onAccept(request, slot)}>Kinnita {slotLabel(slot)}</Button>)}
          {!request.proposals?.length ? <Button variant="secondary" loading={busy === `${request.id}|manual`} onClick={() => onAccept(request, null)}>Liigutasin ise · kinnita</Button> : null}
          <input className="field__input" aria-label="Vastus õpilasele" placeholder="Vastus (soovi korral)" value={notes[request.id] || ''} onChange={(event) => setNotes({ ...notes, [request.id]: event.target.value })} />
          <Button variant="secondary" loading={busy === `${request.id}|decline`} onClick={() => onDecline(request, notes[request.id] || '')}>Keeldu</Button>
        </div>
      </div>
    </div>)}</div>
  </Card>;
}
