// A small text field laid over an element of the sheet: the source text is edited without touching the DOM React
// draws (the gaps' inputs, the scheme boxes…). Enter or a click away saves, Esc cancels, Shift+Enter = new line when
// `multiline`. Returns a function that closes it without saving.
export function openFloatingEditor({ anchor, value, multiline = false, label = 'Muuda teksti', onCommit }) {
  const doc = anchor.ownerDocument;
  const rect = anchor.getBoundingClientRect();
  const field = doc.createElement('textarea');
  field.className = 'ws-float-edit';
  field.value = value;
  field.setAttribute('aria-label', label);
  field.rows = multiline ? Math.min(6, Math.max(2, value.split('\n').length)) : 1;
  const view = doc.defaultView;
  Object.assign(field.style, {
    position: 'absolute',
    left: `${rect.left + (view?.scrollX || 0)}px`,
    top: `${rect.top + (view?.scrollY || 0)}px`,
    width: `${Math.max(rect.width, 160)}px`,
    minHeight: `${Math.max(rect.height, 30)}px`,
    zIndex: 1500,
  });
  doc.body.appendChild(field);
  const grow = () => { field.style.height = 'auto'; field.style.height = `${field.scrollHeight + 2}px`; };
  grow();
  field.focus();
  field.select();
  let done = false;
  const close = (save) => {
    if (done) return;
    done = true;
    field.removeEventListener('keydown', onKey);
    field.removeEventListener('blur', onBlur);
    field.removeEventListener('input', grow);
    const next = field.value;
    field.remove();
    if (save && next !== value) onCommit(next);
  };
  const onKey = (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(false); }
    if (e.key === 'Enter' && !(multiline && e.shiftKey)) { e.preventDefault(); close(true); }
  };
  const onBlur = () => close(true);
  field.addEventListener('keydown', onKey);
  field.addEventListener('blur', onBlur);
  field.addEventListener('input', grow);
  return () => close(false);
}
