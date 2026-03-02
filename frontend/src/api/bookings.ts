import client from './client';
import type { BookingDto, PagedResult } from '../types/api';

export const bookingsApi = {
  getAll: (params?: { page?: number; pageSize?: number; status?: string; guestId?: string; roomId?: string; from?: string; to?: string }) =>
    client.get<PagedResult<BookingDto>>('/bookings', { params }),
  getById: (id: string) => client.get<BookingDto>(`/bookings/${id}`),
  create: (data: {
    guestId: string; roomId: string; checkInDate: string; checkOutDate: string;
    notes?: string; serviceIds?: string[];
  }) => client.post<BookingDto>('/bookings', data),
  update: (id: string, data: { notes?: string; serviceIds?: string[] }) =>
    client.put(`/bookings/${id}`, data),
  cancel: (id: string, reason?: string) =>
    client.post(`/bookings/${id}/cancel`, { reason }),
  confirm: (id: string) => client.post(`/bookings/${id}/confirm`),
  checkIn: (id: string) => client.post(`/bookings/${id}/check-in`),
  checkOut: (id: string) => client.post(`/bookings/${id}/check-out`),
  checkInByQr: (qrToken: string) => client.post('/bookings/check-in/qr', { qrToken }),
  addService: (id: string, serviceId: string, quantity = 1) =>
    client.post(`/bookings/${id}/services`, { serviceId, quantity }),
  removeService: (id: string, serviceId: string) =>
    client.delete(`/bookings/${id}/services/${serviceId}`),
  getGrid: (from: string, to: string) =>
    client.get<BookingDto[]>('/bookings/grid', { params: { from, to } }),
};
