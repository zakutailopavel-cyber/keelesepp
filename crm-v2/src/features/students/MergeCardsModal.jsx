import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, ErrorState, LoadingState, Modal } from '../../components/ui/index.js';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { studentAccess, studentsService } from '../../services/firebase/students.js';
import { nameKey, nameLikeness } from './duplicateCandidates.js';
import './directions.css';

const KIND = { learner: 'õppetöö', finance: 'finantsid', schedule: 'tunniplaan' };
const COLLECTION_LABELS = {
  lessons: 'Tunnid', schedule: 'Tunniplaan (ka korduvad tunnid)', groups: 'Grupid', homework: 'Kodutööd',
  worksheetAssignments: 'Töölehed', exerciseResults: 'Harjutuste tulemused', studentWorksheetDrafts: 'Töölehtede mustandid',
  invoices: 'Arved', payments: 'Maksed', payerCredits: 'Ettemaksed', creditNotes: 'Kreeditarved', refunds: 'Tagastused',
  studentPackages: 'Tunnipaketid', packageLedger: 'Paketi liikumised', studentTariffAssignments: 'Tariifid', paymentLineAllocations: 'Maksete jaotus',
  lessonChangeRequests: 'Tunni muutmise palved', lessonNotes: 'Tunnimärkmed', messages: 'Sõnumid', liveLessonInvitations: 'Tunnikutsed',
  lessonRecordings: 'Salvestused', lessonSummaries: 'Tunni kokkuvõtted', petProfiles: 'Lemmik', studentWords: 'Sõnavara',
  curriculumProgressEvents: 'Õppeedenemine', roomBookings: 'Ruumibroneeringud', liveClassrooms: 'Live Classroom', cashLedger: 'Kassa',
};
const label = (collection) => COLLECTION_LABELS[collection] || collection;
const euro = (cents) => `${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')} €`;

/**
 * „Liida kaardid” (owner 2026-10-24): two cards of one child become one. The administrator picks the other card, which
 * card stays and which name; the server preview lists what moves (per kind), the documents, the price, the subjects,
 * the parents and the conflicts; nothing is written before „Liida kaardid” with the check mark. Admins only.
 */
