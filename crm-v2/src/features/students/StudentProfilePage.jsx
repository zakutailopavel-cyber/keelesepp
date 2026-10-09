import { Archive, ArrowLeft, BookOpenCheck, CalendarDays, Pencil, ReceiptText, PenLine, Plus, RotateCcw } from 'lucide-react';
import '../board/board.css';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Modal } from '../../components/ui/index.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentsService } from '../../services/firebase/students.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { ROLES } from '../../utils/roles.js';
import { studentValueLabel } from '../../utils/studentPrivacy.js';
import { facebookContact, instagramContact } from '../../utils/socialLinks.js';
import { canonicalTeacherName, isSameTeacher } from '../../utils/teachers.js';
import StudentFinancePanel from './StudentFinancePanel.jsx';
import StudentLessonsPanel from './StudentLessonsPanel.jsx';
import StudentWorksPanel from './StudentWorksPanel.jsx';
import { homeworkService } from '../../services/firebase/homework.js';
import BillingSettingsCard from './BillingSettingsCard.jsx';
import { revenuePlansService } from '../../services/firebase/revenuePlans.js';
import StudentForm from './StudentForm.jsx';
import { teacherChoices, useTeacherNames } from './useTeacherNames.js';
import './studentProfileTabs.css';
import StudentRecordingsPanel from '../lesson-recording/StudentRecordingsPanel.jsx';
import InitialAssessmentPanel from '../initial-assessment/InitialAssessmentPanel.jsx';
import PetOverview from '../pet/PetOverview.jsx';
import { initialAssessmentsService } from '../../services/firebase/initialAssessments.js';

// Admin: the student's Facebook / Instagram with links to the profile and to a direct message
function SocialRow({ label, contact }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{contact ? <span className="student-social"><a href={contact.profileUrl} target="_blank" rel="noreferrer">{contact.label}</a><a className="button button--secondary student-social__write" href={contact.messageUrl} target="_blank" rel="noreferrer">Kirjuta</a></span> : '—'}</dd>
    </div>
  );
}

const PROFILE_TABS = [
  { id: 'overview', label: 'Ülevaade' },
  { id: 'lessons', label: 'Tunnid' },
  { id: 'works', label: 'Tööd' },
  { id: 'learning', label: 'Areng' },
  { id: 'assessment', label: 'Esmane hindamine' },
  { id: 'finance', label: 'Finantsid', financeOnly: true },
];

