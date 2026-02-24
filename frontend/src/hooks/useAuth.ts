import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/enums';

export function useAuth() {
  const { user, accessToken, isAuthenticated, hasRole, isStaff, logout } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated: isAuthenticated(),
    isGuest: user?.role === UserRole.Guest,
    isReceptionist: user?.role === UserRole.Receptionist,
    isHousekeeping: user?.role === UserRole.HousekeepingStaff,
    isMaintenance: user?.role === UserRole.MaintenanceStaff,
    isManager: user?.role === UserRole.Manager,
    isSuperAdmin: user?.role === UserRole.SuperAdmin,
    isManagerOrAbove: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    isStaff: isStaff(),
    hasRole,
    logout,
  };
}
