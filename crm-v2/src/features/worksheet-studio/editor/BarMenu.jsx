import { useState } from 'react';
import { FloatingPortal, autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { ChevronDown } from 'lucide-react';

/**
 * A button on the block's dark bar that opens a small menu under it (Floating UI: flips and shifts to stay on the
 * screen, Esc or a click elsewhere closes it). The menu is drawn in a portal, so the sheet's zoom does not shrink it;
 * React events still bubble to the bar, which keeps them away from the card (no select, no drag).
 * It stays hidden until its place is computed, so it never flashes in the top-left corner first.
 * `children` may be a function that gets `close`.
 */
export default function BarMenu({ label = '', icon = null, title = '', ariaLabel = '', onOpen, className = '', children }) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: (next) => { setOpen(next); if (next) onOpen?.(); },
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: 'menu' })]);
  const { setReference, setFloating } = refs;
  const close = () => setOpen(false);
  return (
    <>
      <button type="button" ref={setReference} title={title || label} aria-label={ariaLabel || undefined} className={`ws-bar-btn ${open ? 'is-open' : ''}`} {...getReferenceProps()}>
        {icon}{label ? <span>{label}</span> : null}<ChevronDown className="ws-caret" aria-hidden="true" />
      </button>
      {open ? (
        <FloatingPortal>
          <div ref={setFloating} style={{ ...floatingStyles, opacity: isPositioned ? 1 : 0 }} className={`ws-barmenu ${className}`} {...getFloatingProps()}>
            {typeof children === 'function' ? children(close) : children}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
