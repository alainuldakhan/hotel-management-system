import client from './client';
import type { DashboardStatsDto, RevenueByPeriodDto, OccupancyByRoomTypeDto, KpiStatsDto, TopGuestDto } from '../types/api';

export const analyticsApi = {
  getDashboard: () => client.get<DashboardStatsDto>('/analytics/dashboard'),
  getRevenue: (from: string, to: string, groupBy: 'day' | 'week' | 'month' = 'day') =>
    client.get<RevenueByPeriodDto[]>('/analytics/revenue', { params: { from, to, groupBy } }),
  getOccupancy: (from: string, to: string) =>
    client.get<OccupancyByRoomTypeDto[]>('/analytics/occupancy', { params: { from, to } }),
  getTopGuests: (count: number = 10) =>
    client.get<TopGuestDto[]>('/analytics/top-guests', { params: { count } }),
  getKpi: (from: string, to: string) =>
    client.get<KpiStatsDto>('/analytics/kpi', { params: { from, to } }),
};
