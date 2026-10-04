import { ArrowLeft, GraduationCap, LibraryBig, Redo2, Search, Undo2, Video, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, EmptyState, ErrorState, Input, LoadingState, Select } from '../../components/ui/index.js';
import StudentBoard from '../board/StudentBoard.jsx';
import { imageSize } from '../board/boardModel.js';
import MaterialsPanel from './MaterialsPanel.jsx';
import { fileKind } from './roomMaterials.js';
import './liveRoom.css';

// Live Classroom opens as the teacher's workspace (owner, 2026-10-04): pick a student → their board opens at once, so a
// lesson can be prepared in advance (sheets, materials, notes); „Kutsu õpilane tundi” invites them into the same board.
export default function TeacherWorkspace({
  user, studentsState, selectedId, onSelect, title, onTitle, onInvite, inviting = false, pending = null, onCancel,
  cancelling = false, resumable = null, onResume, onBack, error = '', boardService, library,
}) {
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

  return (
    <div className="lr lw" role="region" aria-label="Tööruum">
      <header className="lr-top lw-top">
        <div className="lr-top__group lw-pick">
          {onBack ? <button type="button" className="lr-icon" aria-label="Tagasi CRM-i" title="Tagasi CRM-i" onClick={onBack}><ArrowLeft size={19} /></button> : null}
          <div className="lr-title"><strong>Live Classroom</strong><small>Tööruum: vali õpilane, valmista tund ette ja kutsu</small></div>
          {studentsState.loading ? <LoadingState label="Laen õpilasi…" /> : studentsState.error ? <ErrorState message={studentsState.error} /> : studentsState.items.length ? <>
            <label className="lr-search lw-search"><Search size={16} /><input aria-label="Otsi õpilast tunniks" placeholder="Otsi õpilast…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <Select label="Õpilane" value={studentId} disabled={Boolean(pending)} onChange={(event) => onSelect(event.target.value)}>
              <option value="">Vali õpilane</option>
              {visible.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.subject || 'Õppeaine puudub'} · {item.level || 'tase puudub'}</option>)}
            </Select>
          </> : <EmptyState title="Kontoga seotud õpilasi ei ole" description="Seo õpilase kaart tema kasutajakontoga, et saaksid talle tunnikutsungi saata." />}
        </div>
        <div className="lr-top__group lr-top__right">
          {student ? <>
            <button type="button" aria-label="Võta tagasi" title="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
            <button type="button" aria-label="Tee uuesti" title="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
            <button type="button" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => setPanel(panel === 'materials' ? '' : 'materials')}><LibraryBig size={17} /> Materjalid</button>
          </> : null}
          {resumable ? <Button variant="secondary" onClick={onResume}><Video size={17} /> Tagasi tundi: {resumable.studentName}</Button> : null}
          {pending ? <>
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
          {student ? <StudentBoard
            key={student.id}
            studentId={student.id}
            user={user}
            staff
            variant="room"
            controllerRef={boardRef}
            onHistoryChange={setHistory}
            uploadImage={uploadImage}
            {...(boardService ? { service: boardService } : {})}
          /> : <div className="lw-empty"><EmptyState title="Vali õpilane" description="Tema tahvel avaneb kohe: saad tunni ette valmistada (lehed, materjalid, märkmed) ja siis kutsuda ta tundi. Õpilane näeb kõike, mida siia paned." /></div>}
        </main>
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
