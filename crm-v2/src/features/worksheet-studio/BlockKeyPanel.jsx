import { Eye, EyeOff, KeyRound, X } from 'lucide-react';

const when = (iso) => (iso ? new Date(iso).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }) : '');

// The answers of one task for the TEACHER (owner 2026-10-26: „когда нажимаешь на задание, у учителя должны
// показываться ответы, которыми он может поделиться с учеником”). Rendered under the task the teacher clicked, on the
// teacher's own sheet only (live lesson, „praegune seis”, homework review). With onShow the teacher can show the
// answers of this task to the learner (assignment.liveShown) and hide them again; the learner's answers stay as they are.
// task: blockAnswerKey(doc, blockId). shownBy: { on, byName, at } of the last show / hide.
export default function BlockKeyPanel({ task, shown = false, shownBy = null, busy = false, onShow = null, onClose }) {
  if (!task) return null;
  const stop = (event) => event.stopPropagation();
  const empty = !task.items.length && !task.note && !task.transcript;
  return (
    // clicks inside the panel must not reach the task card (a click there points at the task / closes the panel)
    <div className="ws-block-key" role="region" aria-label={`Vastused: ülesanne ${task.num}`} onClick={stop} onDoubleClick={stop} onPointerUp={stop}>
      <div className="ws-block-key-head">
        <KeyRound size={15} aria-hidden="true" />
        <b>Vastused · ülesanne {task.num}</b>
        <span className="ws-block-key-only">ainult sulle</span>
        <button type="button" className="ws-block-key-x" onClick={onClose} aria-label="Sulge vastused"><X size={15} aria-hidden="true" /></button>
      </div>
      {task.items.length ? (
        <ol className="ws-block-key-items">
          {task.items.map((it) => (
            <li key={it.n}>
              {it.prompt ? <span className="ws-key-prompt">{it.prompt}</span> : null}
              <span className="ws-key-answer">{it.answer || '—'}</span>
              {it.why ? <span className="ws-key-why">{it.why}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
      {task.note ? <p className="ws-block-key-note"><b>Õpetajale:</b> {task.note}</p> : null}
      {task.transcript ? <details className="ws-block-key-script"><summary>Kuulamise tekst</summary><p>{task.transcript}</p></details> : null}
      {empty ? <p className="ws-block-key-note">See on avatud ülesanne: kindlat vastust pole, hinda õpilase vastust ise.</p> : null}
      {onShow && task.items.length ? (
        <div className="ws-block-key-actions">
          {shown
            ? <button type="button" className="st-btn" disabled={busy} onClick={() => onShow(false)}><EyeOff size={14} aria-hidden="true" /> Peida</button>
            : <button type="button" className="st-btn primary" disabled={busy} onClick={() => onShow(true)}><Eye size={14} aria-hidden="true" /> Näita õpilasele</button>}
          <span className="ws-block-key-state" role="status">
            {shown ? 'Õpilane näeb õigeid vastuseid oma vastuste kõrval.' : 'Õpilane ei näe neid vastuseid.'}
            {shownBy?.at ? ` (${shownBy.on ? 'näidatud' : 'peidetud'} ${when(shownBy.at)}${shownBy.byName ? `, ${shownBy.byName}` : ''})` : ''}
          </span>
        </div>
      ) : null}
    </div>
  );
}
