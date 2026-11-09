import { Suspense } from 'react';
import { lazyComponent } from './lazyComponent.js';
import PageErrorBoundary from './PageErrorBoundary.jsx';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/ui/index.js';
import ForbiddenPage from '../features/auth/ForbiddenPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import HomePage from './HomePage.jsx';
import { ACCESS } from './accessPolicy.js';
import { loadAppShell } from './shellPrefetch.js';

// the signed-in shell is not in /login's first download; main.jsx starts loading it early (shellPrefetch.js)
const AppShell = lazyComponent(loadAppShell);

// The worksheet generator (with its Estonian form lexicon) is loaded only on its own staff pages.
const GeneratorCoveragePage = lazyComponent(() => import('../features/worksheet-generator/ui/GeneratorCoveragePage.jsx'));
const LessonWorksheetSet = lazyComponent(() => import('../features/worksheet-generator/ui/LessonWorksheetSet.jsx'));
// the constructor (drag & drop, floating panels, text formatting) loads only when it is opened
const WorksheetStudioPage = lazyComponent(() => import('../features/worksheet-studio/WorksheetStudioPage.jsx'));
const StudentWorksheetStudioPage = lazyComponent(() => import('../features/students/StudentWorksheetStudioPage.jsx'));
const LessonWorksheetStudioPage = lazyComponent(() => import('../features/worksheet-generator/ui/LessonWorksheetStudioPage.jsx'));
const AvastaUpgradePage = lazyComponent(() => import('../features/worksheet-generator/ui/AvastaUpgradePage.jsx'));
const Module1ThreePhasePage = lazyComponent(() => import('../features/worksheet-generator/ui/Module1ThreePhasePage.jsx'));
const CourseProductionPage = lazyComponent(() => import('../features/worksheet-generator/ui/CourseProductionPage.jsx'));
const CourseHealthPage = lazyComponent(() => import('../features/worksheet-generator/ui/CourseHealthPage.jsx'));
const PracticePreviewPage = lazyComponent(() => import('../features/practice/PracticePreviewPage.jsx'));
// pages only staff open: downloaded when opened, so a student's or parent's first load stays small
const CalendarPage = lazyComponent(() => import('../features/calendar/CalendarPage.jsx'));
const UnmarkedLessonsPage = lazyComponent(() => import('../features/calendar/UnmarkedLessonsPage.jsx'));
const FinanceWorkspacePage = lazyComponent(() => import('../features/finance/FinanceWorkspacePage.jsx'));
const FinanceMonthPage = lazyComponent(() => import('../features/finance/FinanceMonthPage.jsx'));
const FinanceSettingsPage = lazyComponent(() => import('../features/finance/FinanceSettingsPage.jsx'));
const AccountingPage = lazyComponent(() => import('../features/accounting/AccountingPage.jsx'));
const PurchasesPage = lazyComponent(() => import('../features/purchases/PurchasesPage.jsx'));
const Inf3Page = lazyComponent(() => import('../features/tax/Inf3Page.jsx'));
// the recipient's own e-mail settings: the link at the bottom of every e-mail to students and parents (no login)
const EmailPreferencesPage = lazyComponent(() => import('../features/learner/EmailPreferencesPage.jsx'));
const TaxFormPage = lazyComponent(() => import('../features/tax/TaxFormPage.jsx'));
const ExpensesPage = lazyComponent(() => import('../features/expenses/ExpensesPage.jsx'));
const GroupsPage = lazyComponent(() => import('../features/groups/GroupsPage.jsx'));
const LibraryPage = lazyComponent(() => import('../features/library/LibraryPage.jsx'));
const AvailabilityPollPage = lazyComponent(() => import('../features/availability-poll/AvailabilityPollPage.jsx'));
const RaamatukoguPage = lazyComponent(() => import('../features/library/raamatukogu/RaamatukoguPage.jsx'));
const AiConnectPage = lazyComponent(() => import('../features/settings/AiConnectPage.jsx'));
const ConversionQueuePage = lazyComponent(() => import('../features/worksheet-studio/ConversionQueuePage.jsx'));
const BookPage = lazyComponent(() => import('../features/worksheet-studio/BookPage.jsx'));
const LiveWorksheetPage = lazyComponent(() => import('../features/worksheet-studio/LiveWorksheetPage.jsx'));
const ParentsPage = lazyComponent(() => import('../features/parents/ParentsPage.jsx'));
const CashPage = lazyComponent(() => import('../features/cash/CashPage.jsx'));
const PayrollPage = lazyComponent(() => import('../features/payroll/PayrollPage.jsx'));
const StudentsPage = lazyComponent(() => import('../features/students/StudentsPage.jsx'));
const StudentProfilePage = lazyComponent(() => import('../features/students/StudentProfilePage.jsx'));
const TasksPage = lazyComponent(() => import('../features/tasks/TasksPage.jsx'));
const TeachersPage = lazyComponent(() => import('../features/teachers/TeachersPage.jsx'));
const AccountsPage = lazyComponent(() => import('../features/accounts/AccountsPage.jsx'));
const LeadsPage = lazyComponent(() => import('../features/leads/LeadsPage.jsx'));
const TeacherProfilePage = lazyComponent(() => import('../features/teachers/TeacherProfilePage.jsx'));
const TeacherLoadPage = lazyComponent(() => import('../features/teachers/TeacherLoadPage.jsx'));
const TrashPage = lazyComponent(() => import('../features/trash/TrashPage.jsx'));
const AnnouncementsAdminPage = lazyComponent(() => import('../features/announcements/AnnouncementsAdminPage.jsx'));
const CampaignsPage = lazyComponent(() => import('../features/campaigns/CampaignsPage.jsx'));
// „Minu areng”: the course and all results load only when the student opens them, not with his home page
const StudentProgressPage = lazyComponent(() => import('../features/students/StudentProgressPage.jsx'));
const LiveObserverPage = lazyComponent(() => import('../features/live-classroom/LiveObserverPage.jsx'));
// the pages of every role: each role downloads its own page, not all of them on the first load
const HomeworkPage = lazyComponent(() => import('../features/homework/HomeworkPage.jsx'));
const WhatsNewPage = lazyComponent(() => import('../features/guide/WhatsNew.jsx'));
const DeviceCheckPage = lazyComponent(() => import('../features/device-check/DeviceCheckPage.jsx'));
const GuestLessonPage = lazyComponent(() => import('../features/live-classroom/GuestLessonPage.jsx'));
const PayInvoicePage = lazyComponent(() => import('../features/payments/PayInvoicePage.jsx'));
const LiveClassroomPage = lazyComponent(() => import('../features/live-classroom/LiveClassroomPage.jsx'));
const PetPage = lazyComponent(() => import('../features/pet/PetPage.jsx'));
const MistakesPage = lazyComponent(() => import('../features/self-study/MistakesPage.jsx'));
const MonologuePage = lazyComponent(() => import('../features/monologue/MonologuePage.jsx'));
const MessagesPage = lazyComponent(() => import('../features/messages/MessagesPage.jsx'));
const ParentDashboardPage = lazyComponent(() => import('../features/parents/ParentDashboardPage.jsx'));
const StudentDashboardPage = lazyComponent(() => import('../features/students/StudentDashboardPage.jsx'));
// „Harjuta” (owner 2026-11-09): the student's daily practice flow, its own tab after „Täna”
const StudentPracticePage = lazyComponent(() => import('../features/students/StudentPracticePage.jsx'));
const VocabularyPage = lazyComponent(() => import('../features/vocabulary/VocabularyPage.jsx'));
const ClientErrorsPage = lazyComponent(() => import('../features/client-errors/ClientErrorsPage.jsx'));
const SettingsPage = lazyComponent(() => import('../features/settings/SettingsPage.jsx'));
const BoardPage = lazyComponent(() => import('../features/board/BoardPage.jsx'));
const StudentCoursePage = lazyComponent(() => import('../features/self-study/StudentCoursePage.jsx'));
const TeacherGuidePage = lazyComponent(() => import('../features/guide/TeacherGuidePage.jsx'));
const staffPage = (element) => <PageErrorBoundary><Suspense fallback={<LoadingState label="Laen…" />}>{element}</Suspense></PageErrorBoundary>;
// public links for parents and learners (no login, no app shell): a full-screen bilingual loading view instead of a
// blank page while the page code downloads. No error boundary here on purpose — behaviour stays as it was.
const publicPage = (element) => <Suspense fallback={<LoadingState page label="Laen… · Загрузка…" />}>{element}</Suspense>;
const generatorPage = (element) => <PageErrorBoundary><Suspense fallback={<LoadingState label="Laen generaatorit…" />}>{element}</Suspense></PageErrorBoundary>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registreeru" element={<LoginPage initialMode="register" />} />
      <Route path="/register" element={<Navigate to="/registreeru" replace />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      {/* the lesson link for a student without a login (functions/live-guest.js) — no account, one lesson only */}
      <Route path="/tund/:token" element={staffPage(<GuestLessonPage />)} />
      {/* LHV LinkPay: public pay link from the invoice PDF / e-mail and the bank's return page */}
      <Route path="/maksa/:invoiceId" element={staffPage(<PayInvoicePage />)} />
      {/* „Sobivad ajad”: a public page the school sends to a learner to mark every hour that really suits a lesson */}
      <Route path="/ajad" element={publicPage(<AvailabilityPollPage />)} />
      {/* parents' INF 3 form (docs/INF3.md): no login, a one-time link from the school */}
      <Route path="/maksuandmed/:token" element={publicPage(<TaxFormPage />)} />
      {/* „Seadme kontroll”: camera, microphone, speakers, network before the first lesson — no login (guests too) */}
      <Route path="/kontroll" element={staffPage(<DeviceCheckPage />)} />
      {/* e-mails to students and parents: turn them off or choose the language (docs/EMAIL_NOTIFICATIONS.md) */}
      <Route path="/e-kirjad/:token" element={publicPage(<EmailPreferencesPage />)} />
      <Route element={<ProtectedRoute roles={ACCESS.ALL_AUTHENTICATED} />}>
        <Route element={staffPage(<AppShell />)}>
          {/* HomePage itself sends students to /student and parents to /parent; staff see the dashboard */}
          <Route index element={<HomePage />} />
          <Route element={<ProtectedRoute roles={ACCESS.STAFF} />}>
            <Route path="guide" element={staffPage(<TeacherGuidePage />)} />
            <Route path="uuendused" element={staffPage(<WhatsNewPage />)} />
            <Route path="students" element={staffPage(<StudentsPage />)} />
            <Route path="students/:studentId" element={staffPage(<StudentProfilePage />)} />
            <Route path="students/:studentId/worksheets/:lessonId" element={generatorPage(<StudentWorksheetStudioPage />)} />
            <Route path="calendar" element={staffPage(<CalendarPage />)} />
            <Route path="calendar/markimata" element={staffPage(<UnmarkedLessonsPage />)} />
            <Route path="tasks" element={staffPage(<TasksPage />)} />
            <Route path="groups" element={staffPage(<GroupsPage />)} />
            <Route path="library" element={staffPage(<LibraryPage />)} />
            <Route path="library/raamatukogu" element={staffPage(<RaamatukoguPage />)} />
            <Route path="library/worksheets/convert" element={staffPage(<ConversionQueuePage />)} />
            <Route path="library/worksheets/book" element={staffPage(<BookPage />)} />
            <Route path="library/worksheets/live/:assignmentId" element={staffPage(<LiveWorksheetPage />)} />
            <Route path="library/worksheet-generator" element={generatorPage(<GeneratorCoveragePage />)} />
            <Route path="library/harjutused" element={generatorPage(<PracticePreviewPage />)} />
            <Route path="library/lessons/:lessonId/worksheets" element={generatorPage(<LessonWorksheetSet />)} />
            <Route path="library/lessons/:lessonId/worksheets/:worksheetId" element={generatorPage(<LessonWorksheetStudioPage />)} />
            <Route path="library/worksheets/:lessonId" element={generatorPage(<WorksheetStudioPage />)} />
            <Route path="parents" element={staffPage(<ParentsPage />)} />
            <Route path="kassa" element={staffPage(<CashPage />)} />
            <Route path="board/:studentId" element={staffPage(<BoardPage />)} />
            <Route path="leads" element={staffPage(<LeadsPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.LIVE_CLASSROOM} />}>
            <Route path="live-classroom" element={staffPage(<LiveClassroomPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.ADMIN} />}>
            {/* administrator watching a lesson going on now (receive-only; both sides see it) */}
            <Route path="live-classroom/vaatle/:invitationId" element={staffPage(<LiveObserverPage />)} />
            {/* course production and maintenance: the links are in the administrator's Õppevara menu */}
            <Route path="library/worksheet-generator/avasta-module-1" element={generatorPage(<AvastaUpgradePage />)} />
            <Route path="library/worksheet-generator/module-1-three-phase" element={generatorPage(<Module1ThreePhasePage />)} />
            <Route path="library/worksheet-generator/course" element={generatorPage(<CourseProductionPage />)} />
            <Route path="library/worksheet-generator/health" element={generatorPage(<CourseHealthPage />)} />
            <Route path="teachers" element={staffPage(<TeachersPage />)} />
            <Route path="accounts" element={staffPage(<AccountsPage />)} />
            {/* „Õpetajate koormus” (admin): lessons, free time, reviews, unmarked lessons and pay estimate per teacher */}
            <Route path="teachers/koormus" element={staffPage(<TeacherLoadPage />)} />
            <Route path="teachers/:teacherId" element={staffPage(<TeacherProfilePage />)} />
            {/* „Prügikast” (administrator 2026-11-03): deleted student and teacher cards, 7 days, „Taasta” */}
            <Route path="trash" element={staffPage(<TrashPage />)} />
            {/* „Vead” (admin 2026-11-04): errors reported from people's browsers (clientErrors), Seaded → Tehniline */}
            <Route path="vead" element={staffPage(<ClientErrorsPage />)} />
            {/* „Teated” (owner 2026-10-24): announcements a student / parent answers before using the CRM */}
            <Route path="messages/teated" element={staffPage(<AnnouncementsAdminPage />)} />
            {/* „Kampaaniad” (owner 2026-10-27): offers, ad campaigns and events prepared here, posted by hand */}
            <Route path="kampaaniad" element={staffPage(<CampaignsPage />)} />
            {/* the ChatGPT plugin „KeeleSepp AI” asks the administrator for access (OAuth, functions/keelesepp-ai-mcp.js) */}
            <Route path="ai/connect" element={staffPage(<AiConnectPage />)} />
          </Route>
          <Route path="settings" element={staffPage(<SettingsPage />)} />
          <Route element={<ProtectedRoute roles={ACCESS.HOMEWORK} />}>
            <Route path="homework" element={staffPage(<HomeworkPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.MESSAGES} />}>
            <Route path="messages" element={staffPage(<MessagesPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.PARENT} />}>
            <Route path="parent" element={staffPage(<ParentDashboardPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.BOARD} />}>
            <Route path="board" element={staffPage(<BoardPage />)} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.STUDENT} />}>
            <Route path="student" element={staffPage(<StudentDashboardPage />)} />
            <Route path="student/areng" element={staffPage(<StudentProgressPage />)} />
            <Route path="student/sonavara" element={staffPage(<VocabularyPage />)} />
            <Route path="student/lemmik" element={staffPage(<PetPage />)} />
            <Route path="student/vead" element={staffPage(<MistakesPage />)} />
            <Route path="student/harjuta" element={staffPage(<StudentPracticePage />)} />
            {/* „Kuu monoloog” (owner 2026-11-04): opened from its task in „Ülesanded”, not from the home page */}
            <Route path="student/monoloog" element={staffPage(<MonologuePage />)} />
            {/* „Kordamine” became „Minu vead” (+ words in Sõnad), owner 2026-10-12 */}
            {/* „Minu kursus” (owner 2026-10-23): the course map; self-study cards open the sheets themselves */}
            <Route path="student/kursus" element={staffPage(<StudentCoursePage />)} />
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
