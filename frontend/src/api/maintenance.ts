import client from './client';
import type { MaintenanceRequestDto, PagedResult } from '../types/api';

export const maintenanceApi = {
  getAll: (params?: { page?: number; pageSize?: number; status?: string; priority?: string; roomId?: string }) =>
    client.get<PagedResult<MaintenanceRequestDto>>('/maintenance', { params }),
  getById: (id: string) => client.get<MaintenanceRequestDto>(`/maintenance/${id}`),
  create: (data: { roomId: string; title: string; description?: string; priority: string }) =>
    client.post<MaintenanceRequestDto>('/maintenance', data),
  update: (id: string, data: { title?: string; description?: string; priority?: string; status?: string; assignedToId?: string }) =>
    client.put(`/maintenance/${id}`, data),
  updateStatus: (id: string, status: string) =>
    client.patch(`/maintenance/${id}/status`, { status }),
};
