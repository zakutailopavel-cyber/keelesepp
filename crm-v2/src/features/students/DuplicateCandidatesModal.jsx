import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, EmptyState, ErrorState, LoadingState, Modal } from '../../components/ui/index.js';
import { studentsService } from '../../services/firebase/students.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import MergeCardsModal from './MergeCardsModal.jsx';
import { duplicateCandidates } from './duplicateCandidates.js';
import { tracksOf } from './subjects.js';
import './directions.css';

function CardLine({ student }) {
  const tracks = tracksOf(student).map((track) => [track.subject, track.teacher].filter(Boolean).join(' – ')).join(', ');
  return <span className="duplicate-pair__card"><Link to={`/students/${encodeURIComponent(student.id)}`}><strong>{student.name || student.id}</strong></Link><small>{[tracks, student.parentName ? `vanem: ${student.parentName}` : '', student.grade ? `klass ${student.grade}` : ''].filter(Boolean).join(' · ') || '—'}</small></span>;
}

// „Võimalikud duplikaadid” (owner 2026-10-24): cards that are probably one child, with „Liida” (the full merge with
// a preview) and „Ei ole duplikaat” (two children with the same name — the pair is not shown again). Admins only.
export default function DuplicateCandidatesModal({ open, onClose, onMerged, service = studentsService, mergeService }) {
  const [state, setState] = useState({ loading: true, error: '', pairs: [] });
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

  const dismiss = async (pair) => {
    setBusy(`${pair.a.id}|${pair.b.id}`);
    try { await service.markNotDuplicate(pair.a.id, pair.b.id); setState((current) => ({ ...current, pairs: current.pairs.filter((item) => item !== pair) })); }
    catch (error) { setState((current) => ({ ...current, error: firebaseErrorMessage(error) })); }
    finally { setBusy(''); }
  };

  return (
    <>
      <Modal open={open && !merging} title="Võimalikud duplikaadid" className="modal--enrollments" onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>Sulge</Button>}>
        <p className="form-hint">Kaardid, mis on tõenäoliselt sama laps: sama nimi, või sarnane nimi ja sama lapsevanem / telefon / e-post. Õed-vennad (sama vanem, eri eesnimi) siia ei tule. Kui paari pole loendis, ava kaart ja vajuta „Liida kaardid”.</p>
        {state.loading ? <LoadingState label="Otsin duplikaate…" /> : null}
        {state.error ? <ErrorState title="Viga" message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && !state.pairs.length ? <EmptyState title="Duplikaate ei leitud" description="Aktiivsete kaartide seas pole sama lapse kahte kaarti." /> : null}
        <div className="enrollment-manager__list">{state.pairs.map((pair) => {
          const key = `${pair.a.id}|${pair.b.id}`;
          return <section className="enrollment-editor duplicate-pair" key={key}>
            <div className="enrollment-editor__title"><strong>{pair.a.name} / {pair.b.name}</strong><Badge tone={pair.confidence === 'high' ? 'danger' : 'warning'}>{pair.confidence === 'high' ? 'väga tõenäoline' : 'võimalik'}</Badge></div>
            <div className="duplicate-pair__cards"><CardLine student={pair.a} /><CardLine student={pair.b} /></div>
            <p className="form-hint">{pair.reasons.map((reason) => reason.label).join(' · ')}</p>
            <div className="enrollment-editor__actions">
              <Button variant="secondary" loading={busy === key} disabled={Boolean(busy)} onClick={() => dismiss(pair)}>Ei ole duplikaat</Button>
              <Button onClick={() => setMerging(pair)}>Liida</Button>
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
