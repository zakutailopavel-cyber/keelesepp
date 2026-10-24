import { Select } from '../../components/ui/index.js';
import { findDirection, levelOptions, subjectOptions } from './studyDirections.js';
import { useStudyDirections } from './useStudyDirections.js';

// a subject picked from the school's „Õppesuunad” (Seaded → Õppesuunad); a value already on the card that the list
// does not know stays selectable, so old data is never lost
export default function SubjectSelect({ label = 'Õppeaine', value = '', onChange, directions, placeholder = 'Vali õppesuund', ...props }) {
  const loaded = useStudyDirections();
  const list = directions || loaded;
  const options = subjectOptions(list, value ? [value] : []);
  const selected = findDirection(value, list)?.name || value;
  return (
    <Select label={label} value={selected} onChange={onChange} {...props}>
      <option value="">{placeholder}</option>
      {options.map((name) => <option key={name} value={name}>{name}{findDirection(name, list) ? '' : ' (pole loendis)'}</option>)}
    </Select>
  );
}

// the levels of the chosen direction (A1–C1, 1.–12. klass …)
export function LevelSelect({ label, subject, value = '', onChange, directions, ...props }) {
  const loaded = useStudyDirections();
  const list = directions || loaded;
  return (
    <Select label={label} value={value} onChange={onChange} {...props}>
      {levelOptions(subject, list, value).map((level) => <option key={level || 'none'} value={level}>{level || 'Määramata'}</option>)}
    </Select>
  );
}
