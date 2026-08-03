export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`field ${className}`} htmlFor={inputId}>
      {label ? <span className="field__label">{label}</span> : null}
      <input id={inputId} className={error ? 'is-invalid' : ''} aria-invalid={Boolean(error)} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
