import { Navigate } from 'react-router-dom';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import { useAuth } from './AuthContext.jsx';
import { hasAnyRole, ROLES } from '../utils/roles.js';

export default function HomePage() {
  const { user } = useAuth();
  if (hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER, ROLES.FINANCE])) return <DashboardPage />;
  if (hasAnyRole(user.roles, [ROLES.PARENT])) return <Navigate to="/parent" replace />;
  return <Navigate to="/student" replace />;
}
