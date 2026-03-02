import { UserRole } from '../types/enums';
import { useAuthStore } from '../store/authStore';

export const usePermissions = () => {
  const { user, hasRole } = useAuthStore();

  return {
    canManageBookings: hasRole(UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin),
    canManageRooms: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    canManageUsers: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    canViewAnalytics: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    canManageMaintenance: hasRole(UserRole.MaintenanceStaff, UserRole.Manager, UserRole.SuperAdmin),
    canManageHousekeeping: hasRole(UserRole.HousekeepingStaff, UserRole.Manager, UserRole.SuperAdmin),
    canManageServices: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    canManageInvoices: hasRole(UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin),
    canViewReports: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    isGuest: user?.role === UserRole.Guest,
    isAdmin: hasRole(UserRole.Manager, UserRole.SuperAdmin),
    user,
  };
};
