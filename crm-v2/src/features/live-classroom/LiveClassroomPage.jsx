import { CheckCircle2, Clock3, GraduationCap, Search, Video, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { libraryService, liveLessonCallSignalsService, liveLessonInvitationsService, liveLessonPresenceService, messagesService, studentsService } from '../../services/firebase/index.js';
import { groupBoardService, studentBoardService } from '../../services/firebase/studentBoard.js';
import { liveGroupRoomsService } from '../../services/firebase/liveGroupRooms.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { eligibleInvitationStudents, INVITATION_STATUS, isInvitationRouteUsable, newestInvitation, normalizeInvitation, timestampMillis } from './invitationModel.js';
import { calendarPathAfterLesson } from './lessonLink.js';
import LiveRoom from './LiveRoom.jsx';
import GroupRoom from './GroupRoom.jsx';
import StudentWorkspace from './StudentWorkspace.jsx';
import TeacherWorkspace from './TeacherWorkspace.jsx';
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
  groupService = liveGroupRoomsService,
  groupBoard = groupBoardService,
  groupCallOptions,
}) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitationId = searchParams.get('invitation') || '';
  const groupRoomId = searchParams.get('group') || '';
  const isStudent = user.roles?.includes('student');
  const isStaff = user.roles?.some((role) => role === 'admin' || role === 'teacher');
  const [studentsState, setStudentsState] = useState({ loading: isStaff, items: [], error: '' });
  const [invitations, setInvitations] = useState([]);
  const [streamReady, setStreamReady] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
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

  const [openGroups, setOpenGroups] = useState([]);
  useEffect(() => {
    if (!isStaff || !groupService?.subscribeTeacherOpen) return undefined;
    try { return groupService.subscribeTeacherOpen(user.uid, setOpenGroups, () => setOpenGroups([])); } catch { return undefined; }
  }, [groupService, isStaff, user.uid]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedStudent = studentsState.items.find((student) => student.id === selectedId);
  const allInvitations = useMemo(
    () => invitations.map((item) => normalizeInvitation(item.id, item, now)),
    [invitations, now],
  );
  // an invitation into a group lesson carries the group room id as roomKey; one-to-one lessons use their own id
  const isGroupInvitation = (item) => Boolean(item.roomKey && item.roomKey !== item.id);
  const normalizedInvitations = useMemo(() => (isStudent ? allInvitations : allInvitations.filter((item) => !isGroupInvitation(item))), [allInvitations, isStudent]);
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
      setSearchParams({ invitation: created.id }, { replace: true });
    } catch (error) {
      setActionError(firebaseErrorMessage(error));
    } finally {
      setSaving('');
    }
  };

  const [groupIds, setGroupIds] = useState([]);
  const inviteGroup = async () => {
    const students = studentsState.items.filter((item) => groupIds.includes(item.id));
    setSaving('group');
    setActionError('');
    try {
      const created = await groupService.create({ students, title: title || 'Grupitund' }, user);
      setGroupIds([]);
      setSearchParams({ group: created.id }, { replace: true });
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
      // the lesson is over: open it in the calendar to mark it held (topic, homework) — the usual „Toimunud” flow
      if (isStaff) navigate(calendarPathAfterLesson(activeInvitation), { replace: true });
      else setSearchParams({}, { replace: true });
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
    // the room's „Tunni lõpp” drawer already asked (and saved the summary); other callers still confirm
    onEndLesson: (options = {}) => { if (options.confirmed || globalThis.confirm('Lõpetada tund? Tunniruum suletakse mõlemale ja kalendris avaneb tund märkimiseks.')) closeRoom(); },
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

  const groupProps = { user, service: groupService, boardService: groupBoard, library: libraryRepository, ...(groupCallOptions ? { callOptions: groupCallOptions } : {}) };
  if (isStudent) {
    if (streamReady && !streamError && activeInvitation?.status === INVITATION_STATUS.ACCEPTED && isGroupInvitation(activeInvitation)) {
      return <GroupRoom key={activeInvitation.roomKey} roomId={activeInvitation.roomKey} role="student" turnInvitationId={activeInvitation.id} myInvitation={activeInvitation} recordingService={recordingService} onLeave={() => setSearchParams({}, { replace: true })} {...groupProps} />;
    }
    if (streamReady && !streamError && activeInvitation?.status === INVITATION_STATUS.ACCEPTED) return <LiveRoom key={activeInvitation.id} {...roomProps('student')} />;
    if (!streamReady) return <div className="page-content"><LoadingState label="Laen tunnikutset…" /></div>;
    return <StudentWorkspace
      user={user}
      studentRepository={studentRepository}
      boardService={boardService}
      resumable={resumable}
      onResume={() => setSearchParams({ invitation: resumable.id }, { replace: true })}
      onBack={() => navigate('/')}
      error={streamError}
    />;
  }

  if (groupRoomId) {
    const acceptedInRoom = allInvitations.filter((item) => item.roomKey === groupRoomId && item.status === INVITATION_STATUS.ACCEPTED);
    const accepted = acceptedInRoom[0];
    const groupRecordings = acceptedInRoom.map((invitation) => {
      const card = studentsState.items.find((item) => item.id === invitation.studentId);
      return { invitation, consent: card ? card.recordingConsent === true : null, subject: card?.subject || '' };
    });
    return <GroupRoom key={groupRoomId} roomId={groupRoomId} role="teacher" turnInvitationId={accepted?.id || ''} recordings={groupRecordings} recordingService={recordingService} onLeave={() => setSearchParams({}, { replace: true })} onEnd={() => setSearchParams({}, { replace: true })} {...groupProps} />;
  }

  if (activeInvitation?.status === INVITATION_STATUS.ACCEPTED) {
    return <>
      {streamError || actionError ? <div className="action-error lr-page-error" role="alert">{streamError || actionError}</div> : null}
      <LiveRoom key={activeInvitation.id} {...roomProps('teacher')} />
    </>;
  }

  const pending = activeInvitation?.status === INVITATION_STATUS.PENDING ? activeInvitation : null;
  return <TeacherWorkspace
    user={user}
    studentsState={studentsState}
    selectedId={selectedId}
    onSelect={(id) => { setSelectedId(id); const student = studentsState.items.find((item) => item.id === id); setTitle(student?.subject || ''); }}
    title={title}
    onTitle={setTitle}
    onInvite={sendInvitation}
    inviting={saving === 'create'}
    pending={pending}
    onCancel={cancel}
    cancelling={saving === 'cancel'}
    resumable={resumable}
    onResume={() => setSearchParams({ invitation: resumable.id }, { replace: true })}
    onBack={() => navigate('/')}
    error={streamError || actionError}
    boardService={boardService}
    library={libraryRepository}
    groupIds={groupIds}
    onToggleGroup={(id) => setGroupIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.length >= 4 ? current : [...current, id]))}
    onInviteGroup={inviteGroup}
    invitingGroup={saving === 'group'}
    openGroups={openGroups}
    onOpenGroup={(id) => setSearchParams({ group: id }, { replace: true })}
  />;
}
