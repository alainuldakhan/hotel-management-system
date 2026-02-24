import apiClient from './client';
import type {
  CreateMaintenanceRequest,
  MaintenanceFilterParams,
  MaintenanceRequestDetailDto,
  MaintenanceRequestListItemDto,
  PagedResult,
} from '../types/api';

export const maintenanceApi = {
  getAll: (params?: MaintenanceFilterParams) =>
    apiClient
      .get<PagedResult<MaintenanceRequestListItemDto>>('/maintenance', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<MaintenanceRequestDetailDto>(`/maintenance/${id}`).then((r) => r.data),

  create: (data: CreateMaintenanceRequest) =>
    apiClient.post<{ id: string }>('/maintenance', data).then((r) => r.data),

  assign: (id: string, assignedToUserId: string) =>
    apiClient.post(`/maintenance/${id}/assign`, { assignedToUserId }),

  resolve: (id: string, resolution: string) =>
    apiClient.post(`/maintenance/${id}/resolve`, { resolution }),

  cancel: (id: string) => apiClient.post(`/maintenance/${id}/cancel`),
};
