import { useEffect, useMemo, useState } from 'react';
import { Button, ErrorState, LoadingState, Modal } from '../../components/ui/index.js';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { studentAccess, studentsService } from '../../services/firebase/students.js';

// Cyrillic → Latin for comparing names typed in different alphabets (Влад Повжик ~ Vlad, Ульяна ~ Uljana / Ulyana)
const CYR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'z', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c', ш: 's', щ: 's', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'ju', я: 'ja' };
export const nameKey = (name) => String(name || '').toLowerCase().split('').map((c) => CYR[c] ?? c).join('')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[jy]/g, 'i').replace(/[^a-z ]/g, '').trim();

// how alike two names are: the same first word (after transliteration) is a strong hint, a shared surname too
export function nameLikeness(a, b) {
  const [fa = '', ...ra] = nameKey(a).split(/\s+/);
  const [fb = '', ...rb] = nameKey(b).split(/\s+/);
  let score = 0;
  if (fa && fb && (fa === fb || fa.startsWith(fb) || fb.startsWith(fa))) score += 2;
  if (ra.some((w) => w.length > 2 && rb.includes(w))) score += 2;
  return score;
}

const LABEL = { learner: 'õppetöö', finance: 'finantsid', schedule: 'tunniplaan' };

/** Merge another card of the same learner into this one (this card stays; the other is closed). Admins only. */
export default function MergeCardsModal({ student, open, onClose, onMerged, service = accountApprovalsService, students = studentsService }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [preview, setPreview] = useState(null);
  const [flags, setFlags] = useState({ includeFinance: false, includeSchedule: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || list) return;
    students.list({ pageSize: 500, exhaustive: true }).then((r) => setList(r.items || [])).catch((e) => setError(e.message));
  }, [open, list, students]);

  const candidates = useMemo(() => (list || [])
    .filter((s) => s.id !== student.id && !s.mergedInto)
    .map((s) => ({ ...s, like: nameLikeness(student.name, s.name) }))
    .filter((s) => (query ? nameKey(s.name).includes(nameKey(query)) : s.like > 0))
    .sort((a, b) => b.like - a.like || String(a.name).localeCompare(String(b.name), 'et'))
    .slice(0, 20), [list, query, student]);

  const pick = async (id) => {
    setSourceId(id); setPreview(null); setError(''); setBusy(true);
    try { setPreview(await service.mergeStudents({ keepId: student.id, sourceId: id })); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const merge = async () => {
    setBusy(true); setError('');
    try { const result = await service.mergeStudents({ keepId: student.id, sourceId, apply: true, ...flags }); onMerged?.(result); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const source = (list || []).find((s) => s.id === sourceId);
  const waiting = preview?.waiting || [];

  return (
    <Modal open={open} title={`Liida kaardid: ${student.name}`} onClose={() => !busy && onClose()}
      footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button disabled={!preview || busy} loading={busy && Boolean(preview)} onClick={merge}>Liida „{source?.name || '…'}” selle kaardiga</Button></>}>
      <div className="assignment-form">
        <p className="form-hint">See kaart jääb alles. Teise kaardi konto ja õppetöö (tunnid, tööd, kutsed, lemmik) tulevad siia. Teine kaart arhiveeritakse. Ava see kaart, kus on tunniplaan ja ajalugu.</p>
        {error ? <ErrorState title="Viga" message={error} /> : null}
        {!list ? <LoadingState label="Laen kaarte…" /> : (
          <>
            <div className="search-field"><input aria-label="Otsi kaarti" placeholder="Otsi nime järgi (näitab sarnaseid nimesid)" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="assignment-students" role="radiogroup" aria-label="Teine kaart">
              {candidates.map((s) => (
                <label key={s.id} className={s.id === sourceId ? 'is-selected' : ''}>
                  <input type="radio" name="merge-source" checked={s.id === sourceId} onChange={() => pick(s.id)} />
                  <span><strong>{s.name}</strong><small>{[s.teacher, s.level, s.email].filter(Boolean).join(' · ') || s.id}</small>
                    <small>{studentAccess(s) === 'student' ? '✓ õpilase konto' : studentAccess(s) === 'parent' ? 'lapsevanema konto' : 'kontot pole'}{s.active === false ? ' · arhiveeritud' : ''}</small></span>
                </label>
              ))}
              {!candidates.length ? <p className="form-hint">Sarnaseid nimesid ei leitud. Otsi nime järgi.</p> : null}
            </div>
          </>
        )}
        {busy && !preview ? <LoadingState label="Kontrollin, mida liita…" /> : null}
        {preview ? (
          <div role="status">
            <b>Siia tuleb:</b>
            <ul>
              {preview.source.accounts.length ? <li>konto ({preview.source.accounts.length})</li> : null}
              {preview.move.map((m) => <li key={`${m.collection}:${m.field}`}>{m.collection}: {m.count} ({LABEL[m.kind]})</li>)}
              {!preview.move.length && !preview.source.accounts.length ? <li>teisel kaardil pole midagi liita</li> : null}
            </ul>
            {waiting.length ? <div>
              <b>Vajab eraldi kinnitust:</b>
              {waiting.some((m) => m.kind === 'finance') ? <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={flags.includeFinance} onChange={(e) => setFlags({ ...flags, includeFinance: e.target.checked })} /> Tõsta ka finantsid ({waiting.filter((m) => m.kind === 'finance').map((m) => `${m.collection} ${m.count}`).join(', ')})</label> : null}
              {waiting.some((m) => m.kind === 'schedule') ? <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={flags.includeSchedule} onChange={(e) => setFlags({ ...flags, includeSchedule: e.target.checked })} /> Tõsta ka tunniplaan ({waiting.filter((m) => m.kind === 'schedule').map((m) => m.count).join(', ')}) — kontrolli pärast Google'i kalendrit</label> : null}
            </div> : null}
            {preview.skipped.length ? <p className="form-hint">Jääb tõstmata: {preview.skipped.map((m) => `${m.collection} (${m.reason})`).join(', ')}</p> : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
