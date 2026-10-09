import { lazy, Suspense } from 'react';
import PageErrorBoundary from './PageErrorBoundary.jsx';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/ui/index.js';
import AppShell from '../components/layout/AppShell.jsx';
import ForbiddenPage from '../features/auth/ForbiddenPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import CalendarPage from '../features/calendar/CalendarPage.jsx';
import FinanceWorkspacePage from '../features/finance/FinanceWorkspacePage.jsx';
import FinanceMonthPage from '../features/finance/FinanceMonthPage.jsx';
import FinanceSettingsPage from '../features/finance/FinanceSettingsPage.jsx';
import ExpensesPage from '../features/expenses/ExpensesPage.jsx';
import HomeworkPage from '../features/homework/HomeworkPage.jsx';
import GroupsPage from '../features/groups/GroupsPage.jsx';
import LibraryPage from '../features/library/LibraryPage.jsx';
import WorksheetStudioPage from '../features/worksheet-studio/WorksheetStudioPage.jsx';
import ConversionQueuePage from '../features/worksheet-studio/ConversionQueuePage.jsx';
import BookPage from '../features/worksheet-studio/BookPage.jsx';
import LiveWorksheetPage from '../features/worksheet-studio/LiveWorksheetPage.jsx';
import LiveClassroomPage from '../features/live-classroom/LiveClassroomPage.jsx';
import MessagesPage from '../features/messages/MessagesPage.jsx';
import ParentsPage from '../features/parents/ParentsPage.jsx';
import PayrollPage from '../features/payroll/PayrollPage.jsx';
import ParentDashboardPage from '../features/parents/ParentDashboardPage.jsx';
import StudentsPage from '../features/students/StudentsPage.jsx';
import StudentProfilePage from '../features/students/StudentProfilePage.jsx';
import StudentWorksheetStudioPage from '../features/students/StudentWorksheetStudioPage.jsx';
import StudentDashboardPage from '../features/students/StudentDashboardPage.jsx';
import TasksPage from '../features/tasks/TasksPage.jsx';
import TeachersPage from '../features/teachers/TeachersPage.jsx';
import AccountsPage from '../features/accounts/AccountsPage.jsx';
import LeadsPage from '../features/leads/LeadsPage.jsx';
import TeacherProfilePage from '../features/teachers/TeacherProfilePage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import BoardPage from '../features/board/BoardPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import HomePage from './HomePage.jsx';
import { ACCESS } from './accessPolicy.js';

// The worksheet generator (with its Estonian form lexicon) is loaded only on its own staff pages.
const GeneratorCoveragePage = lazy(() => import('../features/worksheet-generator/ui/GeneratorCoveragePage.jsx'));
const LessonWorksheetSet = lazy(() => import('../features/worksheet-generator/ui/LessonWorksheetSet.jsx'));
const LessonWorksheetStudioPage = lazy(() => import('../features/worksheet-generator/ui/LessonWorksheetStudioPage.jsx'));
const AvastaUpgradePage = lazy(() => import('../features/worksheet-generator/ui/AvastaUpgradePage.jsx'));
const Module1ThreePhasePage = lazy(() => import('../features/worksheet-generator/ui/Module1ThreePhasePage.jsx'));
const generatorPage = (element) => <PageErrorBoundary><Suspense fallback={<LoadingState label="Laen generaatorit…" />}>{element}</Suspense></PageErrorBoundary>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registreeru" element={<LoginPage initialMode="register" />} />
      <Route path="/register" element={<Navigate to="/registreeru" replace />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route element={<ProtectedRoute roles={ACCESS.ALL_AUTHENTICATED} />}>
        <Route element={<AppShell />}>
          {/* HomePage itself sends students to /student and parents to /parent; staff see the dashboard */}
          <Route index element={<HomePage />} />
          <Route element={<ProtectedRoute roles={ACCESS.STAFF} />}>
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:studentId" element={<StudentProfilePage />} />
            <Route path="students/:studentId/worksheets/:lessonId" element={<StudentWorksheetStudioPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/worksheets/convert" element={<ConversionQueuePage />} />
            <Route path="library/worksheets/book" element={<BookPage />} />
            <Route path="library/worksheets/live/:assignmentId" element={<LiveWorksheetPage />} />
            <Route path="library/worksheet-generator" element={generatorPage(<GeneratorCoveragePage />)} />
            <Route path="library/worksheet-generator/avasta-module-1" element={generatorPage(<AvastaUpgradePage />)} />
            <Route path="library/worksheet-generator/module-1-three-phase" element={generatorPage(<Module1ThreePhasePage />)} />
            <Route path="library/lessons/:lessonId/worksheets" element={generatorPage(<LessonWorksheetSet />)} />
            <Route path="library/lessons/:lessonId/worksheets/:worksheetId" element={generatorPage(<LessonWorksheetStudioPage />)} />
            <Route path="library/worksheets/:lessonId" element={<WorksheetStudioPage />} />
            <Route path="parents" element={<ParentsPage />} />
            <Route path="board/:studentId" element={<BoardPage />} />
            <Route path="leads" element={<LeadsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.LIVE_CLASSROOM} />}>
            <Route path="live-classroom" element={<LiveClassroomPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.ADMIN} />}>
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="teachers/:teacherId" element={<TeacherProfilePage />} />
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
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.FINANCE} />}>
            <Route path="finance" element={<FinanceMonthPage />} />
            <Route path="finance/seaded" element={<FinanceSettingsPage />} />
            <Route path="finance/vana" element={<FinanceWorkspacePage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.ADMIN} />}>
            <Route path="finance/payroll" element={<PayrollPage />} />
            <Route path="finance/expenses" element={<ExpensesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
