import { Suspense } from 'react';
import { lazyComponent } from './lazyComponent.js';
import { Navigate } from 'react-router-dom';
import { LoadingState } from '../components/ui/index.js';
import { useAuth } from './AuthContext.jsx';
import { hasAnyRole, ROLES } from '../utils/roles.js';

const DashboardPage = lazyComponent(() => import('../features/dashboard/DashboardPage.jsx'));

export default function HomePage() {
  const { user } = useAuth();
  if (hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER, ROLES.FINANCE])) return <Suspense fallback={<LoadingState label="Koostan töölauda…" />}><DashboardPage /></Suspense>;
  if (hasAnyRole(user.roles, [ROLES.PARENT])) return <Navigate to="/parent" replace />;
  return <Navigate to="/student" replace />;
}
