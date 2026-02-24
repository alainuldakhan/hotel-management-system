import { UserRole } from '../types/enums';

export const STAFF_ROLES = [
  UserRole.Receptionist,
  UserRole.HousekeepingStaff,
  UserRole.MaintenanceStaff,
  UserRole.Manager,
  UserRole.SuperAdmin,
];

export const MANAGER_ROLES = [UserRole.Manager, UserRole.SuperAdmin];

export const RECEPTIONIST_ROLES = [
  UserRole.Receptionist,
  UserRole.Manager,
  UserRole.SuperAdmin,
];

export function hasAnyRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

export const roleLabels: Record<UserRole, string> = {
  [UserRole.Guest]: 'Гость',
  [UserRole.Receptionist]: 'Рецепционист',
  [UserRole.HousekeepingStaff]: 'Горничная',
  [UserRole.MaintenanceStaff]: 'Технический персонал',
  [UserRole.Manager]: 'Менеджер',
  [UserRole.SuperAdmin]: 'Администратор',
};
