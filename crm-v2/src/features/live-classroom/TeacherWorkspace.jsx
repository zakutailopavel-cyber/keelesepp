import { ArrowLeft, ClipboardList, GraduationCap, LibraryBig, Redo2, Search, Undo2, Users, Video, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, EmptyState, ErrorState, Input, LoadingState } from '../../components/ui/index.js';
import StudentBoard from '../board/StudentBoard.jsx';
import { imageSize } from '../board/boardModel.js';
import MaterialsPanel from './MaterialsPanel.jsx';
import { RoomWorksheetContent, RoomWorksheetPicker } from '../worksheet-studio/RoomWorksheetPanel.jsx';
import { prepRoomKey } from '../worksheet-studio/roomWorksheetChoices.js';
import { homeworkService } from '../../services/firebase/index.js';
import { fileKind } from './roomMaterials.js';
import './liveRoom.css';

// Live Classroom opens as the teacher's workspace (owner, 2026-10-04): pick a student → their board opens at once, so a
// lesson can be prepared in advance (sheets, materials, notes); „Kutsu õpilane tundi” invites them into the same board.
export default function TeacherWorkspace({
  user, studentsState, selectedId, onSelect, title, onTitle, onInvite, inviting = false, pending = null, onCancel,
  cancelling = false, resumable = null, onResume, onBack, error = '', boardService, library,
  groupIds = [], onToggleGroup, onInviteGroup, invitingGroup = false, openGroups = [], onOpenGroup, homework = homeworkService,
}) {
  const [mode, setMode] = useState('single');
  const group = mode === 'group';
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState('');
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [notice, setNotice] = useState('');
  const boardRef = useRef(null);
  const studentId = pending?.studentId || selectedId;
  const student = studentsState.items.find((item) => item.id === studentId) || null;
  const visible = useMemo(() => studentsState.items.filter((item) => `${item.name} ${item.subject} ${item.level}`.toLocaleLowerCase('et').includes(search.toLocaleLowerCase('et'))), [search, studentsState.items]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = globalThis.setTimeout(() => setNotice(''), 3500);
    return () => globalThis.clearTimeout(timer);
  }, [notice]);
  const place = async (file) => {
    const kind = fileKind(file);
    const size = kind === 'image' ? await imageSize(file.url) : { width: 1000, height: 1414 };
    const id = await boardRef.current?.insertFile({ url: file.url, name: file.name, kind, storagePath: file.storagePath || '', ...size });
    if (id) { setNotice(`„${file.name || 'Materjal'}” on tahvlil.`); setPanel(''); }
  };
  const uploadImage = library?.uploadFile ? (file) => library.uploadFile({ file, user }) : undefined;
  // worksheets put on the board while preparing: clickable pages now, taken into the lesson room on invitation
  const [prepared, setPrepared] = useState([]);
  useEffect(() => {
    if (!student?.id || !homework?.subscribeRoomWorksheets) return undefined;
    try {
      return homework.subscribeRoomWorksheets({ studentId: student.id, roomKey: prepRoomKey(student.id) }, setPrepared, () => setPrepared([]));
    } catch {
      return undefined;
    }
  }, [homework, student?.id]);
  const boardSheets = useMemo(() => (student ? prepared.map((item) => ({
    id: item.id,
    title: item.title || item.worksheetDoc?.meta?.title || 'Tööleht',
    content: <RoomWorksheetContent current={item} role="teacher" homework={homework} />,
  })) : []), [homework, prepared, student]);

  return (
    <div className="lr lw" role="region" aria-label="Tööruum">
      <header className="lr-top lw-top">
        <div className="lr-top__group lw-pick">
          {onBack ? <button type="button" className="lr-icon" aria-label="Tagasi CRM-i" title="Tagasi CRM-i" onClick={onBack}><ArrowLeft size={19} /></button> : null}
          <div className="lr-title"><strong>Live Classroom</strong><small>Tööruum: vali õpilane, valmista tund ette ja kutsu</small></div>
          {onInviteGroup ? <div className="ed-seg lw-mode" role="group" aria-label="Tunni liik">
            <button type="button" aria-pressed={!group} className={!group ? 'is-active' : ''} onClick={() => setMode('single')}>Üks õpilane</button>
            <button type="button" aria-pressed={group} className={group ? 'is-active' : ''} onClick={() => setMode('group')}><Users size={14} /> Grupitund</button>
          </div> : null}
          {studentsState.loading ? <LoadingState label="Laen õpilasi…" /> : studentsState.error ? <ErrorState message={studentsState.error} /> : studentsState.items.length ? <>
            {group ? <label className="lr-search lw-search"><Search size={16} /><input aria-label="Otsi õpilast tunniks" placeholder="Otsi õpilast…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              : <StudentPicker student={student} items={visible} search={search} onSearch={setSearch} disabled={Boolean(pending)} onPick={(id) => { onSelect(id); setSearch(''); setPanel(id ? 'worksheets' : ''); }} />}
          </> : <EmptyState title="Kontoga seotud õpilasi ei ole" description="Seo õpilase kaart tema kasutajakontoga, et saaksid talle tunnikutsungi saata." />}
        </div>
        <div className="lr-top__group lr-top__right">
          {student ? <>
            <button type="button" aria-label="Võta tagasi" title="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
            <button type="button" aria-label="Tee uuesti" title="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
            <button type="button" className={`lr-text-btn ${panel === 'worksheets' ? 'is-active' : ''}`} onClick={() => setPanel(panel === 'worksheets' ? '' : 'worksheets')}><ClipboardList size={17} /> Töölehed{prepared.length ? ` (${prepared.length})` : ''}</button>
            <button type="button" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => setPanel(panel === 'materials' ? '' : 'materials')}><LibraryBig size={17} /> Materjalid</button>
          </> : null}
          {resumable ? <Button variant="secondary" onClick={onResume}><Video size={17} /> Tagasi tundi: {resumable.studentName}</Button> : null}
          {openGroups.map((item) => <Button key={item.id} variant="secondary" onClick={() => onOpenGroup?.(item.id)}><Users size={16} /> Tagasi grupitundi: {item.title}</Button>)}
          {group ? <>
            <Input aria-label="Tunni pealkiri" value={title} maxLength={160} placeholder="Grupitunni pealkiri" onChange={(event) => onTitle(event.target.value)} />
            <Button loading={invitingGroup} disabled={!groupIds.length} onClick={onInviteGroup}><Users size={18} /> Kutsu grupp tundi ({groupIds.length}/4)</Button>
          </> : pending ? <>
            <span className="lr-pill lw-pending" role="status">Kutse saadetud — ootan: {pending.studentName}</span>
            <Button variant="danger" loading={cancelling} onClick={onCancel}><XCircle size={17} /> Tühista kutse</Button>
          </> : student ? <>
            <Input aria-label="Tunni pealkiri" value={title} maxLength={160} placeholder="Tunni pealkiri" onChange={(event) => onTitle(event.target.value)} />
            <Button loading={inviting} onClick={onInvite}><GraduationCap size={18} /> Kutsu õpilane tundi</Button>
          </> : null}
        </div>
      </header>
      {error ? <p className="lr-toast lr-toast--error" role="alert">{error}</p> : null}
      {notice ? <p className="lr-toast" role="status">{notice}</p> : null}
      <div className="lr-body">
        <main className="lr-stage">
          {group ? <div className="lw-group" role="group" aria-label="Grupi õpilased">
            <p>Vali kuni 4 õpilast. Kõik näevad üksteist ja ühist grupi tahvlit; igaühe oma tahvel jääb alles.</p>
            <div className="lw-group__list">{visible.map((item) => <label key={item.id} className={groupIds.includes(item.id) ? 'is-on' : ''}>
              <input type="checkbox" checked={groupIds.includes(item.id)} disabled={!groupIds.includes(item.id) && groupIds.length >= 4} onChange={() => onToggleGroup?.(item.id)} />
              <span><strong>{item.name}</strong><small>{item.subject || 'Õppeaine puudub'} · {item.level || 'tase puudub'}</small></span>
            </label>)}</div>
          </div> : student ? <StudentBoard
            key={student.id}
            studentId={student.id}
            user={user}
            staff
            variant="room"
            controllerRef={boardRef}
            onHistoryChange={setHistory}
            uploadImage={uploadImage}
            worksheets={boardSheets}
            {...(boardService ? { service: boardService } : {})}
          /> : <div className="lw-empty"><EmptyState title="Vali õpilane" description="Tema tahvel avaneb kohe: saad tunni ette valmistada (lehed, materjalid, märkmed) ja siis kutsuda ta tundi. Õpilane näeb kõike, mida siia paned." /></div>}
        </main>
        {panel === 'worksheets' && student ? <aside className="lr-side has-drawer" aria-label="Töölehed">
          <section className="lr-drawer" aria-label="Töölehed">
            <header><strong>Lisa tööleht</strong><button type="button" className="lr-icon" aria-label="Sulge" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body">
              <p className="form-hint">„Järgmine tund” on õpilase järgmine õppekava tund (päeviku ja tehtud töölehtede järgi). Tööleht tuleb tahvlile oma lehele ja on klõpsatav. Kui kutsud õpilase tundi, täidab ta seda ja näed vastuseid kohe.</p>
              {prepared.length ? <p className="form-hint">Tahvlil: {prepared.map((item) => item.title || 'Tööleht').join(' · ')}</p> : null}
              <RoomWorksheetPicker studentId={student.id} studentName={student.name} studentLevel={student.level || ''} roomKey={prepRoomKey(student.id)} note={title ? `Live Classroom: ${title}` : 'Live Classroom'} user={user} homework={homework} {...(library ? { library } : {})} onOpened={(choice) => { setNotice(`„${choice.title}” on tahvlil.`); setPanel(''); }} />
            </div>
          </section>
        </aside> : null}
        {panel === 'materials' && student ? <aside className="lr-side has-drawer" aria-label="Materjalid">
          <section className="lr-drawer" aria-label="Materjalid">
            <header><strong>Materjalid</strong><button type="button" className="lr-icon" aria-label="Sulge" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><MaterialsPanel library={library} onPlace={place} /></div>
          </section>
        </aside> : null}
      </div>
    </div>
  );
}

