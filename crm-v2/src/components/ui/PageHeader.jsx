// compact: a smaller title for work pages where the list below matters more than the heading
export default function PageHeader({ eyebrow, title, description, actions, compact = false }) {
  return (
    <header className={compact ? 'page-header page-header--compact' : 'page-header'}>
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
