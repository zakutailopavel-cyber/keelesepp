import './loadingState.css';

// One calm loading look for the whole CRM.
// - default: centred block (spinner + label) for a page or a card body;
// - `inline`: one small muted line for small cards, panels and hints — pass the old hint class via `className`
//   (form-hint, ed-hint …) so the text keeps its place and size in the card layout;
// - `page`: full-height centred view for public pages without the app shell (parents' links), so nobody sees a blank
//   screen while the page code loads.
// The spinner is decorative (aria-hidden); the label is announced politely. prefers-reduced-motion stops the spin.
export default function LoadingState({ label = 'Laen andmeid…', inline = false, page = false, className = '' }) {
  if (inline) {
    return <p className={['state-inline', className].filter(Boolean).join(' ')} role="status" aria-live="polite"><span className="state-spinner state-spinner--sm" aria-hidden="true" />{label}</p>;
  }
  const view = <div className={['state-view', 'state-view--loading', className].filter(Boolean).join(' ')} role="status" aria-live="polite"><span className="state-spinner" aria-hidden="true" /><strong>{label}</strong></div>;
  return page ? <div className="standalone-state">{view}</div> : view;
}
