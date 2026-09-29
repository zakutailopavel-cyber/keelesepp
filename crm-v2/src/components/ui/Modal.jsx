import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import IconButton from './IconButton.jsx';

export default function Modal({ open, title, children, footer, onClose, className = '' }) {
  const titleId = useId();
  const modalRef = useRef(null);
  // callers pass a new onClose on every render; keep the latest one without re-running the focus effect,
  // otherwise every keystroke that re-renders the parent moved focus back to the first button (the close ×)
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]';
    const focusable = () => [...(modalRef.current?.querySelectorAll(focusableSelector) || [])];
    focusable()[0]?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { onCloseRef.current?.(); return; }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={modalRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal__header"><h2 id={titleId}>{title}</h2><IconButton label="Sulge" onClick={onClose}><X size={20} /></IconButton></div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
