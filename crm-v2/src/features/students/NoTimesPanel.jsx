import { Clock3, Copy, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService, studentAvailabilityService, studentsService, websiteLeadsService } from '../../services/firebase/index.js';
import { ajadMessage, contactsText, studentsWithoutTimes } from './noTimes.js';

/** Õpilased → „Ilma ajata”: who still needs to mark „Sobivad ajad”, with the parent's contacts and the /ajad link. */
export default function NoTimesPanel({ teacherUid = '', repositories = {}, origin = globalThis.location?.origin || 'https://crm.epkoolitus.ee', onClose }) {
  const { students = studentsService, times = studentAvailabilityService, leads = websiteLeadsService, lessons = lessonsService } = repositories;
  const state = useAsyncData(async () => {
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const [cards, own, enquiries, journal] = await Promise.all([
      settle(() => students.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherUid ? { scopeTeacherUid: teacherUid } : {}) }).then((result) => result.items || [])),
      settle(() => times.list(null)), settle(() => leads.list()), settle(() => lessons.listForCalendar(teacherUid ? { teacherUid } : {})),
    ]);
    return studentsWithoutTimes({ students: cards, own, leads: enquiries, lessons: journal });
  }, [students, times, leads, lessons, teacherUid]);
  const [copied, setCopied] = useState('');
  const link = `${origin}/ajad`;
  const copy = async (what, text) => { try { await navigator.clipboard.writeText(text); setCopied(what); } catch { globalThis.prompt?.('Kopeeri', text); } };
  const rows = state.data || [];
  return (
    <Card className="no-times" role="region" aria-label="Ilma ajata">
      <div className="section-heading"><div><span className="eyebrow">Planeerija jaoks</span><h2>Ilma ajata ({state.loading ? '…' : rows.length})</h2></div><Clock3 size={20} aria-hidden="true" /></div>
      <p className="form-hint">Aktiivsed õpilased, kellel pole „Sobivaid aegu” ega /ajad vastust. Saada neile link — kui nad vastavad, ilmuvad ajad kaardile ja Planeerija saab nad paigutada.</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={() => copy('link', link)}><Copy size={15} /> {copied === 'link' ? 'Link kopeeritud' : 'Kopeeri /ajad link'}</Button>
        <Button variant="secondary" onClick={() => copy('message', ajadMessage(link))}><Copy size={15} /> {copied === 'message' ? 'Sõnum kopeeritud' : 'Kopeeri sõnum (ET + RU)'}</Button>
        <Button variant="secondary" disabled={!rows.length} onClick={() => copy('list', contactsText(rows))}><Copy size={15} /> {copied === 'list' ? 'Nimekiri kopeeritud' : 'Kopeeri nimekiri kontaktidega'}</Button>
        {onClose ? <Button variant="secondary" onClick={onClose}>Sulge</Button> : null}
      </div>
      {state.loading ? <LoadingState label="Otsin õpilasi ilma ajata…" /> : rows.length ? <div className="group-contacts__list">{rows.map((row) => (
        <div className="no-times__row" key={row.id}>
          <span className="group-contacts__who"><strong><Link to={`/students/${row.id}`}>{row.name}</Link></strong><small>{[row.teacher, row.level, row.lastLesson ? `viimane tund ${row.lastLesson}` : 'tunde pole olnud'].filter(Boolean).join(' · ')}</small></span>
          <span className="group-contacts__contact">{row.parentName ? <small>Vanem: {row.parentName}</small> : null}{row.phone ? <a href={`tel:${row.phone.replace(/\s/g, '')}`}><Phone size={13} /> {row.phone}</a> : null}{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : null}{!row.phone && !row.email ? <small>kontakt puudub</small> : null}</span>
        </div>
      ))}</div> : <EmptyState title="Kõigil on ajad olemas" description="Planeerija saab kõik õpilased paigutada." />}
    </Card>
  );
}
