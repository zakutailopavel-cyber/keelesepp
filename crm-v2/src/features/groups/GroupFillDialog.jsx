import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, EmptyState, Input, LoadingState, Modal, Select } from '../../components/ui/index.js';
import { lessonsService, scheduleService, studentAvailabilityService, websiteLeadsService } from '../../services/firebase/index.js';
import { groupCalendarEvents, toIsoDate } from '../calendar/calendarView.js';
import { learnedTimes, withLearnedTimes } from '../calendar/studentTimesModel.js';
import { leadStudentIds, timesFromLeads, withLeadTimes } from '../calendar/leadTimes.js';
import { AUDIENCES, capacityOf, freeSeats, groupCandidates } from './groupFill.js';

const FIT = { good: ['success', 'sobib hästi'], ok: ['info', 'sobib'], weak: ['warning', 'lepi kokku'] };

/**
 * „Täida grupp”: the group's seats and age group (saved on the group) and the students and website enquiries that fit
 * it, best first, with the reasons. „Lisa” is the normal add-to-group action; enquiries are called by the admin.
 */
export default function GroupFillDialog({ group, groups = [], students = [], saving = '', onAdd, onSaveSettings, onClose, repositories = {} }) {
  const { schedule = scheduleService, lessons = lessonsService, times = studentAvailabilityService, leads = websiteLeadsService } = repositories;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ audience: group.audience || '', capacity: String(capacityOf(group)), ageFrom: group.ageFrom || '', ageTo: group.ageTo || '' });

  useEffect(() => {
    let live = true;
    Promise.all([
      schedule.list({}).catch(() => []),
      lessons.listForCalendar({}).catch(() => []),
      times.list(null).catch(() => []),
      leads.list().catch(() => []),
    ]).then(([events, journal, own, enquiries]) => {
      if (!live) return;
      const today = toIsoDate();
      const ownTimes = withLeadTimes(new Map(own.map((entry) => [entry.studentId || entry.id, entry])), timesFromLeads(enquiries, students));
      // an /ajad answer of a student who already has a card is shown on the card, not again as an enquiry
      const newPeople = enquiries.filter((lead) => lead.source !== 'availability' || !leadStudentIds(lead, students).length);
      setData({ events: [...events, ...groupCalendarEvents(groups)], studentTimes: withLearnedTimes(ownTimes, learnedTimes({ events, lessons: journal, today })), leads: newPeople, today });
    }).catch((loadError) => live && setError(loadError.message || 'Andmeid ei saanud laadida.'));
    return () => { live = false; };
  }, [schedule, lessons, times, leads, groups, students]);

  const shown = { ...group, ...settings, capacity: Number(settings.capacity) || undefined };
  const result = data ? groupCandidates({ group: shown, students, leads: data.leads, studentTimes: data.studentTimes, events: data.events, today: data.today }) : null;
  const free = freeSeats(shown);
  const changed = settings.audience !== (group.audience || '') || Number(settings.capacity) !== capacityOf(group) || String(settings.ageFrom) !== String(group.ageFrom || '') || String(settings.ageTo) !== String(group.ageTo || '');
  const row = (item, action) => <div className="group-fill__row" key={item.id}>
    <span><strong>{item.name}</strong><small>{item.reasons.join(' · ')}</small></span>
    <Badge tone={FIT[item.fit][0]}>{FIT[item.fit][1]}</Badge>
    {action}
  </div>;

  return <Modal open title={`Täida grupp: ${group.name}`} onClose={() => !saving && onClose()} className="modal--group-fill" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={onClose}>Valmis</Button>}>
    <div className="group-fill__settings form-grid">
      <Select id="group-fill-audience" label="Sihtrühm" value={settings.audience} onChange={(event) => setSettings({ ...settings, audience: event.target.value, ...(event.target.value === 'preschool' && !settings.ageFrom ? { ageFrom: '5', ageTo: '7', capacity: '6' } : {}) })}>
        <option value="">Kõik</option>{Object.entries(AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </Select>
      <Input id="group-fill-capacity" label="Kohti" type="number" min="1" max="30" value={settings.capacity} onChange={(event) => setSettings({ ...settings, capacity: event.target.value })} />
      {settings.audience && settings.audience !== 'adult' ? <>
        <Input id="group-fill-age-from" label="Vanus alates" type="number" min="3" max="18" value={settings.ageFrom} onChange={(event) => setSettings({ ...settings, ageFrom: event.target.value })} />
        <Input id="group-fill-age-to" label="Vanus kuni" type="number" min="3" max="18" value={settings.ageTo} onChange={(event) => setSettings({ ...settings, ageTo: event.target.value })} />
      </> : null}
      {changed ? <Button loading={saving === 'settings'} onClick={() => onSaveSettings(settings)}>Salvesta</Button> : null}
    </div>
    <p className="form-hint">{group.students.length}/{capacityOf(shown)} kohta täidetud · vabu kohti <b>{free}</b>{group.lessons.length ? '' : ' · lisa grupile tunniaeg, siis arvestatakse ka aegu'}</p>
    {error ? <p className="action-error" role="alert">{error}</p> : null}
    {!result ? <LoadingState label="Otsin sobivaid õpilasi…" /> : <>
      <h3 className="group-fill__heading">Õpilased ({result.students.length})</h3>
      {result.students.length ? <div className="group-fill__list">{result.students.slice(0, 25).map((item) => row(item, <Button variant="secondary" disabled={!free || Boolean(saving)} loading={saving === `student:${item.id}`} onClick={() => onAdd(item.id)}><UserPlus size={15} /> Lisa</Button>))}</div>
        : <EmptyState title="Sobivaid õpilasi ei leitud" description="Sama aine, sihtrühm ja lähedane tase puuduvad." />}
      <h3 className="group-fill__heading">Huvilised veebilehelt ({result.leads.length})</h3>
      {result.leads.length ? <div className="group-fill__list">{result.leads.slice(0, 15).map((item) => row(item, <Link className="button button--secondary" to="/leads">{item.contact || 'Ava'}</Link>))}</div>
        : <p className="form-hint">Sobivaid päringuid ei ole.</p>}
    </>}
  </Modal>;
}
