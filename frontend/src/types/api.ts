import { BookingStatus, RoomStatus, PaymentStatus, MaintenanceStatus, MaintenancePriority, HousekeepingStatus, HousekeepingTaskType, UserRole, PaymentMethod } from './enums';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isDnr: boolean;
  dnrReason?: string;
  createdAt: string;
}

export interface RoomTypeDto {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
  createdAt: string;
}

export interface RoomDto {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
  roomTypeId: string;
  roomTypeName: string;
  roomTypeBasePrice: number;
  description?: string;
  createdAt: string;
}

export interface BookingDto {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  totalAmount: number;
  nightsCount: number;
  notes?: string;
  qrCodeToken?: string;
  createdAt: string;
  services?: BookingServiceDto[];
}

export interface BookingServiceDto {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
}

export interface AdditionalServiceDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  issuedAt: string;
  dueDate?: string;
  notes?: string;
}

export interface MaintenanceRequestDto {
  id: string;
  roomId: string;
  roomNumber: string;
  title: string;
  description?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedToId?: string;
  assignedToName?: string;
  reportedById: string;
  reportedByName: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface HousekeepingTaskDto {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: HousekeepingTaskType;
  status: HousekeepingStatus;
  assignedToId?: string;
  assignedToName?: string;
  notes?: string;
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ReviewDto {
  id: string;
  guestId: string;
  guestName: string;
  bookingId: string;
  roomNumber: string;
  roomTypeName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface PricingRuleDto {
  id: string;
  name: string;
  multiplier: number;
  startDate?: string;
  endDate?: string;
  applicableDays?: number[];
  minOccupancyPercent?: number;
  maxDaysBeforeCheckIn?: number;
  roomTypeId?: string;
  roomTypeName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStatsDto {
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  revenueToday: number;
  revenueThisMonth: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingMaintenance: number;
  pendingHousekeeping: number;
}

export interface RevenueByPeriodDto {
  period: string;
  revenue: number;
  bookingsCount: number;
}

export interface OccupancyByRoomTypeDto {
  roomTypeId: string;
  roomTypeName: string;
  occupancyPercent: number;
  adr: number;
  totalRevenue: number;
  totalNights: number;
}

export interface KpiStatsDto {
  adr: number;
  revPar: number;
  alos: number;
  occupancyPercent: number;
  totalRoomNightsSold: number;
  roomsOnBooks30Days: number;
  roomsOnBooks60Days: number;
  roomsOnBooks90Days: number;
}

export interface ArrivalItemDto {
  bookingId: string;
  guestName: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  nights: number;
  totalAmount: number;
}

export interface DepartureItemDto {
  bookingId: string;
  guestName: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}

export interface InHouseGuestDto {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
}

export interface ForecastDayDto {
  date: string;
  occupiedRooms: number;
  totalRooms: number;
  occupancyPercent: number;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  invoiceId?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  receivedAt: string;
  receivedByName?: string;
  notes?: string;
}

export interface RoomBlockDto {
  id: string;
  roomId: string;
  roomNumber: string;
  blockedFrom: string;
  blockedTo: string;
  reason: string;
  blockedByName?: string;
  isActive: boolean;
}

export interface TopGuestDto {
  guestId: string;
  guestName: string;
  guestEmail: string;
  totalBookings: number;
  totalSpend: number;
  lastStay?: string;
}
