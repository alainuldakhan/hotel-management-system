export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  CheckedIn = 'CheckedIn',
  CheckedOut = 'CheckedOut',
  Cancelled = 'Cancelled',
  NoShow = 'NoShow',
}

export enum RoomStatus {
  Available = 'Available',
  Occupied = 'Occupied',
  Cleaning = 'Cleaning',
  Maintenance = 'Maintenance',
  OutOfService = 'OutOfService',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  PartiallyPaid = 'PartiallyPaid',
  Refunded = 'Refunded',
  Failed = 'Failed',
}

export enum MaintenanceStatus {
  New = 'New',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum MaintenancePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum HousekeepingStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum HousekeepingTaskType {
  General = 'General',
  Checkout = 'Checkout',
  Turndown = 'Turndown',
  DeepCleaning = 'DeepCleaning',
  Replenishment = 'Replenishment',
}

export enum UserRole {
  Guest = 'Guest',
  Receptionist = 'Receptionist',
  HousekeepingStaff = 'HousekeepingStaff',
  MaintenanceStaff = 'MaintenanceStaff',
  Manager = 'Manager',
  SuperAdmin = 'SuperAdmin',
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  BankTransfer = 'BankTransfer',
  Online = 'Online',
}
