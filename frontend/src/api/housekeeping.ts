import client from './client';
import type { HousekeepingTaskDto, PagedResult } from '../types/api';

export const housekeepingApi = {
  getAll: (params?: { page?: number; pageSize?: number; status?: string; roomId?: string; date?: string }) =>
    client.get<PagedResult<HousekeepingTaskDto>>('/housekeeping', { params }),
  getById: (id: string) => client.get<HousekeepingTaskDto>(`/housekeeping/${id}`),
  create: (data: { roomId: string; taskType: string; notes?: string; scheduledFor?: string; assignedToId?: string }) =>
    client.post<HousekeepingTaskDto>('/housekeeping', data),
  update: (id: string, data: { status?: string; notes?: string; assignedToId?: string }) =>
    client.put(`/housekeeping/${id}`, data),
  complete: (id: string) => client.post(`/housekeeping/${id}/complete`),
};
