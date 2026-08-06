import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ForbiddenPage from '../features/auth/ForbiddenPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import CalendarPage from '../features/calendar/CalendarPage.jsx';
import FinanceWorkspacePage from '../features/finance/FinanceWorkspacePage.jsx';
import ExpensesPage from '../features/expenses/ExpensesPage.jsx';
import HomeworkPage from '../features/homework/HomeworkPage.jsx';
import GroupsPage from '../features/groups/GroupsPage.jsx';
import LibraryPage from '../features/library/LibraryPage.jsx';
import LiveClassroomPage from '../features/live-classroom/LiveClassroomPage.jsx';
import MessagesPage from '../features/messages/MessagesPage.jsx';
import ParentsPage from '../features/parents/ParentsPage.jsx';
import PayrollPage from '../features/payroll/PayrollPage.jsx';
import ParentDashboardPage from '../features/parents/ParentDashboardPage.jsx';
import StudentsPage from '../features/students/StudentsPage.jsx';
import StudentProfilePage from '../features/students/StudentProfilePage.jsx';
import StudentDashboardPage from '../features/students/StudentDashboardPage.jsx';
import TeachersPage from '../features/teachers/TeachersPage.jsx';
import TeacherProfilePage from '../features/teachers/TeacherProfilePage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { ROLES } from '../utils/roles.js';
import HomePage from './HomePage.jsx';

const staffRoles = [ROLES.ADMIN, ROLES.TEACHER];
const allRoles = Object.values(ROLES);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route element={<ProtectedRoute roles={allRoles} />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route element={<ProtectedRoute roles={staffRoles} />}>
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:studentId" element={<StudentProfilePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="parents" element={<ParentsPage />} />
            <Route path="live-classroom" element={<LiveClassroomPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}><Route path="teachers" element={<TeachersPage />} /><Route path="teachers/:teacherId" element={<TeacherProfilePage />} /></Route>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route element={<ProtectedRoute roles={[ROLES.PARENT]} />}><Route path="parent" element={<ParentDashboardPage />} /></Route>
          <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}><Route path="student" element={<StudentDashboardPage />} /></Route>
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.FINANCE]} />}><Route path="finance" element={<FinanceWorkspacePage />} /></Route>
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}><Route path="finance/payroll" element={<PayrollPage />} /><Route path="finance/expenses" element={<ExpensesPage />} /></Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
