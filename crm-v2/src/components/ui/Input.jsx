import { useId } from 'react';

export default function Input({ label, error, id, className = '', ...props }) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`field ${className}`}>
      {label ? <label className="field__label" htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props} />
      {error ? <span id={errorId} className="field__error" role="alert">{error}</span> : null}
    </div>
  );
}
