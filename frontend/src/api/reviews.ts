import client from './client';
import type { ReviewDto, PagedResult } from '../types/api';

export const reviewsApi = {
  getAll: (params?: { page?: number; pageSize?: number }) =>
    client.get<PagedResult<ReviewDto>>('/reviews', { params }),
  create: (data: { bookingId: string; rating: number; comment?: string }) =>
    client.post<ReviewDto>('/reviews', data),
  delete: (id: string) => client.delete(`/reviews/${id}`),
};
