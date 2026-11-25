import { Button } from '../../components/ui/index.js';
import './repeatAssignment.css';

// The question asked when a lesson sheet is given again to a student who still has it open (assignmentRepeats.js).
// „Jätka olemasolevat” is the default (focused, first): nothing new is written. „Loo uus katse” is the explicit way to
// a second copy. `repeats` comes from RepeatAssignmentError; `busy` is the choice being saved.
export default function RepeatAssignmentChoice({ message, repeats = [], busy = '', onContinue, onNew, onCancel }) {
  const many = repeats.length > 1;
  return <div className="repeat-choice" role="alertdialog" aria-labelledby="repeat-choice-title" aria-describedby="repeat-choice-text">
    <strong id="repeat-choice-title">Leht on juba antud</strong>
    <p id="repeat-choice-text">{message}</p>
    {many ? <ul>{repeats.slice(0, 8).map((item) => <li key={`${item.studentId}-${item.phase}-${item.existing?.id}`}>{item.studentName || 'Õpilane'} · {item.title}{item.existing?.answered ? ' · alustatud' : ''}</li>)}{repeats.length > 8 ? <li>… ja veel {repeats.length - 8}</li> : null}</ul> : null}
    <div className="repeat-choice__actions">
      <Button autoFocus loading={busy === 'continue'} disabled={Boolean(busy)} onClick={onContinue}>Jätka olemasolevat</Button>
      <Button variant="secondary" loading={busy === 'new'} disabled={Boolean(busy)} onClick={onNew}>Loo uus katse</Button>
      {onCancel ? <Button variant="secondary" disabled={Boolean(busy)} onClick={onCancel}>Tühista</Button> : null}
    </div>
    <small>„Jätka olemasolevat” ei loo uut tööd: õpilane jätkab sealt, kus pooleli jäi. „Loo uus katse” annab lehe uuesti, vana jääb alles.</small>
  </div>;
}
