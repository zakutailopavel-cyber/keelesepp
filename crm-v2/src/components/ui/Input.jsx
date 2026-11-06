import { useId } from 'react';
import { FieldLabel } from './FieldHelp.jsx';

// `help` (+ optional `helpExample`) adds the „?” field help next to the label (FieldHelp.jsx)
export default function Input({ label, error, id, className = '', help, helpExample, ...props }) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`field ${className}`}>
      <FieldLabel htmlFor={inputId} label={label} help={help} helpExample={helpExample} />
      <input id={inputId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props} />
      {error ? <span id={errorId} className="field__error" role="alert">{error}</span> : null}
    </div>
  );
}
