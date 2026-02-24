import type { BookingStatus, HousekeepingStatus, HousekeepingTaskType, MaintenancePriority, MaintenanceStatus, PaymentStatus, RoomStatus, UserRole } from './enums';

// ─── Common ───────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface UserInfoDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfoDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export interface RoomListItemDto {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
  roomTypeName: string;
  maxOccupancy: number;
  pricePerNight: number;
  area: number;
  imageUrl?: string;
}

export interface RoomDetailDto {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
  notes?: string;
  roomTypeId: string;
  roomTypeName: string;
  roomTypeDescription: string;
  maxOccupancy: number;
  basePrice: number;
  area: number;
  amenities: string[];
  imageUrl?: string;
}

export interface CreateRoomRequest {
  number: string;
  floor: number;
  roomTypeId: string;
  notes?: string;
}

export interface UpdateRoomRequest {
  number: string;
  floor: number;
  roomTypeId: string;
  notes?: string;
}

export interface RoomOccupancyStatsDto {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  occupancyPercent: number;
}

// ─── Room Types ───────────────────────────────────────────────────────────────

export interface RoomTypeListItemDto {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  area: number;
  roomsCount: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface RoomTypeDetailDto {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  area: number;
  amenities: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRoomTypeRequest {
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  area: number;
  amenities?: string[];
}

export interface UpdateRoomTypeRequest {
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  area: number;
  amenities: string[];
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface BookingListItemDto {
  id: string;
  roomNumber: string;
  roomTypeName: string;
  guestFullName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  guestsCount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
}

export interface BookingServiceItemDto {
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingDetailDto {
  id: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  guestId: string;
  guestFullName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  guestsCount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount?: number;
  qrCodeToken?: string;
  specialRequests?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  services: BookingServiceItemDto[];
  createdAt: string;
}

export interface CreateBookingRequest {
  roomId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  specialRequests?: string;
}

export interface BookingFilterParams {
  page?: number;
  pageSize?: number;
  status?: string;
  paymentStatus?: string;
  checkInFrom?: string;
  checkInTo?: string;
  guestId?: string;
  roomId?: string;
  searchTerm?: string;
}

// ─── Additional Services ─────────────────────────────────────────────────────

export interface AdditionalServiceDto {
  id: string;
  name: string;
  description: string;
  price: number;
  iconUrl?: string;
  isActive: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  price: number;
}

export interface UpdateServiceRequest {
  name: string;
  description: string;
  price: number;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  roomNumber: string;
  guestFullName: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

export interface MaintenanceRequestListItemDto {
  id: string;
  title: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  roomNumber: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
}

export interface MaintenanceRequestDetailDto {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  resolution?: string;
  resolvedAt?: string;
  roomId: string;
  roomNumber: string;
  reportedByUserId: string;
  reportedBy: string;
  assignedToUserId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaintenanceRequest {
  roomId: string;
  reportedByUserId: string;
  title: string;
  description: string;
  priority?: MaintenancePriority;
}

export interface MaintenanceFilterParams {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  roomId?: string;
  assignedToUserId?: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// ─── Housekeeping ─────────────────────────────────────────────────────────────

export interface HousekeepingTaskListItemDto {
  id: string;
  type: HousekeepingTaskType;
  status: HousekeepingStatus;
  roomNumber: string;
  floor: number;
  requestedBy: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
}

export interface HousekeepingTaskDetailDto {
  id: string;
  type: HousekeepingTaskType;
  status: HousekeepingStatus;
  notes?: string;
  completionNotes?: string;
  dueDate?: string;
  completedAt?: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  requestedByUserId: string;
  requestedBy: string;
  assignedToUserId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHousekeepingTaskRequest {
  roomId: string;
  requestedByUserId: string;
  type: HousekeepingTaskType;
  notes?: string;
  dueDate?: string;
}

export interface HousekeepingFilterParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  roomId?: string;
  assignedToUserId?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStatsDto {
  totalRooms: number;
  occupiedRooms: number;
  occupancyPercent: number;
  revenueToday: number;
  revenueThisMonth: number;
  bookingsToday: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingMaintenanceRequests: number;
  activeBookings: number;
}

export interface RevenueByPeriodDto {
  period: string;
  revenue: number;
  bookingsCount: number;
  averageBookingValue: number;
}

export interface OccupancyByRoomTypeDto {
  roomTypeName: string;
  totalRooms: number;
  averageOccupancyPercent: number;
  totalRevenue: number;
  averageDailyRate: number;
}

export interface TopGuestDto {
  guestId: string;
  fullName: string;
  email: string;
  totalBookings: number;
  totalNights: number;
  totalSpent: number;
  lastVisit: string;
}