export default function MergeCardsModal({ student, open, onClose, onMerged, initialSourceId = '', service = accountApprovalsService, students = studentsService }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [otherId, setOtherId] = useState(initialSourceId);
  const [keepThis, setKeepThis] = useState(true);
  const [keepName, setKeepName] = useState('');
  const [preview, setPreview] = useState(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || list) return;
    students.list({ pageSize: 500, exhaustive: true }).then((r) => setList(r.items || [])).catch((e) => setError(e.message));
  }, [open, list, students]);

  const keepId = keepThis ? student.id : otherId;
  const sourceId = keepThis ? otherId : student.id;

  // a new preview whenever the pair, the kept card or the name changes
  useEffect(() => {
    if (!open || !otherId) return undefined;
    let alive = true;
    setBusy(true); setError(''); setChecked(false);
    service.mergeStudents({ keepId, sourceId, ...(keepName ? { keepName } : {}) })
      .then((result) => { if (alive) setPreview(result); })
      .catch((e) => { if (alive) { setPreview(null); setError(e.message); } })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, [open, otherId, keepId, sourceId, keepName, service]);

  const candidates = useMemo(() => (list || [])
    .filter((s) => s.id !== student.id && !s.mergedInto && !s.mergedIntoStudentId)
    .map((s) => ({ ...s, like: nameLikeness(student.name, s.name) }))
    .filter((s) => (query ? nameKey(s.name).includes(nameKey(query)) : s.like > 0 || s.id === otherId))
    .sort((a, b) => b.like - a.like || String(a.name).localeCompare(String(b.name), 'et'))
    .slice(0, 20), [list, query, student, otherId]);

  const other = (list || []).find((s) => s.id === otherId);
  const merge = async () => {
    setBusy(true); setError('');
    try {
      const result = await service.mergeStudents({ keepId, sourceId, ...(keepName ? { keepName } : {}), apply: true, confirmed: true });
      onMerged?.({ ...result, keepId, sourceId });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const names = preview?.names || [];
  const chosenName = keepName || preview?.keepName || '';
  const kinds = Object.entries(preview?.totals || {});

  return (
    <Modal open={open} title={`Liida kaardid: ${student.name}`} className="modal--enrollments" onClose={() => !busy && onClose()}
      footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button variant="danger" disabled={!preview || busy || !checked} loading={busy && Boolean(preview)} onClick={merge}>Liida kaardid</Button></>}>
      <div className="assignment-form merge-cards">
        <p className="form-hint">Üks laps = üks kaart. Kõik teise kaardi andmed (tunnid, korduvad tunnid, grupid, tööd, arved ja maksed, hinnad, sobivad ajad, kontod, lapsevanemad, õppesuunad) tõstetakse alles jäävale kaardile. Teist kaarti ei kustutata: see arhiveeritakse ja jääb viitama uuele kaardile.</p>
        {error ? <ErrorState title="Viga" message={error} /> : null}
        {!initialSourceId ? (!list ? <LoadingState label="Laen kaarte…" /> : (
          <>
            <div className="search-field"><input aria-label="Otsi kaarti" placeholder="Otsi nime järgi (näitab sarnaseid nimesid)" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="assignment-students" role="radiogroup" aria-label="Teine kaart">
              {candidates.map((s) => (
                <label key={s.id} className={s.id === otherId ? 'is-selected' : ''}>
                  <input type="radio" name="merge-source" checked={s.id === otherId} onChange={() => { setOtherId(s.id); setKeepName(''); setPreview(null); }} />
                  <span><strong>{s.name}</strong><small>{[s.teacher, s.subject, s.level, s.parentName].filter(Boolean).join(' · ') || s.id}</small>
                    <small>{studentAccess(s) === 'student' ? '✓ õpilase konto' : studentAccess(s) === 'parent' ? 'lapsevanema konto' : 'kontot pole'}{s.active === false ? ' · arhiveeritud' : ''}</small></span>
                </label>
              ))}
              {!candidates.length ? <p className="form-hint">Sarnaseid nimesid ei leitud. Otsi nime järgi.</p> : null}
            </div>
          </>
        )) : null}
        {otherId ? (
          <fieldset className="merge-cards__choice">
            <legend>Kumb kaart jääb alles?</legend>
            <label><input type="radio" name="merge-keep" checked={keepThis} onChange={() => { setKeepThis(true); setKeepName(''); }} /> {student.name} <small>(see kaart)</small></label>
            <label><input type="radio" name="merge-keep" checked={!keepThis} onChange={() => { setKeepThis(false); setKeepName(''); }} /> {other?.name || preview?.source?.name || 'teine kaart'} <small>(teine kaart)</small></label>
          </fieldset>
        ) : null}
        {busy && !preview ? <LoadingState label="Kontrollin, mida liita…" /> : null}
        {preview ? (
          <div role="status" className="merge-cards__preview">
            {names.length > 1 ? <fieldset className="merge-cards__choice"><legend>Nimi pärast liitmist</legend>{names.map((name) => <label key={name}><input type="radio" name="merge-name" checked={chosenName === name} onChange={() => setKeepName(name)} /> {name}</label>)}<small>Teine nimi jääb otsinguks alles.</small></fieldset> : null}
            {preview.conflicts?.length ? <div className="merge-cards__conflicts"><b>Vaata üle:</b><ul>{preview.conflicts.map((c) => <li key={c.code}>{c.label}</li>)}</ul></div> : null}
            <b>Alles jäävale kaardile tuleb:</b>
            <ul>
              {kinds.map(([kind, count]) => <li key={kind}><Badge tone={kind === 'finance' ? 'warning' : 'info'}>{KIND[kind] || kind}</Badge> {count} kirjet</li>)}
              {(preview.move || []).map((m) => <li key={`${m.collection}:${m.field}`}>{label(m.collection)}: {m.count}{m.kind === 'finance' ? ' (summad ja numbrid ei muutu)' : ''}</li>)}
              {(preview.documents || []).map((d) => <li key={d.collection}>{d.label}: {d.action === 'copy' ? 'kopeeritakse' : 'jääb alles jääva kaardi oma'}</li>)}
              {preview.price?.action === 'addSubjectPrice' ? <li>Hind: {preview.price.subject} {euro(preview.price.sourceCents)} lisatakse aine hinnaks</li> : null}
              {(preview.addedSubjects || []).map((track) => <li key={`subject:${track.subject}:${track.teacher}`}>uus õppesuund: <b>{track.subject}</b>{track.teacher ? ` — ${track.teacher}` : ''}{track.level ? ` · ${track.level}` : ''}</li>)}
              {preview.source?.accounts?.length ? <li>õpilase konto ({preview.source.accounts.length})</li> : null}
              {preview.accountLinks ? <li>kontod, kus kaart on kirjas: {preview.accountLinks}</li> : null}
              {(preview.subcollections || []).map((s) => <li key={s.collection}>{s.collection}: {s.count}</li>)}
              {!(preview.move || []).length && !(preview.documents || []).length && !preview.source?.accounts?.length && !(preview.addedSubjects || []).length ? <li>teisel kaardil pole midagi tõsta</li> : null}
            </ul>
            {(preview.subjects || []).length > 1 ? <p className="form-hint">Pärast liitmist on kaardil õppesuunad: {preview.subjects.map((track) => track.subject + (track.teacher ? ` (${track.teacher})` : '')).join(', ')}. Teise kaardi tunnid ja tööd jäävad oma õppesuuna alla.</p> : null}
            {(preview.parents?.accounts?.length || preview.parents?.contacts?.length) ? <p className="form-hint">Lapsevanemad pärast liitmist: {preview.parents.accounts.length} kontoga{preview.parents.contacts.length ? `, kontaktid: ${preview.parents.contacts.map((c) => c.name || c.email || c.phone).join(', ')}` : ''}.</p> : null}
            {(preview.skipped || []).length ? <p className="form-hint">Jääb tõstmata: {preview.skipped.map((m) => `${label(m.collection)} (${m.reason})`).join(', ')}</p> : null}
            <label className="merge-cards__confirm"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} /> Kontrollisin eelvaadet. Liida „{preview.source?.name}” kaardiga „{chosenName || preview.keep?.name}”.</label>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
