import './subjectSwitcher.css';
// „Kõik · Eesti keel · Matemaatika”: shown only when there is more than one subject
export default function SubjectSwitcher({ subjects = [], value = '', onChange, label = 'Õppeaine' }) {
  if (subjects.length < 2) return null;
  return (
    <div className="subject-switcher" role="tablist" aria-label={label}>
      {['', ...subjects].map((subject) => (
        <button key={subject || 'all'} type="button" role="tab" aria-selected={value === subject} className={value === subject ? 'is-active' : ''} onClick={() => onChange(subject)}>
          {subject || 'Kõik'}
        </button>
      ))}
    </div>
  );
}
