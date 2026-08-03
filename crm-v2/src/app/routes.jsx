import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ForbiddenPage from '../features/auth/ForbiddenPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import PlaceholderPage from '../features/common/PlaceholderPage.jsx';
import CalendarPage from '../features/calendar/CalendarPage.jsx';
import FinancePage from '../features/finance/FinancePage.jsx';
import HomeworkPage from '../features/homework/HomeworkPage.jsx';
import MessagesPage from '../features/messages/MessagesPage.jsx';
import StudentsPage from '../features/students/StudentsPage.jsx';
import StudentProfilePage from '../features/students/StudentProfilePage.jsx';
import TeachersPage from '../features/teachers/TeachersPage.jsx';
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
          </Route>
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}><Route path="teachers" element={<TeachersPage />} /><Route path="settings" element={<PlaceholderPage eyebrow="Süsteem" title="Seaded" description="Kasutajad, õigused, integratsioonid ja kooli profiil." />} /></Route>
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.FINANCE]} />}><Route path="finance" element={<FinancePage />} /></Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
