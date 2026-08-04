import { HeartHandshake, Mail, Pencil, Phone, Search, UserCheck, UserPlus, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { invoicesService, parentsService, studentsService } from '../../services/firebase/index.js';
import { ROLES } from '../../utils/roles.js';
import { buildParentRows, filterParentRows } from './parentModel.js';

const statuses = {
  new: { label: 'Uus', tone: 'info' },
  written: { label: 'Kirjutatud', tone: 'neutral' },
  called: { label: 'Helistatud', tone: 'neutral' },
  waiting: { label: 'Ootab vastust', tone: 'danger' },
  agreed: { label: 'Kokkulepitud', tone: 'success' },
  problem: { label: 'Probleem', tone: 'danger' },
  active: { label: 'Aktiivne', tone: 'success' },
};
const channels = { phone: 'Telefon', email: 'E-post', whatsapp: 'WhatsApp', telegram: 'Telegram', other: 'Muu' };

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' });
}

function editValues(parent) {
  return {
    parentContactStatus: parent.parentContactStatus || 'new',
    parentContactChannel: parent.parentContactChannel || 'phone',
    parentNextContactAt: parent.parentNextContactAt || '',
    parentContactOwner: parent.parentContactOwner || '',
    parentContactNotes: parent.parentContactNotes || '',
    phone: parent.phone || '',
  };
}

