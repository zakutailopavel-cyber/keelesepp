import { Palette, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { TONE_NAMES, teacherTone } from './calendarGrid.js';

// „Värvid”: the viewer's own colour of each teacher in this calendar (owner 2026-10-29). A personal choice is stored on
// the viewer's account (users/{uid}.calendarColors) and wins over the administrator's choice and the automatic colour.
export default function CalendarColors({ people = [], tones = null, personal = {}, onChange, saving = false }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState('');
  const own = personal || {};
  const hasOwn = Object.keys(own).length > 0;
  const choose = (id, tone) => {
    const next = { ...own };
    if (tone == null) delete next[id];
    else next[id] = tone;
    setEditing('');
    onChange?.(next);
  };
  return (
    <div className="cal2-colors">
      <Button variant={open ? 'primary' : 'secondary'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Palette size={17} /> Värvid
      </Button>
      {open ? (
        <div className="cal2-colors__panel" role="dialog" aria-label="Õpetajate värvid">
          <div className="cal2-colors__head">
            <strong>Õpetajate värvid</strong>
            <button type="button" className="cal2-colors__close" aria-label="Sulge" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <p className="cal2-colors__hint">Valik kehtib ainult sinu kalendris.</p>
          {people.length ? (
            <ul className="cal2-colors__list">
              {people.map((person) => {
                const tone = teacherTone(person.id, tones);
                const mine = person.id in own;
                return (
                  <li key={person.id}>
                    <button type="button" className="cal2-colors__row" aria-expanded={editing === person.id} onClick={() => setEditing(editing === person.id ? '' : person.id)}>
                      <i className={`cal2-colors__swatch tone-${tone}`} aria-hidden="true" />
                      <span>{person.name}</span>
                      <small>{mine ? 'minu valik' : TONE_NAMES[tone]}</small>
                    </button>
                    {editing === person.id ? (
                      <div className="cal2-colors__palette" role="group" aria-label={`${person.name} värv`}>
                        {TONE_NAMES.map((name, index) => (
                          <button type="button" key={name} className={`cal2-colors__swatch tone-${index} ${index === tone ? 'is-current' : ''}`} aria-label={name} aria-pressed={index === tone} title={name} disabled={saving} onClick={() => choose(person.id, index)} />
                        ))}
                        {mine ? <button type="button" className="cal2-colors__reset-one" disabled={saving} onClick={() => choose(person.id, null)}>Vaikimisi</button> : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : <p className="cal2-colors__hint">Kalendris pole veel õpetajaid.</p>}
          <Button variant="secondary" className="cal2-colors__reset" disabled={!hasOwn || saving} onClick={() => { setEditing(''); onChange?.({}); }}>
            <RotateCcw size={15} /> Taasta vaikimisi
          </Button>
        </div>
      ) : null}
    </div>
  );
}
