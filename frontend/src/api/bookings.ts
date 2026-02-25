import apiClient from './client';
import type {
  BookingDetailDto,
  BookingFilterParams,
  BookingListItemDto,
  CreateBookingRequest,
  PagedResult,
  RoomGridRowDto,
} from '../types/api';

export const bookingsApi = {
  getAll: (params?: BookingFilterParams) =>
    apiClient.get<PagedResult<BookingListItemDto>>('/bookings', { params }).then((r) => r.data),

  getMy: () =>
    apiClient.get<BookingDetailDto[]>('/bookings/my').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<BookingDetailDto>(`/bookings/${id}`).then((r) => r.data),

  create: (data: CreateBookingRequest) =>
    apiClient.post<{ id: string }>('/bookings', data).then((r) => r.data),

  confirm: (id: string) => apiClient.post(`/bookings/${id}/confirm`),

  checkIn: (id: string) => apiClient.post(`/bookings/${id}/check-in`),

  checkOut: (id: string) => apiClient.post(`/bookings/${id}/check-out`),

  cancel: (id: string, reason?: string) =>
    apiClient.post(`/bookings/${id}/cancel`, { reason }),

  addService: (id: string, serviceId: string, quantity = 1) =>
    apiClient.post(`/bookings/${id}/services`, { serviceId, quantity }),

  removeService: (id: string, serviceId: string) =>
    apiClient.delete(`/bookings/${id}/services/${serviceId}`),

  getGrid: (startDate: string, endDate: string) =>
    apiClient
      .get<RoomGridRowDto[]>('/bookings/grid', { params: { startDate, endDate } })
      .then((r) => r.data),
};