export default function StudentProfilePage({ studentApi = studentsService, lessonApi = lessonsService, invoiceApi = invoicesService, scheduleApi = scheduleService, planApi = revenuePlansService, assessmentApi = initialAssessmentsService, homeworkApi = homeworkService, petApi, teacherApi, actor }) {
  const { studentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useContext(AuthContext);
  const currentUser = actor || auth?.user || { roles: [ROLES.ADMIN], displayName: '' };
  const canAssignTeacher = currentUser.roles?.includes(ROLES.ADMIN);
  const staffTeachers = useTeacherNames(canAssignTeacher, teacherApi);
  const canViewFinance = currentUser.roles?.some((role) => [ROLES.ADMIN, ROLES.FINANCE].includes(role));
  const teacherScope = canAssignTeacher ? '' : canonicalTeacherName(currentUser.displayName);
  const [state, setState] = useState({ loading: true, error: null, forbidden: false, student: null, lessons: [], invoices: [], schedule: [], plan: null });
  const [editing, setEditing] = useState(false);
  // admin: archive (or restore) the student right from the card; the same action as in the list „Õpilased”
  const [archiveAsk, setArchiveAsk] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState(() => PROFILE_TABS.some((tab) => tab.id === searchParams.get('tab')) ? searchParams.get('tab') : 'overview');

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const student = await studentApi.getById(studentId);
      if (!student) {
        setState({ loading: false, error: null, forbidden: false, student: null, lessons: [], invoices: [], schedule: [] });
        return;
      }
      if (!canAssignTeacher && !isSameTeacher(student.teacher, teacherScope)) {
        setState({ loading: false, error: null, forbidden: true, student: null, lessons: [], invoices: [], schedule: [] });
        return;
      }
      const [lessons, schedule, invoices, plan] = await Promise.all([
        lessonApi.listByStudent(studentId),
        scheduleApi.listByStudent(studentId),
        canViewFinance ? invoiceApi.listByStudent(studentId) : Promise.resolve([]),
        canViewFinance ? planApi.get(studentId).catch(() => null) : Promise.resolve(null),
      ]);
      setState({ loading: false, error: null, forbidden: false, student, lessons, invoices, schedule, plan });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: new Error(firebaseErrorMessage(error)) }));
    }
  }, [canAssignTeacher, canViewFinance, invoiceApi, lessonApi, planApi, scheduleApi, studentApi, studentId, teacherScope]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!canViewFinance && activeTab === 'finance') setActiveTab('overview');
  }, [activeTab, canViewFinance]);

  const progress = useMemo(() => Object.entries(state.student?.skillMap || {}).sort((a, b) => b[1] - a[1]).slice(0, 12), [state.student]);
  const visibleTabs = PROFILE_TABS.filter((tab) => !tab.financeOnly || canViewFinance);

  if (state.loading) return <div className="page-content"><Card><LoadingState label="Laen õpilase profiili…" /></Card></div>;
  if (state.error) return <div className="page-content"><Card><ErrorState message={state.error.message} onRetry={load} /></Card></div>;
  if (state.forbidden) return <div className="page-content"><Card><ErrorState title="Ligipääs puudub" message="Õpilane ei ole määratud sinu õpetajakontole." /></Card></div>;
  if (!state.student) return <div className="page-content"><Card><EmptyState title="Õpilast ei leitud" action={<Link className="button button--secondary" to="/students">Tagasi nimekirja</Link>} /></Card></div>;

  const { student } = state;
  const tracks = (student.enrollments || []).filter((track) => track.active !== false && track.subject);
  const tabPanelId = `student-profile-panel-${activeTab}`;
  const initials = String(student.name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="page-content">
      <Link className="back-link" to="/students"><ArrowLeft size={17} /> Kõik õpilased</Link>
      {notice ? <div className="success-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
      <header className="student-profile-hero">
        <div className="student-profile-hero__identity"><i>{initials}</i><span><Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Aktiivne õpilane' : 'Arhiveeritud'}</Badge><h1>{student.name}</h1><p>{student.subject || 'Õppeaine määramata'} · {student.level || 'tase määramata'} → {student.targetLevel || 'sihttase määramata'}</p></span></div>
        <div className="student-profile-hero__stats"><div><BookOpenCheck size={17} /><span><strong>{state.lessons.length}</strong><small>tundi</small></span></div><div><CalendarDays size={17} /><span><strong>{state.schedule.length}</strong><small>graafikus</small></span></div>{canViewFinance ? <div><ReceiptText size={17} /><span><strong>{state.invoices.length}</strong><small>arvet</small></span></div> : null}</div>
        <div className="student-profile-hero__actions"><Link className="button button--primary" to={`/students/${encodeURIComponent(student.id)}/worksheets/new`}><Plus size={17} /> Koosta tööleht</Link><Link className="button button--secondary" to={`/board/${student.id}`}><PenLine size={17} /> Ava tahvel</Link><Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={17} /> Muuda andmeid</Button>{canAssignTeacher ? <Button variant={student.active ? 'secondary' : 'primary'} onClick={() => { setArchiveError(''); setArchiveAsk(true); }}>{student.active ? <><Archive size={17} /> Arhiveeri</> : <><RotateCcw size={17} /> Taasta</>}</Button> : null}</div>
        <Modal open={archiveAsk} title={student.active ? 'Arhiveeri õpilane' : 'Taasta õpilane'} onClose={() => !archiving && setArchiveAsk(false)} footer={<><Button variant="secondary" disabled={archiving} onClick={() => setArchiveAsk(false)}>Loobu</Button><Button variant={student.active ? 'danger' : 'primary'} loading={archiving} onClick={async () => {
          setArchiving(true); setArchiveError('');
          try {
            const result = await (student.active ? studentApi.archive([student.id]) : studentApi.restore([student.id]));
            setState((current) => ({ ...current, student: { ...current.student, active: result?.active ?? !student.active } }));
            setArchiveAsk(false);
          } catch (error) { setArchiveError(firebaseErrorMessage(error)); } finally { setArchiving(false); }
        }}>{student.active ? 'Arhiveeri' : 'Taasta'}</Button></>}>
          <p>Kas {student.active ? 'arhiveerida' : 'taastada'} <strong>{student.name}</strong>? {student.active ? 'Arhiveeritud õpilane kaob aktiivsete nimekirjast ja kalendri valikutest; ID, tunnid, arved ja ajalugu säilivad ning teda saab hiljem taastada.' : 'Õpilane tuleb tagasi aktiivsete nimekirja.'}</p>
          {archiveError ? <p className="form-error" role="alert">{archiveError}</p> : null}
        </Modal>
      </header>

      <nav className="student-profile-tabs" role="tablist" aria-label="Õpilase profiili jaotised">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`student-profile-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`student-profile-panel-${tab.id}`}
            className={activeTab === tab.id ? 'is-active' : ''}
            onClick={() => { setActiveTab(tab.id); setSearchParams(tab.id === 'overview' ? {} : { tab: tab.id }, { replace: true }); }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div id={tabPanelId} role="tabpanel" aria-labelledby={`student-profile-tab-${activeTab}`} className="student-profile-tab-panel">
        {activeTab === 'overview' ? (
          <div className="profile-grid">
            <Card><h2>Põhiandmed</h2><dl className="detail-list"><div><dt>Lapsevanem</dt><dd>{studentValueLabel(student, 'parentName')}</dd></div><div><dt>E-post</dt><dd>{studentValueLabel(student, 'email')}</dd></div><div><dt>Telefon</dt><dd>{studentValueLabel(student, 'phone')}</dd></div><div><dt>{tracks.length > 1 ? 'Õppesuunad' : 'Õpetaja'}</dt><dd>{student.hiddenFields?.teacher ? 'Peidetud' : tracks.length > 1 ? tracks.map((track) => <span className="profile-track" key={track.id || track.subject}>{track.subject} — {canonicalTeacherName(track.teacher) || 'õpetaja määramata'}</span>) : canonicalTeacherName(student.teacher) || 'Määramata'}</dd></div><div><dt>Rühm</dt><dd>{student.group || '—'}</dd></div><div><dt>Klass</dt><dd>{student.grade || '—'}</dd></div>{canAssignTeacher ? <SocialRow label="Facebook" contact={facebookContact(student.facebook)} /> : null}{canAssignTeacher ? <SocialRow label="Instagram" contact={instagramContact(student.instagram)} /> : null}</dl></Card>
            <Card><h2>Õppeülevaade</h2><dl className="detail-list"><div><dt>Tase</dt><dd>{student.level || '—'}</dd></div><div><dt>Sihttase</dt><dd>{student.targetLevel || '—'}</dd></div><div><dt>Õppeaine</dt><dd>{student.subject || '—'}</dd></div><div><dt>Tunde kokku</dt><dd>{state.lessons.length}</dd></div><div><dt>Graafikukirjeid</dt><dd>{state.schedule.length}</dd></div></dl></Card>
            <PetOverview studentIds={[student.id]} lessons={state.lessons} {...(petApi ? { repository: petApi } : {})} />
          </div>
        ) : null}

        {activeTab === 'lessons' ? (
          <StudentLessonsPanel
            student={student}
            lessons={state.lessons}
            schedule={state.schedule}
            canManage={canAssignTeacher}
            lessonApi={lessonApi}
            user={currentUser}
            onChanged={(lessons) => setState((current) => ({ ...current, lessons }))}
          />
        ) : null}

        {activeTab === 'works' ? (
          <div className="profile-grid">
            <StudentWorksPanel student={student} user={currentUser} homeworkApi={homeworkApi} onSkillMap={(skillMap) => setState((current) => ({ ...current, student: { ...current.student, skillMap } }))} />
          </div>
        ) : null}

        {activeTab === 'learning' ? (
          <div className="profile-grid">
            <Card className="profile-wide"><h2>Areng</h2>{progress.length ? <div className="progress-list">{progress.map(([skill, score]) => <div key={skill}><span>{skill}</span><div><i style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div><strong>{score}%</strong></div>)}</div> : <EmptyState title="Oskuste tulemusi ei ole veel salvestatud" />}</Card>
            <StudentRecordingsPanel student={student} user={currentUser} isAdmin={canAssignTeacher} />
          </div>
        ) : null}

        {activeTab === 'assessment' ? <InitialAssessmentPanel student={student} user={currentUser} service={assessmentApi} /> : null}

        {activeTab === 'finance' && canViewFinance ? <>
          <BillingSettingsCard student={student} plan={state.plan} canEdit={canAssignTeacher}
            onSave={async (values) => { const plan = await planApi.save(student, values, currentUser, state.plan); setState((current) => ({ ...current, plan })); }} />
          <StudentFinancePanel student={student} invoices={state.invoices} />
        </> : null}
      </div>

      <StudentForm open={editing} student={student} teachers={teacherChoices(staffTeachers, [student.teacher])} canAssignTeacher={canAssignTeacher} defaultTeacher={teacherScope} onClose={() => setEditing(false)} onSubmit={async (values) => { const safeValues = canAssignTeacher ? values : { ...values, teacher: student.teacher || teacherScope }; await studentApi.update(student.id, safeValues); await load(); setNotice('Õpilase andmed on salvestatud.'); }} />
    </div>
  );
}
