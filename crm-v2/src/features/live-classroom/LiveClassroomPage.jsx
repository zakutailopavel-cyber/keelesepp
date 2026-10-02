import { CheckCircle2, Clock3, GraduationCap, Search, Video, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { libraryService, liveLessonCallSignalsService, liveLessonInvitationsService, liveLessonPresenceService, messagesService, studentsService } from '../../services/firebase/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { eligibleInvitationStudents, INVITATION_STATUS, isInvitationRouteUsable, newestInvitation, normalizeInvitation, timestampMillis } from './invitationModel.js';
import LiveRoom from './LiveRoom.jsx';
import './liveClassroom.css';

const statusLabel = {
  [INVITATION_STATUS.PENDING]: 'Ootab vastust',
  [INVITATION_STATUS.ACCEPTED]: 'Õpilane liitus',
  [INVITATION_STATUS.DECLINED]: 'Õpilane keeldus',
  [INVITATION_STATUS.CANCELLED]: 'Tühistatud',
  [INVITATION_STATUS.CLOSED]: 'Suletud',
};

function WaitingRoom({ invitation, role }) {
  const accepted = invitation.status === INVITATION_STATUS.ACCEPTED;
  return <Card className="live-waiting-room">
    <div className={accepted ? 'live-waiting-room__icon is-ready' : 'live-waiting-room__icon'}>{accepted ? <CheckCircle2 size={34} /> : <Video size={34} />}</div>
    <span className="eyebrow">Live Classroom v2</span>
    <h2>{invitation.title}</h2>
    <p>{role === 'student' ? `${invitation.teacherName} valmistab tunniruumi ette.` : `${invitation.studentName} ${accepted ? 'võttis kutse vastu.' : 'pole veel vastanud.'}`}</p>
    <Badge tone={accepted ? 'success' : 'info'}>{statusLabel[invitation.status] || invitation.status}</Badge>
    <div className="live-waiting-room__next"><Clock3 size={18} /><span><strong>{accepted ? 'Privaatne ruum on valmis' : 'Kutse on saadetud'}</strong><small>{accepted ? 'Video ja mikrofon käivituvad allpool ainult osaleja enda nupuvajutusel.' : 'Kui õpilane võtab kutse vastu, avaneb sama ruum mõlemale.'}</small></span></div>
  </Card>;
}

export default function LiveClassroomPage({
  invitationService = liveLessonInvitationsService,
  studentRepository = studentsService,
  callSignalService = liveLessonCallSignalsService,
  callPresenceService = liveLessonPresenceService,
  boardService = studentBoardService,
  messagesRepository = messagesService,
  libraryRepository = libraryService,
  callMediaDevices,
  callPeerFactory,
  worksheetHomework,
  worksheetLibrary,
  recordingService,
}) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation') || '';
  const isStudent = user.roles?.includes('student');
  const isStaff = user.roles?.some((role) => role === 'admin' || role === 'teacher');
  const [studentsState, setStudentsState] = useState({ loading: isStaff, items: [], error: '' });
  const [invitations, setInvitations] = useState([]);
  const [streamReady, setStreamReady] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState('');
  const [actionError, setActionError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [callStreams, setCallStreams] = useState({ local: null, remote: null });
  const [roomStudent, setRoomStudent] = useState(null);

  useEffect(() => {
    if (!isStaff) return undefined;
    let alive = true;
    studentRepository.list({ status: 'active', scopeTeacherUid: user.roles.includes('admin') ? '' : user.uid, pageSize: 500, exhaustive: true })
      .then((result) => { if (alive) setStudentsState({ loading: false, items: eligibleInvitationStudents(result.items), error: '' }); })
      .catch((error) => { if (alive) setStudentsState({ loading: false, items: [], error: firebaseErrorMessage(error) }); });
    return () => { alive = false; };
  }, [isStaff, studentRepository, user.roles, user.uid]);

  useEffect(() => {
    setStreamReady(false);
    const subscribe = isStudent ? invitationService.subscribeIncoming : invitationService.subscribeOutgoing;
    return subscribe.call(
      invitationService,
      user.uid,
      (items) => {
        setInvitations(items);
        setStreamReady(true);
      },
      (error) => {
        setStreamError(firebaseErrorMessage(error));
        setStreamReady(true);
      },
    );
  }, [invitationService, isStudent, user.uid]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedStudent = studentsState.items.find((student) => student.id === selectedId);
  const visibleStudents = useMemo(() => studentsState.items.filter((student) => `${student.name} ${student.subject} ${student.level}`.toLocaleLowerCase('et').includes(search.toLocaleLowerCase('et'))), [search, studentsState.items]);
  const normalizedInvitations = useMemo(
    () => invitations.map((item) => normalizeInvitation(item.id, item, now)),
    [invitations, now],
  );
  const requestedInvitation = normalizedInvitations.find((item) => item.id === invitationId);
  const routeInvitation = isInvitationRouteUsable(requestedInvitation) ? requestedInvitation : null;
  const fallbackInvitation = newestInvitation(normalizedInvitations, [INVITATION_STATUS.PENDING]);
  const activeInvitation = routeInvitation || fallbackInvitation;

  useEffect(() => {
    if (!streamReady || !invitationId || !requestedInvitation) return;
    if (!isInvitationRouteUsable(requestedInvitation)) {
      setSearchParams({}, { replace: true });
    }
  }, [invitationId, requestedInvitation, setSearchParams, streamReady]);

  const sendInvitation = async () => {
    if (!selectedStudent) { setActionError('Vali õpilane.'); return; }
    setSaving('create');
    setActionError('');
    try {
      const created = await invitationService.create({ student: selectedStudent, title: title || selectedStudent.subject }, user);
      setSelectedId('');
      setTitle('');
      setSearchParams({ invitation: created.id }, { replace: true });
    } catch (error) {
      setActionError(firebaseErrorMessage(error));
    } finally {
      setSaving('');
    }
  };

  const cancel = async () => {
    if (!activeInvitation) return;
    setSaving('cancel');
    setActionError('');
    try {
      await invitationService.cancel(activeInvitation.id, user);
      setSearchParams({}, { replace: true });
    } catch (error) {
      setActionError(firebaseErrorMessage(error));
    } finally {
      setSaving('');
    }
  };

  const closeRoom = async () => {
    if (!activeInvitation) return;
    setSaving('close');
    setActionError('');
    try {
      await invitationService.close(activeInvitation.id, user);
      setSearchParams({}, { replace: true });
    } catch (error) {
      setActionError(firebaseErrorMessage(error));
    } finally {
      setSaving('');
    }
  };

  // the room's student card: recording consent and subject (language) for the recorder
  const roomStudentId = isStaff && activeInvitation?.status === INVITATION_STATUS.ACCEPTED ? activeInvitation.studentId : '';
  useEffect(() => {
    if (!roomStudentId) return undefined;
    let alive = true;
    Promise.resolve().then(() => studentRepository.getById(roomStudentId))
      .then((student) => { if (alive) setRoomStudent(student || null); })
      .catch(() => { if (alive) setRoomStudent(null); });
    return () => { alive = false; };
  }, [roomStudentId, studentRepository]);

  const leaveRoom = () => setSearchParams({}, { replace: true });
  // a teacher who stepped out of a running lesson (accepted in the last 6 hours, not closed) can go straight back
  const resumable = !activeInvitation
    ? normalizedInvitations.filter((item) => item.status === INVITATION_STATUS.ACCEPTED && now - (timestampMillis(item.respondedAt) || timestampMillis(item.createdAt)) < 6 * 3600_000)
      .sort((a, b) => (timestampMillis(b.respondedAt) || 0) - (timestampMillis(a.respondedAt) || 0))[0]
    : null;
  const roomProps = (role) => ({
    invitation: activeInvitation,
    role,
    user,
    student: role === 'teacher' ? roomStudent : null,
    callProps,
    boardService,
    messagesRepository,
    library: libraryRepository,
    worksheetProps,
    recordingService,
    streams: callStreams,
    onLeave: leaveRoom,
    onEndLesson: () => { if (globalThis.confirm('Lõpetada tund? Tunniruum suletakse mõlemale.')) closeRoom(); },
    ending: saving === 'close',
  });
  const worksheetProps = { ...(worksheetHomework ? { homework: worksheetHomework } : {}), ...(worksheetLibrary ? { library: worksheetLibrary } : {}) };
  const callProps = {
    onMediaStreams: setCallStreams,
    invitation: activeInvitation,
    user,
    signalService: callSignalService,
    presenceService: callPresenceService,
    ...(callMediaDevices ? { mediaDevices: callMediaDevices } : {}),
    ...(callPeerFactory ? { peerFactory: callPeerFactory } : {}),
  };

  if (isStudent) {
    if (streamReady && !streamError && activeInvitation?.status === INVITATION_STATUS.ACCEPTED) return <LiveRoom key={activeInvitation.id} {...roomProps('student')} />;
    return <div className="page-content">
      <PageHeader eyebrow="Minu tund" title="Live Classroom" description="Sinu privaatne reaalajas tunniruum." />
      {streamError ? <ErrorState message={streamError} /> : !streamReady ? <LoadingState label="Laen tunnikutset…" /> : resumable ? <Card className="live-resume"><div><strong>Tund käib: {resumable.teacherName}</strong><small>{resumable.title}</small></div><Button onClick={() => setSearchParams({ invitation: resumable.id }, { replace: true })}><Video size={17} /> Tagasi tundi</Button></Card> : <Card><EmptyState title="Aktiivset tundi ei ole" description="Kui õpetaja kutsub sind tundi, ilmub kutse automaatselt sinu kabinetti." /></Card>}
    </div>;
  }

  if (activeInvitation?.status === INVITATION_STATUS.ACCEPTED) {
    return <>
      {streamError || actionError ? <div className="action-error lr-page-error" role="alert">{streamError || actionError}</div> : null}
      <LiveRoom key={activeInvitation.id} {...roomProps('teacher')} />
    </>;
  }

  return <div className="page-content">
    <PageHeader eyebrow="Live Classroom v2" title="Alusta tundi" description="Vali õpilane ja saada tema kabinetti reaalajas tunnikutsung." />
    {streamError || actionError ? <div className="action-error" role="alert">{streamError || actionError}</div> : null}
    {activeInvitation ? <>
      <WaitingRoom invitation={activeInvitation} role="teacher" />
      {activeInvitation.status === INVITATION_STATUS.PENDING ? <div className="live-invitation-toolbar"><Button variant="danger" loading={saving === 'cancel'} onClick={cancel}><XCircle size={17} /> Tühista kutse</Button></div> : null}
    </> : <>{resumable ? <Card className="live-resume"><div><strong>Tund käib: {resumable.studentName}</strong><small>{resumable.title}</small></div><Button onClick={() => setSearchParams({ invitation: resumable.id }, { replace: true })}><Video size={17} /> Tagasi tundi</Button></Card> : null}<Card className="live-start-card">
      <div className="live-start-card__heading"><div className="settings-icon"><Video /></div><div><h2>Kutsu õpilane tundi</h2><p className="settings-copy">Kutse ilmub kohe õpilase KeeleSepp kabinetti. Ainult kontoga seotud õpilased on valitavad.</p></div></div>
      {studentsState.loading ? <LoadingState label="Laen õpilasi…" /> : studentsState.error ? <ErrorState message={studentsState.error} /> : studentsState.items.length ? <div className="live-start-form">
        <div className="search-field"><Search size={18} /><Input aria-label="Otsi õpilast tunniks" placeholder="Otsi õpilast…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <Select label="Õpilane" value={selectedId} onChange={(event) => { const id = event.target.value; setSelectedId(id); const student = studentsState.items.find((item) => item.id === id); setTitle(student?.subject || ''); }}><option value="">Vali õpilane</option>{visibleStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.subject || 'Õppeaine puudub'} · {student.level || 'tase puudub'}</option>)}</Select>
        <Input label="Tunni pealkiri" value={title} maxLength={160} placeholder="Näiteks: Eesti keel · minevik" onChange={(event) => setTitle(event.target.value)} />
        <Button loading={saving === 'create'} onClick={sendInvitation}><GraduationCap size={18} /> Kutsu õpilane tundi</Button>
      </div> : <EmptyState title="Kontoga seotud õpilasi ei ole" description="Seo õpilase kaart tema kasutajakontoga, et saaksid talle tunnikutsungi saata." />}
    </Card></>}
  </div>;
}
