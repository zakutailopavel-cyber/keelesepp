import { useId } from 'react';
import { FieldLabel } from './FieldHelp.jsx';

// `help` (+ optional `helpExample`) adds the „?” field help next to the label (FieldHelp.jsx)
export default function Select({ label, error, id, children, className = '', help, helpExample, ...props }) {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className={`field ${className}`}>
      <FieldLabel htmlFor={selectId} label={label} help={help} helpExample={helpExample} />
      <select id={selectId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props}>{children}</select>
      {error ? <span id={errorId} className="field__error" role="alert">{error}</span> : null}
    </div>
  );
}
