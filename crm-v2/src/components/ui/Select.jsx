import { useId } from 'react';

export default function Select({ label, error, id, children, className = '', ...props }) {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className={`field ${className}`}>
      {label ? <label className="field__label" htmlFor={selectId}>{label}</label> : null}
      <select id={selectId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props}>{children}</select>
      {error ? <span id={errorId} className="field__error" role="alert">{error}</span> : null}
    </div>
  );
}
