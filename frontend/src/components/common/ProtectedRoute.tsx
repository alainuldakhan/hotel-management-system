import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types/enums';

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
  guestRedirect?: string;
}

export default function ProtectedRoute({ children, roles, guestRedirect = '/login' }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to={guestRedirect} replace />;

  if (roles && user && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
