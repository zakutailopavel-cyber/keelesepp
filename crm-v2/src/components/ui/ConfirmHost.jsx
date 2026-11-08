import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';
import './confirmHost.css';

// The browser's own confirm()/prompt() boxes looked crude, were not in our language and broke the flow on phones
// (design audit 2026-11-09). `askConfirm` / `askText` open the CRM's own dialog instead. One <ConfirmHost /> is
// mounted in App; where it is not (unit tests, a page rendered alone) they fall back to the browser's box, so a test
// that stubs globalThis.confirm / globalThis.prompt keeps working.
let openDialog = null;

export function askConfirm(message, { confirmLabel = 'Jah', cancelLabel = 'Loobu', danger = false, title = 'Kinnita' } = {}) {
  if (!openDialog) return Promise.resolve(Boolean(globalThis.confirm?.(message)));
  return new Promise((resolve) => openDialog({ kind: 'confirm', message, confirmLabel, cancelLabel, danger, title, resolve }));
}

// resolves to the typed text, or null when cancelled (like window.prompt)
export function askText(message, { initial = '', confirmLabel = 'Salvesta', cancelLabel = 'Loobu', title = 'Sisesta' } = {}) {
  if (!openDialog) return Promise.resolve(globalThis.prompt ? globalThis.prompt(message, initial) : null);
  return new Promise((resolve) => openDialog({ kind: 'text', message, initial, confirmLabel, cancelLabel, title, resolve }));
}

export default function ConfirmHost() {
  const [dialog, setDialog] = useState(null);
  const [text, setText] = useState('');
  const queue = useRef([]);
  useEffect(() => {
    openDialog = (next) => {
      queue.current.push(next);
      if (queue.current.length === 1) { setText(next.initial || ''); setDialog(next); }
    };
    return () => { openDialog = null; };
  }, []);
  const close = (value) => {
    dialog?.resolve(value);
    queue.current.shift();
    setText(queue.current[0]?.initial || '');
    setDialog(queue.current[0] || null);
  };
  const cancelValue = dialog?.kind === 'text' ? null : false;
  const accept = () => close(dialog.kind === 'text' ? text : true);
  return <Modal open={Boolean(dialog)} title={dialog?.title || ''} className="confirm-dialog" onClose={() => close(cancelValue)}
    footer={dialog ? <><Button variant="secondary" onClick={() => close(cancelValue)}>{dialog.cancelLabel}</Button><Button variant={dialog.danger ? 'danger' : 'primary'} type="submit" form="confirm-dialog-form">{dialog.confirmLabel}</Button></> : null}>
    {dialog ? <form id="confirm-dialog-form" className="confirm-dialog__body" onSubmit={(event) => { event.preventDefault(); accept(); }}>
      <p>{dialog.message}</p>
      {dialog.kind === 'text' ? <textarea aria-label={dialog.message} value={text} rows={3} onChange={(event) => setText(event.target.value)} /> : null}
    </form> : null}
  </Modal>;
}
