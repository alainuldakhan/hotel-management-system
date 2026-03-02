export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  CheckedIn = 'CheckedIn',
  CheckedOut = 'CheckedOut',
  Cancelled = 'Cancelled',
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
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
}

export enum MaintenanceStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum MaintenancePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum HousekeepingStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum HousekeepingTaskType {
  Cleaning = 'Cleaning',
  LaundryChange = 'LaundryChange',
  Maintenance = 'Maintenance',
  Inspection = 'Inspection',
  Turndown = 'Turndown',
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
