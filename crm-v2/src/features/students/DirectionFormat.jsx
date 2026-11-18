import { Select } from '../../components/ui/index.js';
import { DIRECTION_FORMATS, formatLabel, formatOf } from './directionFormat.js';
import './directions.css';

// „Individuaalne / Grupp” (team 2026-11-18): the format of a study direction — a segmented control in the
// „Õppesuunad” window and a small badge wherever directions are listed
export function FormatSwitch({ name, value, onChange, disabled = false }) {
  const current = formatOf(value);
  return <fieldset className="direction-format-switch" disabled={disabled}>
    <legend>Vorm</legend>
    <div role="radiogroup" aria-label="Vorm">
      {DIRECTION_FORMATS.map((item) => <label key={item.value} className={current === item.value ? 'is-active' : ''}>
        <input type="radio" name={name} value={item.value} checked={current === item.value} onChange={() => onChange(item.value)} />
        {item.label}
      </label>)}
    </div>
  </fieldset>;
}

// inferred: the track has no stored format but the card is in a calendar group of that subject
export function FormatBadge({ format, inferred = false }) {
  const group = formatOf(format) === 'group';
  return <span className={`direction-format-badge${group ? ' is-group' : ''}`} data-format={formatOf(format)} title={inferred ? 'Kalendrigrupi järgi (salvestamata)' : undefined}>
    {formatLabel(format)}{inferred ? '?' : ''}
  </span>;
}

// the calendar group a group direction may name (optional): the groups of the same subject first
export function GroupLinkSelect({ value, groups = [], subject = '', onChange, disabled = false }) {
  const same = (group) => String(group.subject || 'Eesti keel').toLocaleLowerCase('et') === String(subject || '').toLocaleLowerCase('et');
  const list = [...groups.filter(same), ...groups.filter((group) => !same(group))];
  return <Select label="Kalendrigrupp (valikuline)" value={value || ''} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
    <option value="">Ei seo gruppi</option>
    {list.map((group) => <option key={group.id} value={group.id}>{group.name}{group.subject ? ` · ${group.subject}` : ''}</option>)}
    {value && !groups.some((group) => group.id === value) ? <option value={value}>Grupp {value} (pole nimekirjas)</option> : null}
  </Select>;
}
