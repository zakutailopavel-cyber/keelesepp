import { Navigate, Outlet, useLocation } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useAuth } from './AuthContext.jsx';
import { hasAnyRole } from '../utils/roles.js';

export default function ProtectedRoute({ roles = [] }) {
  const { configured, loading, user, error } = useAuth();
  const location = useLocation();

  if (!configured) return <ErrorState title="Firebase ei ole seadistatud" message="Kopeeri .env.example failiks .env ja lisa olemasoleva KeeleSepp Firebase projekti avalik veebikonfiguratsioon." />;
  if (loading) return <LoadingState label="Kontrollin kasutajaseanssi…" />;
  if (error) return <ErrorState title="Sisselogimise kontroll ebaõnnestus" message={error.message} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!hasAnyRole(user.roles, roles)) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}
