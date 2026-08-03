export default function Select({ label, error, id, children, className = '', ...props }) {
  const selectId = id || props.name;
  return (
    <label className={`field ${className}`} htmlFor={selectId}>
      {label ? <span className="field__label">{label}</span> : null}
      <select id={selectId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} {...props}>{children}</select>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
