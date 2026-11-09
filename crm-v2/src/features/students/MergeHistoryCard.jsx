import { useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Button, Card } from '../../components/ui/index.js';
import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { studentsService } from '../../services/firebase/students.js';
import { UNMERGE_LEGACY_HINT, canUnmerge, formatMergeDate as formatDate, unmergeMessage } from './mergeHistory.js';

/**
 * „Ühendamised” (2026-11-09, after two different children were merged): the merge history of a card with
 * „Võta ühendamine tagasi”. On a merged-away card: the card it went into; on a kept card: the cards merged into it.
 * Merges made before the undo record show the button disabled with a hint. Admins only (the page decides).
 */
export default function MergeHistoryCard({ student, service = accountApprovalsService, students = studentsService, onUnmerged }) {
  const mergedIds = Array.isArray(student.mergedStudentIds) ? student.mergedStudentIds : [];
  const into = student.mergedInto || student.mergedIntoStudentId || '';
  const [loaded, setLoaded] = useState({ key: '', cards: [] });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const idsKey = mergedIds.join('|');
  const sources = !idsKey ? [] : loaded.key === idsKey ? loaded.cards : null;

  useEffect(() => {
    if (!idsKey) return undefined;
    let alive = true;
    Promise.all(idsKey.split('|').map((id) => students.getById(id).catch(() => null)))
      .then((cards) => { if (alive) setLoaded({ key: idsKey, cards: cards.filter(Boolean) }); });
    return () => { alive = false; };
  }, [idsKey, students]);

  if (!into && !mergedIds.length) return null;

  const undo = async (sourceId) => {
    setBusy(sourceId); setError(''); setNotice('');
    try {
      const preview = await service.unmergeStudents({ sourceId });
      const ok = await askConfirm(unmergeMessage(preview), { title: 'Võta ühendamine tagasi', confirmLabel: 'Võta tagasi', danger: true });
      if (!ok) return;
      const result = await service.unmergeStudents({ sourceId, apply: true, confirmed: true });
      setNotice('Ühendamine on tagasi võetud: mõlemad kaardid on jälle eraldi.');
      onUnmerged?.({ ...result, sourceId });
    } catch (e) { setError(e.message || 'Tagasi võtmine ebaõnnestus.'); } finally { setBusy(''); }
  };

  const row = (key, text, sub, sourceId, enabled) => (
    <div className="merge-history__row" key={key}>
      <span>{text}{sub ? <small>{sub}</small> : null}{!enabled ? <small>{UNMERGE_LEGACY_HINT}</small> : null}</span>
      <Button variant="secondary" disabled={!enabled || Boolean(busy)} loading={busy === sourceId} onClick={() => undo(sourceId)} title={enabled ? '' : UNMERGE_LEGACY_HINT}><Undo2 size={16} /> Võta ühendamine tagasi</Button>
    </div>
  );

  return (
    <Card className="merge-history">
      <h2>Ühendamised</h2>
      {notice ? <p className="success-notice" role="status">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {into ? row('into', <>See kaart on liidetud kaardiga „{student.mergedIntoStudentName || into}”.</>, student.mergedAt ? formatDate(student.mergedAt) : '', student.id, canUnmerge(student, into)) : null}
      {mergedIds.length && !sources ? <p className="form-hint">Laen ühendamisi…</p> : null}
      {(sources || []).filter((source) => (source.mergedInto || source.mergedIntoStudentId) === student.id).map((source) => row(source.id, <>„{source.name || source.id}” on liidetud sellesse kaarti.</>, source.mergedAt ? formatDate(source.mergedAt) : '', source.id, canUnmerge(source, student.id)))}
    </Card>
  );
}
