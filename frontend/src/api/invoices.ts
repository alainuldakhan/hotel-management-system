import client from './client';
import type { InvoiceDto, PagedResult } from '../types/api';

export const invoicesApi = {
  getAll: (params?: { page?: number; pageSize?: number; status?: string; from?: string; to?: string }) =>
    client.get<PagedResult<InvoiceDto>>('/invoices', { params }),
  getById: (id: string) => client.get<InvoiceDto>(`/invoices/${id}`),
  getByBooking: (bookingId: string) => client.get<InvoiceDto[]>(`/invoices/booking/${bookingId}`),
  markPaid: (id: string, paidAmount: number) => client.post(`/invoices/${id}/pay`, { paidAmount }),
};
