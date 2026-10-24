import { Archive, ArrowLeft, Download, Pencil, Plus, RotateCcw, Send, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Modal, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { announcementsService } from '../../services/firebase/announcements.js';
import { studentsService } from '../../services/firebase/students.js';
import AnnouncementForm from './AnnouncementForm.jsx';
import AnnouncementText from './AnnouncementText.jsx';
import { AUDIENCE_LABELS, STATUS_LABELS, STATUS_TONES, TYPE_LABELS, answerText, day, emptyForm, formOf, localToday, reportCsv, when } from './announcementModel.js';
import './announcements.css';

function downloadCsv(content, filename) {
  const blob = new globalThis.Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Report({ announcement, service, onClose }) {
  const state = useAsyncData(() => service.report(announcement.id), [announcement.id, service]);
  const rows = state.data?.rows || [];
  const exportCsv = () => downloadCsv(reportCsv(announcement, rows), `teade-${announcement.activeFrom}-${announcement.title.slice(0, 40).replace(/[^\p{L}\p{N}]+/gu, '-')}.csv`);
  return (
    <Modal open className="modal--announcement" title={`Vastused: ${announcement.title}`} onClose={onClose}>
      {state.loading ? <LoadingState label="Laen vastuseid…" /> : null}
      {state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : null}
      {state.data ? <>
        <div className="announcement-report__summary">
          <strong>Vastanud {state.data.answered} / {state.data.total}</strong>
          <Button variant="secondary" disabled={!rows.length} onClick={exportCsv}><Download size={15} /> Laadi alla (Excel / CSV)</Button>
        </div>
        {!rows.length ? <p className="form-hint">Sellele teatele ei vasta ükski konto (kontrolli saajaid; õpilasel või vanemal peab olema KeeleSepa konto).</p> : (
          <div className="announcement-report__scroll">
            <table className="announcement-report__table">
              <thead><tr><th>Õpilane / laps</th><th>Kes</th><th>Olek</th><th>Aeg</th><th>Vastus</th></tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.studentName || '—'}{row.outside ? <small className="form-hint"> (pole enam saajate seas)</small> : null}</td>
                  <td>{(row.names || []).filter(Boolean).join(', ') || '—'}<br /><small className="form-hint">{row.kind === 'parent' ? 'Lapsevanem' : 'Õpilane'}</small></td>
                  <td>{row.answered ? <Badge tone="success">Vastas</Badge> : <Badge tone="info">Ootab</Badge>}</td>
                  <td>{when(row.updatedAt || row.answeredAt)}{row.answeredByName && row.answered ? <><br /><small className="form-hint">{row.answeredByName}</small></> : null}</td>
                  <td>{answerText(announcement.responseType, row)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </> : null}
    </Modal>
  );
}

// „Teated” (owner 2026-10-24): the administrator's announcements for students and parents (Suhtlus → Teated)
export default function AnnouncementsAdminPage({ service = announcementsService, studentRepository = studentsService }) {
  const { user } = useAuth();
  const state = useAsyncData(async () => {
    const [items, students] = await Promise.all([
      service.list(),
      Promise.resolve().then(() => studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true })).then((result) => result?.items || []).catch(() => []),
    ]);
    return { items, students };
  }, [service, studentRepository]);
  const [editing, setEditing] = useState(null); // { item | null, form }
  const [report, setReport] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const today = localToday();

  const save = async (form, status) => {
    await service.save(editing.item, form, user, status);
    setEditing(null);
    await state.reload();
  };
  const setStatus = async (item, status) => {
    setBusy(item.id); setError('');
    try { await service.setStatus(item, status, user); await state.reload(); } catch (caught) { setError(caught.message || 'Ei õnnestunud.'); } finally { setBusy(''); }
  };

  const items = state.data?.items || [];
  const groups = [['published', 'Avaldatud'], ['draft', 'Mustandid'], ['archived', 'Arhiiv']];
  return (
    <div className="page-content announcements-admin">
      <PageHeader eyebrow="Suhtlus" title="Teated" compact
        description="Teade avaneb õpilasele või lapsevanemale kohe pärast sisselogimist ja KeeleSepp avaneb alles pärast vastamist."
        actions={<><Link className="button button--secondary" to="/messages"><ArrowLeft size={16} /> Suhtlus</Link><Button onClick={() => setEditing({ item: null, form: emptyForm(today) })}><Plus size={16} /> Uus teade</Button></>} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {state.loading ? <LoadingState label="Laen teateid…" /> : null}
      {state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : null}
      {state.data && !items.length ? <EmptyState title="Teateid veel pole" description="Kirjuta esimene teade: näiteks uue õppeaasta info, küsimus või palve märkida sobivad tunniajad." /> : null}
      {groups.map(([status, label]) => {
        const list = items.filter((item) => item.status === status);
        if (!list.length) return null;
        return (
          <section key={status} className="announcements-admin__list" aria-label={label}>
            <h2 className="eyebrow">{label}</h2>
            {list.map((item) => {
              const running = item.status === 'published' && item.activeFrom <= today && (!item.activeTo || today <= item.activeTo);
              return (
                <Card key={item.id} className="announcement-row">
                  <div>
                    <h2>{item.title}</h2>
                    <div className="announcement-row__meta">
                      <Badge tone={STATUS_TONES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                      {item.status === 'published' ? <Badge tone={running ? 'info' : 'neutral'}>{running ? 'Kehtib praegu' : item.activeFrom > today ? 'Algab hiljem' : 'Lõppenud'}</Badge> : null}
                      <span>{AUDIENCE_LABELS[item.audience]}{item.subjects.length ? ` · ${item.subjects.join(', ')}` : ''}{item.levels.length ? ` · ${item.levels.join(', ')}` : ''}{item.studentIds.length ? ` · ${item.studentIds.length} valitud õpilast` : ''}</span>
                      <span>{TYPE_LABELS[item.responseType]}{item.allowChange ? ' · vastust saab muuta' : ''}</span>
                      <span>{day(item.activeFrom)} – {item.activeTo ? day(item.activeTo) : '…'}</span>
                    </div>
                  </div>
                  <div className="announcement-row__actions">
                    <Button variant="secondary" onClick={() => setPreview(item)}>Eelvaade</Button>
                    {item.status !== 'draft' ? <Button variant="secondary" onClick={() => setReport(item)}><Users size={15} /> Vastused</Button> : null}
                    {item.status !== 'archived' ? <Button variant="secondary" onClick={() => setEditing({ item, form: formOf(item) })}><Pencil size={15} /> Muuda</Button> : null}
                    {item.status === 'draft' ? <Button loading={busy === item.id} onClick={() => setStatus(item, 'published')}><Send size={15} /> Avalda</Button> : null}
                    {item.status !== 'archived' ? <Button variant="secondary" loading={busy === item.id && item.status !== 'draft'} onClick={() => setStatus(item, 'archived')}><Archive size={15} /> Arhiveeri</Button> : null}
                    {item.status === 'archived' ? <Button variant="secondary" loading={busy === item.id} onClick={() => setStatus(item, 'draft')}><RotateCcw size={15} /> Taasta mustandiks</Button> : null}
                  </div>
                </Card>
              );
            })}
          </section>
        );
      })}
      {editing ? <AnnouncementForm open initial={editing.form} editing={editing.item} students={state.data?.students || []} onCancel={() => setEditing(null)} onSave={save} /> : null}
      {report ? <Report announcement={report} service={service} onClose={() => setReport(null)} /> : null}
      {preview ? <Modal open className="modal--announcement" title={preview.title} onClose={() => setPreview(null)}>
        <AnnouncementText body={preview.body} />
        <p className="form-hint">{TYPE_LABELS[preview.responseType]}{preview.responseType === 'question' && preview.question.mode !== 'text' ? `: ${preview.question.options.join(' / ')}${preview.question.allowOther ? ' / Muu' : ''}` : ''}</p>
      </Modal> : null}
    </div>
  );
}