export default function ParentsPage({ repository = parentsService, studentRepository = studentsService, invoiceRepository = invoicesService }) {
  const { user } = useAuth();
  const admin = user.roles.includes(ROLES.ADMIN);
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !admin;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [linkingId, setLinkingId] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [saving, setSaving] = useState('');
  const [success, setSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const state = useAsyncData(async () => {
    const [parents, studentResult, invoices] = await Promise.all([
      repository.list(),
      studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
      admin ? invoiceRepository.list() : Promise.resolve([]),
    ]);
    return { parents, students: studentResult.items.filter((student) => student.active && !student.convertedToParent), invoices };
  }, [admin, invoiceRepository, repository, studentRepository, teacherOnly, user.uid]);

  const rows = useMemo(() => state.data ? buildParentRows(state.data.parents, state.data.students, state.data.invoices) : [], [state.data]);
  const scopedRows = useMemo(() => teacherOnly ? rows.filter((row) => row.children.length) : rows, [rows, teacherOnly]);
  const visibleRows = useMemo(() => filterParentRows(scopedRows, { query, status }), [query, scopedRows, status]);
  const editingRow = rows.find((row) => row.parent.id === editingId) || null;
  const linkingRow = rows.find((row) => row.parent.id === linkingId) || null;
  const linkStudents = (state.data?.students || []).filter((student) => `${student.name} ${student.teacher || ''} ${student.subject || ''} ${student.email || ''}`.toLocaleLowerCase('et').includes(studentQuery.toLocaleLowerCase('et')));

  if (state.loading) return <LoadingState label="Laen lapsevanemaid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const openEdit = (row) => {
    setEditingId(row.parent.id);
    setEditForm(editValues(row.parent));
    setActionError('');
  };

  const saveParent = async (event) => {
    event.preventDefault();
    setSaving('edit');
    setActionError('');
    try {
      await repository.updateCrm(editingRow.parent, editForm, user);
      setEditingId('');
      setEditForm(null);
      setSuccess('Lapsevanema kontaktandmed salvestati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Lapsevanema andmete salvestamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const reviewParent = async (row) => {
    setSaving(`review:${row.parent.id}`);
    setActionError('');
    try {
      await repository.markReviewed(row.parent, user);
      setSuccess('Registreering märgiti kontrollituks.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Registreeringu kontrollimine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const linkStudent = async (student) => {
    setSaving(`link:${student.id}`);
    setActionError('');
    try {
      await repository.linkStudent(linkingRow.parent, student, user);
      setLinkingId('');
      setSuccess(`${student.name} seoti lapsevanemaga.`);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Õpilase sidumine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const linkedCount = scopedRows.filter((row) => row.children.length).length;
  const needsReview = scopedRows.filter((row) => row.needsReview || row.missingNames.length);
  const today = new Date().toISOString().slice(0, 10);
  const todayContacts = scopedRows.filter((row) => row.parent.parentNextContactAt === today).length;
  const balance = admin ? scopedRows.reduce((sum, row) => sum + row.balanceCents, 0) : 0;

  return <div className="page-content">
    <PageHeader eyebrow="CRM" title="Lapsevanemad" description={teacherOnly ? 'Sinu õpilastega seotud lapsevanemad ja kontaktid.' : 'Lapsevanemate kontaktid, seotud lapsed ja registreeringute kontroll.'} />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge veateade" onClick={() => setActionError('')}>×</button></div> : null}
    <div className={`metric-grid ${admin ? '' : 'metric-grid--three'}`}><Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Lapsevanemaid</span><i><HeartHandshake size={19} /></i></div><strong>{scopedRows.length}</strong><small>nähtavas tööalas</small></Card><Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Seotud lastega</span><i><UserCheck size={19} /></i></div><strong>{linkedCount}</strong><small>kontrollitud seost</small></Card><Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Vajab tähelepanu</span><i><UserPlus size={19} /></i></div><strong>{needsReview.length}</strong><small>{todayContacts} kontakti täna</small></Card>{admin ? <Card className="metric-card metric-card--purple"><div className="metric-card__top"><span>Tasumata jääk</span><i><WalletCards size={19} /></i></div><strong>{money(balance)}</strong><small>seotud arvetel</small></Card> : null}</div>

    {admin && needsReview.length ? <Card className="parent-review-queue"><div className="section-heading"><div><span className="eyebrow">Kontroll</span><h2>Uued registreeringud</h2></div><Badge tone="danger">{needsReview.length}</Badge></div>{needsReview.slice(0, 8).map((row) => <div key={row.parent.id}><div><strong>{row.parent.displayName || row.parent.email}</strong><span>{row.missingNames.length ? `Sidumata: ${row.missingNames.join(', ')}` : 'Registreering vajab kinnitamist'}</span></div>{row.missingNames.length ? <Button variant="secondary" disabled={Boolean(saving)} onClick={() => { setLinkingId(row.parent.id); setStudentQuery(''); }}>Seo õpilane</Button> : null}{row.needsReview ? <Button disabled={Boolean(saving)} onClick={() => reviewParent(row)}>Kontrollitud</Button> : null}</div>)}</Card> : null}

    <Card className="parent-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi lapsevanemat" placeholder="Otsi vanema, lapse või õpetaja järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select aria-label="Lapsevanema staatus" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik staatused</option>{Object.entries(statuses).map(([value, meta]) => <option value={value} key={value}>{meta.label}</option>)}</Select></Card>

    {visibleRows.length ? <div className="parent-grid">{visibleRows.map((row) => {
      const meta = statuses[row.parent.parentContactStatus] || statuses.new;
      return <Card className={row.parent.parentNextContactAt === today ? 'parent-card is-due' : 'parent-card'} key={row.parent.id}><header><div className="parent-avatar">{(row.parent.displayName || row.parent.email || 'LV').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toLocaleUpperCase('et')}</div><div><h2>{row.parent.displayName || 'Nimetu lapsevanem'}</h2><span>{row.parent.email || 'E-post puudub'}</span></div><Badge tone={meta.tone}>{meta.label}</Badge></header><div className="parent-contact-links">{row.parent.phone ? <a href={`tel:${row.parent.phone}`}><Phone size={16} /> {row.parent.phone}</a> : <span><Phone size={16} /> Telefon puudub</span>}{row.parent.email ? <a href={`mailto:${row.parent.email}`}><Mail size={16} /> Saada e-kiri</a> : null}</div><dl><div><dt>Kanal</dt><dd>{channels[row.parent.parentContactChannel] || 'Muu'}</dd></div><div><dt>Järgmine kontakt</dt><dd>{row.parent.parentNextContactAt || 'Määramata'}</dd></div><div><dt>Vastutaja</dt><dd>{row.parent.parentContactOwner || 'Määramata'}</dd></div>{admin ? <div><dt>Tasumata jääk</dt><dd>{money(row.balanceCents)}</dd></div> : null}</dl><section><div className="parent-section-head"><strong>Lapsed</strong><Badge tone={row.children.length ? 'success' : 'danger'}>{row.children.length || 'Sidumata'}</Badge></div>{row.children.length ? row.children.map((student) => <Link to={`/students/${student.id}`} key={student.id}><span><strong>{student.name}</strong><small>{student.subject || 'Õppeaine puudub'} · {student.teacher || 'Õpetaja puudub'}</small></span><Badge tone="info">{student.level || '—'}</Badge></Link>) : <p>{row.requestedNames.length ? `Registreerimisel sisestatud: ${row.requestedNames.join(', ')}` : 'Lapse andmed puuduvad.'}</p>}</section><p className="parent-notes"><strong>Märkmed:</strong> {row.parent.parentContactNotes || 'Märkmeid ei ole.'}</p>{admin ? <footer><Button variant="secondary" onClick={() => openEdit(row)}><Pencil size={16} /> Muuda</Button><Button variant="secondary" onClick={() => { setLinkingId(row.parent.id); setStudentQuery(''); }}><UserPlus size={16} /> Seo õpilane</Button>{row.needsReview ? <Button onClick={() => reviewParent(row)}>Kontrollitud</Button> : null}</footer> : null}</Card>;
    })}</div> : <Card><EmptyState title="Lapsevanemaid ei leitud" description={query || status !== 'all' ? 'Muuda otsingut või filtrit.' : 'Sinu tööalas ei ole seotud lapsevanemaid.'} /></Card>}

    <Modal open={Boolean(editingRow && editForm)} title={`Muuda: ${editingRow?.parent.displayName || editingRow?.parent.email || ''}`} onClose={() => !saving && setEditingId('')} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setEditingId('')}>Loobu</Button><Button type="submit" form="parent-edit-form" loading={saving === 'edit'}>Salvesta</Button></>}>
      {editForm ? <form id="parent-edit-form" className="form-grid" onSubmit={saveParent}><Select id="parent-status" label="Kontakti staatus" value={editForm.parentContactStatus} onChange={(event) => setEditForm({ ...editForm, parentContactStatus: event.target.value })}>{Object.entries(statuses).map(([value, meta]) => <option value={value} key={value}>{meta.label}</option>)}</Select><Select id="parent-channel" label="Suhtluskanal" value={editForm.parentContactChannel} onChange={(event) => setEditForm({ ...editForm, parentContactChannel: event.target.value })}>{Object.entries(channels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select><Input id="parent-phone" label="Telefon" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} /><Input id="parent-next-contact" label="Järgmine kontakt" type="date" value={editForm.parentNextContactAt} onChange={(event) => setEditForm({ ...editForm, parentNextContactAt: event.target.value })} /><Input id="parent-owner" className="form-grid__wide" label="Vastutaja" value={editForm.parentContactOwner} onChange={(event) => setEditForm({ ...editForm, parentContactOwner: event.target.value })} /><label className="textarea-field form-grid__wide"><span>Märkmed</span><textarea aria-label="Lapsevanema märkmed" rows="5" value={editForm.parentContactNotes} onChange={(event) => setEditForm({ ...editForm, parentContactNotes: event.target.value })} /></label></form> : null}
    </Modal>

    <Modal open={Boolean(linkingRow)} title={`Seo õpilane: ${linkingRow?.parent.displayName || linkingRow?.parent.email || ''}`} onClose={() => !saving && setLinkingId('')} className="modal--parent-link" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={() => setLinkingId('')}>Sulge</Button>}>
      {linkingRow ? <div className="parent-link-manager"><p className="form-hint">Vali olemasolev õpilase kaart. Juba teise lapsevanemaga seotud kaarti ei kirjutata üle.</p><div className="search-field"><Search size={17} /><input aria-label="Otsi õpilast sidumiseks" placeholder="Otsi nime, õpetaja või aine järgi" value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} /></div><div>{linkStudents.map((student) => {
        const linked = linkingRow.children.some((child) => child.id === student.id);
        const otherParent = (student.linkedParentId || student.parentUid || student.guardianUid) && !linked;
        return <section key={student.id}><span><strong>{student.name}</strong><small>{student.subject || 'Õppeaine puudub'} · {student.teacher || 'Õpetaja puudub'}</small></span>{linked ? <Badge tone="success">Seotud</Badge> : otherParent ? <Badge tone="danger">Teise vanemaga seotud</Badge> : <Button variant="secondary" loading={saving === `link:${student.id}`} disabled={Boolean(saving)} onClick={() => linkStudent(student)}>Seo</Button>}</section>;
      })}{!linkStudents.length ? <EmptyState title="Õpilasi ei leitud" /> : null}</div></div> : null}
    </Modal>
  </div>;
}
