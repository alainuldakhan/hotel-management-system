import apiClient from './client';
import type {
  DashboardStatsDto,
  OccupancyByRoomTypeDto,
  RevenueByPeriodDto,
  TopGuestDto,
} from '../types/api';

export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<DashboardStatsDto>('/analytics/dashboard').then((r) => r.data),

  getRevenue: (from: string, to: string, groupBy = 'month') =>
    apiClient
      .get<RevenueByPeriodDto[]>('/analytics/revenue', { params: { from, to, groupBy } })
      .then((r) => r.data),

  getOccupancyByRoomType: (from?: string, to?: string) =>
    apiClient
      .get<OccupancyByRoomTypeDto[]>('/analytics/occupancy-by-room-type', {
        params: { from, to },
      })
      .then((r) => r.data),

  getTopGuests: (top = 10) =>
    apiClient
      .get<TopGuestDto[]>('/analytics/top-guests', { params: { top } })
      .then((r) => r.data),
};
