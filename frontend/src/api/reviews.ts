import apiClient from './client';
import type { PagedResult, ReviewDto, RoomTypeRatingDto } from '../types/api';

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  getAll: (roomTypeId?: string, page = 1, pageSize = 20) =>
    apiClient
      .get<PagedResult<ReviewDto>>('/reviews', { params: { roomTypeId, page, pageSize } })
      .then((r) => r.data),

  getRatings: () =>
    apiClient.get<RoomTypeRatingDto[]>('/reviews/ratings').then((r) => r.data),

  create: (payload: CreateReviewPayload) =>
    apiClient.post<{ id: string }>('/reviews', payload).then((r) => r.data),
};