const studentLine = (item) => `${item.subject || 'Õppeaine puudub'} · ${item.level || 'tase puudub'}`;

// One field to find and choose the student (owner, 2026-10-10): type a name, the matching students drop down below.
function StudentPicker({ student, items, search, onSearch, onPick, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const pick = (id) => { onPick(id); setOpen(false); };
  const onKey = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, items.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Enter' && open && items[active]) { event.preventDefault(); pick(items[active].id); }
    else if (event.key === 'Escape') { setOpen(false); onSearch(''); }
  };
  return (
    <div className="lw-picker">
      <Search size={16} aria-hidden="true" />
      <input
        role="combobox" aria-label="Õpilane" aria-expanded={open} aria-controls="lw-picker-list" aria-autocomplete="list" autoComplete="off"
        disabled={disabled} placeholder={student ? `${student.name} · ${studentLine(student)}` : 'Vali või otsi õpilane…'}
        className={student ? 'has-value' : ''} value={search}
        onFocus={() => { setOpen(true); setActive(0); }} onBlur={() => setOpen(false)}
        onChange={(event) => { onSearch(event.target.value); setOpen(true); setActive(0); }} onKeyDown={onKey}
      />
      {student && !disabled ? <button type="button" className="lw-picker__clear" aria-label="Tühjenda valik" onMouseDown={(event) => event.preventDefault()} onClick={() => pick('')}><X size={15} /></button> : null}
      {open ? <ul id="lw-picker-list" role="listbox" aria-label="Õpilased">
        {items.length ? items.map((item, index) => <li key={item.id} role="option" aria-selected={item.id === student?.id} className={index === active ? 'is-active' : ''}
          onMouseDown={(event) => { event.preventDefault(); pick(item.id); }} onMouseEnter={() => setActive(index)}>
          <strong>{item.name}</strong><small>{studentLine(item)}</small>
        </li>) : <li className="lw-picker__none">Ei leidnud ühtegi õpilast</li>}
      </ul> : null}
    </div>
  );
}
