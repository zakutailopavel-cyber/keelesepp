export default function Button({ variant = 'primary', loading = false, disabled, children, ...props }) {
  return (
    <button className={`button button--${variant}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="button__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
