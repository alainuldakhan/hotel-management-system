import apiClient from './client';
import type { InvoiceDto } from '../types/api';

export const invoicesApi = {
  getById: (id: string) =>
    apiClient.get<InvoiceDto>(`/invoices/${id}`).then((r) => r.data),

  getByBooking: (bookingId: string) =>
    apiClient.get<InvoiceDto[]>(`/invoices/booking/${bookingId}`).then((r) => r.data),

  generate: (bookingId: string, notes?: string) =>
    apiClient.post<{ id: string }>('/invoices', { bookingId, notes }).then((r) => r.data),

  markPaid: (id: string, paymentMethod: string, notes?: string) =>
    apiClient.post(`/invoices/${id}/mark-paid`, { paymentMethod, notes }),
};
