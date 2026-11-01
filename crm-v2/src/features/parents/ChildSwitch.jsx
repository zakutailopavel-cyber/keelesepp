import './childSwitch.css';

// Several children: a clear switch by name. One child (or none): nothing to choose, nothing shown.
// `people` from groupStudentPeople: one person even with several cards. `marks[key]` adds a quiet line under the name.
export const childKeyOf = (person) => person?.personKey || person?.id || '';

export default function ChildSwitch({ people = [], value = '', onChange, marks = {}, label = 'Laps · ребёнок' }) {
  if (people.length < 2) return null;
  return <div className="child-switch" role="tablist" aria-label={label}>
    {people.map((person) => {
      const key = childKeyOf(person);
      return <button key={key} type="button" role="tab" aria-selected={value === key} className={value === key ? 'is-active' : ''} onClick={() => onChange(key)}>
        <strong>{String(person.name || '').trim().split(/\s+/)[0] || 'Laps'}</strong>
        {marks[key] ? <small>{marks[key]}</small> : null}
      </button>;
    })}
  </div>;
}
