import { lazy, Suspense } from 'react';
import PageErrorBoundary from './PageErrorBoundary.jsx';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/ui/index.js';
import AppShell from '../components/layout/AppShell.jsx';
import ForbiddenPage from '../features/auth/ForbiddenPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import HomeworkPage from '../features/homework/HomeworkPage.jsx';
import GuestLessonPage from '../features/live-classroom/GuestLessonPage.jsx';
import PayInvoicePage from '../features/payments/PayInvoicePage.jsx';
import LiveClassroomPage from '../features/live-classroom/LiveClassroomPage.jsx';
import PetPage from '../features/pet/PetPage.jsx';
import MistakesPage from '../features/self-study/MistakesPage.jsx';
import MessagesPage from '../features/messages/MessagesPage.jsx';
import ParentDashboardPage from '../features/parents/ParentDashboardPage.jsx';
import StudentDashboardPage from '../features/students/StudentDashboardPage.jsx';
import VocabularyPage from '../features/vocabulary/VocabularyPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import BoardPage from '../features/board/BoardPage.jsx';
import StudentCoursePage from '../features/self-study/StudentCoursePage.jsx';
import TeacherGuidePage from '../features/guide/TeacherGuidePage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import HomePage from './HomePage.jsx';
import { ACCESS } from './accessPolicy.js';

