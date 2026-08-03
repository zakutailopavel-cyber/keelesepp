export default function Select({ label, error, id, children, className = '', ...props }) {
  const selectId = id || props.name;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className={`field ${className}`}>
      {label ? <label className="field__label" htmlFor={selectId}>{label}</label> : null}
      <select id={selectId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props}>{children}</select>
      {error ? <span id={errorId} className="field__error">{error}</span> : null}
    </div>
  );
}
