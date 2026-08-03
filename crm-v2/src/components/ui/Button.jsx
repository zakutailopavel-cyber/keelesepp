export default function Button({ variant = 'primary', loading = false, disabled, children, type = 'button', ...props }) {
  return (
    <button type={type} className={`button button--${variant}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <span className="button__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