// The worksheet generator (with its Estonian form lexicon) is loaded only on its own staff pages.
const GeneratorCoveragePage = lazy(() => import('../features/worksheet-generator/ui/GeneratorCoveragePage.jsx'));
const LessonWorksheetSet = lazy(() => import('../features/worksheet-generator/ui/LessonWorksheetSet.jsx'));
// the constructor (drag & drop, floating panels, text formatting) loads only when it is opened
const WorksheetStudioPage = lazy(() => import('../features/worksheet-studio/WorksheetStudioPage.jsx'));
const StudentWorksheetStudioPage = lazy(() => import('../features/students/StudentWorksheetStudioPage.jsx'));
const LessonWorksheetStudioPage = lazy(() => import('../features/worksheet-generator/ui/LessonWorksheetStudioPage.jsx'));
const AvastaUpgradePage = lazy(() => import('../features/worksheet-generator/ui/AvastaUpgradePage.jsx'));
const Module1ThreePhasePage = lazy(() => import('../features/worksheet-generator/ui/Module1ThreePhasePage.jsx'));
const CourseProductionPage = lazy(() => import('../features/worksheet-generator/ui/CourseProductionPage.jsx'));
const CourseHealthPage = lazy(() => import('../features/worksheet-generator/ui/CourseHealthPage.jsx'));
// pages only staff open: downloaded when opened, so a student's or parent's first load stays small
const CalendarPage = lazy(() => import('../features/calendar/CalendarPage.jsx'));
const FinanceWorkspacePage = lazy(() => import('../features/finance/FinanceWorkspacePage.jsx'));
const FinanceMonthPage = lazy(() => import('../features/finance/FinanceMonthPage.jsx'));
const FinanceSettingsPage = lazy(() => import('../features/finance/FinanceSettingsPage.jsx'));
const AccountingPage = lazy(() => import('../features/accounting/AccountingPage.jsx'));
const PurchasesPage = lazy(() => import('../features/purchases/PurchasesPage.jsx'));
const Inf3Page = lazy(() => import('../features/tax/Inf3Page.jsx'));
// the recipient's own e-mail settings: the link at the bottom of every e-mail to students and parents (no login)
const EmailPreferencesPage = lazy(() => import('../features/learner/EmailPreferencesPage.jsx'));
const TaxFormPage = lazy(() => import('../features/tax/TaxFormPage.jsx'));
const ExpensesPage = lazy(() => import('../features/expenses/ExpensesPage.jsx'));
const GroupsPage = lazy(() => import('../features/groups/GroupsPage.jsx'));
const LibraryPage = lazy(() => import('../features/library/LibraryPage.jsx'));
const AvailabilityPollPage = lazy(() => import('../features/availability-poll/AvailabilityPollPage.jsx'));
const RaamatukoguPage = lazy(() => import('../features/library/raamatukogu/RaamatukoguPage.jsx'));
const ConversionQueuePage = lazy(() => import('../features/worksheet-studio/ConversionQueuePage.jsx'));
const BookPage = lazy(() => import('../features/worksheet-studio/BookPage.jsx'));
const LiveWorksheetPage = lazy(() => import('../features/worksheet-studio/LiveWorksheetPage.jsx'));
const ParentsPage = lazy(() => import('../features/parents/ParentsPage.jsx'));
const CashPage = lazy(() => import('../features/cash/CashPage.jsx'));
const PayrollPage = lazy(() => import('../features/payroll/PayrollPage.jsx'));
const StudentsPage = lazy(() => import('../features/students/StudentsPage.jsx'));
const StudentProfilePage = lazy(() => import('../features/students/StudentProfilePage.jsx'));
const TasksPage = lazy(() => import('../features/tasks/TasksPage.jsx'));
const TeachersPage = lazy(() => import('../features/teachers/TeachersPage.jsx'));
const AccountsPage = lazy(() => import('../features/accounts/AccountsPage.jsx'));
const LeadsPage = lazy(() => import('../features/leads/LeadsPage.jsx'));
const TeacherProfilePage = lazy(() => import('../features/teachers/TeacherProfilePage.jsx'));
const AnnouncementsAdminPage = lazy(() => import('../features/announcements/AnnouncementsAdminPage.jsx'));
const LiveObserverPage = lazy(() => import('../features/live-classroom/LiveObserverPage.jsx'));
const staffPage = (element) => <PageErrorBoundary><Suspense fallback={<LoadingState label="Laen…" />}>{element}</Suspense></PageErrorBoundary>;
const generatorPage = (element) => <PageErrorBoundary><Suspense fallback={<LoadingState label="Laen generaatorit…" />}>{element}</Suspense></PageErrorBoundary>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registreeru" element={<LoginPage initialMode="register" />} />
      <Route path="/register" element={<Navigate to="/registreeru" replace />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      {/* the lesson link for a student without a login (functions/live-guest.js) — no account, one lesson only */}
      <Route path="/tund/:token" element={<GuestLessonPage />} />
      {/* LHV LinkPay: public pay link from the invoice PDF / e-mail and the bank's return page */}
      <Route path="/maksa/:invoiceId" element={<PayInvoicePage />} />
      {/* „Sobivad ajad”: a public page the school sends to a learner to mark every hour that really suits a lesson */}
      <Route path="/ajad" element={<Suspense fallback={null}><AvailabilityPollPage /></Suspense>} />
      {/* parents' INF 3 form (docs/INF3.md): no login, a one-time link from the school */}
      <Route path="/maksuandmed/:token" element={<Suspense fallback={null}><TaxFormPage /></Suspense>} />
      {/* e-mails to students and parents: turn them off or choose the language (docs/EMAIL_NOTIFICATIONS.md) */}
      <Route path="/e-kirjad/:token" element={<Suspense fallback={null}><EmailPreferencesPage /></Suspense>} />
      <Route element={<ProtectedRoute roles={ACCESS.ALL_AUTHENTICATED} />}>
        <Route element={<AppShell />}>
          {/* HomePage itself sends students to /student and parents to /parent; staff see the dashboard */}
          <Route index element={<HomePage />} />
          <Route element={<ProtectedRoute roles={ACCESS.STAFF} />}>
            <Route path="guide" element={<TeacherGuidePage />} />
            <Route path="students" element={staffPage(<StudentsPage />)} />
            <Route path="students/:studentId" element={staffPage(<StudentProfilePage />)} />
            <Route path="students/:studentId/worksheets/:lessonId" element={generatorPage(<StudentWorksheetStudioPage />)} />
            <Route path="calendar" element={staffPage(<CalendarPage />)} />
            <Route path="tasks" element={staffPage(<TasksPage />)} />
            <Route path="groups" element={staffPage(<GroupsPage />)} />
            <Route path="library" element={staffPage(<LibraryPage />)} />
            <Route path="library/raamatukogu" element={staffPage(<RaamatukoguPage />)} />
            <Route path="library/worksheets/convert" element={staffPage(<ConversionQueuePage />)} />
            <Route path="library/worksheets/book" element={staffPage(<BookPage />)} />
            <Route path="library/worksheets/live/:assignmentId" element={staffPage(<LiveWorksheetPage />)} />
            <Route path="library/worksheet-generator" element={generatorPage(<GeneratorCoveragePage />)} />
            <Route path="library/worksheet-generator/avasta-module-1" element={generatorPage(<AvastaUpgradePage />)} />
            <Route path="library/worksheet-generator/module-1-three-phase" element={generatorPage(<Module1ThreePhasePage />)} />
            <Route path="library/worksheet-generator/course" element={generatorPage(<CourseProductionPage />)} />
            <Route path="library/worksheet-generator/health" element={generatorPage(<CourseHealthPage />)} />
            <Route path="library/lessons/:lessonId/worksheets" element={generatorPage(<LessonWorksheetSet />)} />
            <Route path="library/lessons/:lessonId/worksheets/:worksheetId" element={generatorPage(<LessonWorksheetStudioPage />)} />
            <Route path="library/worksheets/:lessonId" element={generatorPage(<WorksheetStudioPage />)} />
            <Route path="parents" element={staffPage(<ParentsPage />)} />
            <Route path="kassa" element={staffPage(<CashPage />)} />
            <Route path="board/:studentId" element={<BoardPage />} />
            <Route path="leads" element={staffPage(<LeadsPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.LIVE_CLASSROOM} />}>
            <Route path="live-classroom" element={<LiveClassroomPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.ADMIN} />}>
            {/* administrator watching a lesson going on now (receive-only; both sides see it) */}
            <Route path="live-classroom/vaatle/:invitationId" element={staffPage(<LiveObserverPage />)} />
            <Route path="teachers" element={staffPage(<TeachersPage />)} />
            <Route path="accounts" element={staffPage(<AccountsPage />)} />
            <Route path="teachers/:teacherId" element={staffPage(<TeacherProfilePage />)} />
            {/* „Teated” (owner 2026-10-24): announcements a student / parent answers before using the CRM */}
            <Route path="messages/teated" element={staffPage(<AnnouncementsAdminPage />)} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route element={<ProtectedRoute roles={ACCESS.PARENT} />}>
            <Route path="parent" element={<ParentDashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.BOARD} />}>
            <Route path="board" element={<BoardPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.STUDENT} />}>
            <Route path="student" element={<StudentDashboardPage />} />
            <Route path="student/sonavara" element={<VocabularyPage />} />
            <Route path="student/lemmik" element={<PetPage />} />
            <Route path="student/vead" element={<MistakesPage />} />
            {/* „Kordamine” became „Minu vead” (+ words in Sõnad), owner 2026-10-12 */}
            {/* „Minu kursus” (owner 2026-10-23): the course map; self-study cards open the sheets themselves */}
            <Route path="student/kursus" element={<StudentCoursePage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.FINANCE} />}>
            <Route path="finance" element={staffPage(<FinanceMonthPage />)} />
            <Route path="finance/seaded" element={staffPage(<FinanceSettingsPage />)} />
            <Route path="finance/vana" element={staffPage(<FinanceWorkspacePage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.ADMIN} />}>
            <Route path="finance/payroll" element={staffPage(<PayrollPage />)} />
            <Route path="finance/expenses" element={staffPage(<ExpensesPage />)} />
            <Route path="finance/raamatupidamine" element={staffPage(<AccountingPage />)} />
            <Route path="finance/ostuarved" element={staffPage(<PurchasesPage />)} />
            <Route path="finance/inf3" element={staffPage(<Inf3Page />)} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
