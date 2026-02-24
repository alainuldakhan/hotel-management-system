export const UserRole = {
  Guest: 'Guest',
  Receptionist: 'Receptionist',
  HousekeepingStaff: 'HousekeepingStaff',
  MaintenanceStaff: 'MaintenanceStaff',
  Manager: 'Manager',
  SuperAdmin: 'SuperAdmin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RoomStatus = {
  Available: 'Available',
  Occupied: 'Occupied',
  Cleaning: 'Cleaning',
  Maintenance: 'Maintenance',
  OutOfService: 'OutOfService',
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const BookingStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  CheckedIn: 'CheckedIn',
  CheckedOut: 'CheckedOut',
  Cancelled: 'Cancelled',
  NoShow: 'NoShow',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  Pending: 'Pending',
  Paid: 'Paid',
  PartiallyPaid: 'PartiallyPaid',
  Refunded: 'Refunded',
  Failed: 'Failed',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const MaintenanceStatus = {
  New: 'New',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const MaintenancePriority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
} as const;
export type MaintenancePriority = (typeof MaintenancePriority)[keyof typeof MaintenancePriority];

export const HousekeepingStatus = {
  Pending: 'Pending',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;
export type HousekeepingStatus = (typeof HousekeepingStatus)[keyof typeof HousekeepingStatus];

export const HousekeepingTaskType = {
  General: 'General',
  Checkout: 'Checkout',
  Turndown: 'Turndown',
  DeepCleaning: 'DeepCleaning',
  Replenishment: 'Replenishment',
} as const;
export type HousekeepingTaskType = (typeof HousekeepingTaskType)[keyof typeof HousekeepingTaskType];
