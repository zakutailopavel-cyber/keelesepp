import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, EmptyState, ErrorState, LoadingState, Modal } from '../../components/ui/index.js';
import { studentsService } from '../../services/firebase/students.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import MergeCardsModal from './MergeCardsModal.jsx';
import { duplicateCandidates, maskEmail, maskPhone } from './duplicateCandidates.js';
import { tracksOf } from './subjects.js';
import './directions.css';

// „2026-09-29”, an ISO time or a Firestore Timestamp → „29.09.2026”
function shortDate(value) {
  if (!value) return '';
  const date = typeof value?.toDate === 'function' ? value.toDate()
    : typeof value?.seconds === 'number' ? new Date(value.seconds * 1000)
      : new Date(String(value).length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function accountLine(student) {
  const own = student.linkedUserId || student.studentUid || (student.linkedUserIds || []).length;
  if (own) return String(student.id || '').startsWith('self_') ? 'õpilase konto (ise registreeritud)' : 'õpilase konto';
  if (student.linkedParentId || (student.linkedParentIds || []).length) return 'ainult lapsevanema konto';
  return 'kontot pole';
}

const countText = (value) => (value === undefined ? '…' : value === null ? '?' : String(value));

// without a count service (older callers) the lesson / invoice rows are left out
function CardColumn({ student, counts, showCounts }) {
  const tracks = tracksOf({ ...student, active: true }).map((track) => [track.subject, track.teacher].filter(Boolean).join(' – ')).filter(Boolean).join(', ');
  const contacts = [maskEmail(student.email), maskPhone(student.phone), student.parentEmail ? `vanem ${maskEmail(student.parentEmail)}` : ''].filter(Boolean).join(' · ');
  const rows = [
    ['Loodud', shortDate(student.createdAt) || '—'],
    ['Konto', accountLine(student)],
    ['Aine ja õpetaja', tracks || '—'],
    ...(showCounts ? [['Tunnid', countText(counts?.lessons)], ['Arved', countText(counts?.invoices)]] : []),
    ...(contacts ? [['Kontakt', contacts]] : []),
  ];
  return (
    <div className="duplicate-pair__card">
      <span className="duplicate-pair__name">
        <Link to={`/students/${encodeURIComponent(student.id)}`}><strong>{student.name || student.id}</strong></Link>
        {student.active === false ? <Badge tone="neutral">Arhiveeritud</Badge> : <Badge tone="success">Aktiivne</Badge>}
      </span>
      <dl className="duplicate-pair__facts">{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    </div>
  );
}

// „Võimalikud topeltkaardid” (owner 2026-10-24, extended 2026-11-04): cards that are probably one person, side by
// side, with „Ava ühendamine” (the full merge with a preview, the pair preselected) and „Pole sama inimene” (the pair
// is not shown again — students.notDuplicateOf). Contacts are masked. Admins only.
export default function DuplicateCandidatesModal({ open, onClose, onMerged, service = studentsService, mergeService }) {
  const [state, setState] = useState({ loading: true, error: '', pairs: [] });
  const [counts, setCounts] = useState({});
  const asked = useRef(new Set());
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [merging, setMerging] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const result = await service.list({ pageSize: 500, exhaustive: true });
      setState({ loading: false, error: '', pairs: duplicateCandidates(result.items || []) });
    } catch (error) { setState({ loading: false, error: firebaseErrorMessage(error), pairs: [] }); }
  }, [service]);
  useEffect(() => { if (open) load(); }, [open, load]);

  // lesson and invoice counts of the shown cards (count queries; a card already counted is not asked again)
  useEffect(() => {
    if (typeof service.recordCounts !== 'function') return;
    const ids = [...new Set(state.pairs.flatMap((pair) => [pair.a.id, pair.b.id]))].filter((id) => !asked.current.has(id));
    ids.forEach((id) => {
      asked.current.add(id);
      service.recordCounts(id)
        .then((result) => { if (mounted.current) setCounts((current) => ({ ...current, [id]: result })); })
        .catch(() => { if (mounted.current) setCounts((current) => ({ ...current, [id]: { lessons: null, invoices: null } })); });
    });
  }, [state.pairs, service]);

  const showCounts = typeof service.recordCounts === 'function';

  const dismiss = async (pair) => {
    setBusy(`${pair.a.id}|${pair.b.id}`);
    try { await service.markNotDuplicate(pair.a.id, pair.b.id); setState((current) => ({ ...current, pairs: current.pairs.filter((item) => item !== pair) })); }
    catch (error) { setState((current) => ({ ...current, error: firebaseErrorMessage(error) })); }
    finally { setBusy(''); }
  };

  return (
    <>
      <Modal open={open && !merging} title="Võimalikud topeltkaardid" className="modal--enrollments" onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>Sulge</Button>}>
        <p className="form-hint">Kaardid, mis on tõenäoliselt sama inimene: sama nimi (ka teises kirjapildis, nt Maria / Mariia), või sarnane nimi ja sama konto / lapsevanem / telefon / e-post. Sama eesnimi ja eri perekonnanimi ilma muu tunnuseta siia ei tule, õed-vennad ka mitte. Ühel inimesel on üks kaart, aineid saab kaardil olla mitu. Kui paari pole loendis, ava kaart ja vajuta „Liida kaardid”.</p>
        {state.loading ? <LoadingState label="Otsin topeltkaarte…" /> : null}
        {state.error ? <ErrorState title="Viga" message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && !state.pairs.length ? <EmptyState title="Topeltkaarte ei leitud" description="Aktiivsete ja arhiveeritud kaartide seas pole sama inimese kahte kaarti." /> : null}
        <div className="enrollment-manager__list">{state.pairs.map((pair) => {
          const key = `${pair.a.id}|${pair.b.id}`;
          return <section className="enrollment-editor duplicate-pair" key={key}>
            <div className="enrollment-editor__title"><strong>{pair.a.name} / {pair.b.name}</strong><Badge tone={pair.confidence === 'high' ? 'danger' : 'warning'}>{pair.confidence === 'high' ? 'väga tõenäoline' : 'võimalik'}</Badge></div>
            <div className="duplicate-pair__cards"><CardColumn student={pair.a} counts={counts[pair.a.id]} showCounts={showCounts} /><CardColumn student={pair.b} counts={counts[pair.b.id]} showCounts={showCounts} /></div>
            <p className="form-hint">{pair.reasons.map((reason) => reason.label).join(' · ')}</p>
            <div className="enrollment-editor__actions">
              <Button variant="secondary" loading={busy === key} disabled={Boolean(busy)} onClick={() => dismiss(pair)}>Pole sama inimene</Button>
              <Button onClick={() => setMerging(pair)}>Ava ühendamine</Button>
            </div>
          </section>;
        })}</div>
      </Modal>
      {merging ? <MergeCardsModal open student={merging.a} initialSourceId={merging.b.id} students={service} {...(mergeService ? { service: mergeService } : {})}
        onClose={() => setMerging(null)}
        onMerged={(result) => { setMerging(null); onMerged?.(result); load(); }} /> : null}
    </>
  );
}
