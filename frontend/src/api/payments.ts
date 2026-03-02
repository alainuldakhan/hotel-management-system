import client from './client';
import type { PaymentDto } from '../types/api';

export const paymentsApi = {
  getByBooking: (bookingId: string) =>
    client.get<PaymentDto[]>(`/payments/booking/${bookingId}`),
  create: (data: { bookingId: string; amount: number; method: string; invoiceId?: string; reference?: string; notes?: string }) =>
    client.post<{ id: string }>('/payments', data),
};
