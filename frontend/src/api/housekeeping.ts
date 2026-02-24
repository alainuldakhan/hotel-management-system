import apiClient from './client';
import type {
  CreateHousekeepingTaskRequest,
  HousekeepingFilterParams,
  HousekeepingTaskDetailDto,
  HousekeepingTaskListItemDto,
  PagedResult,
} from '../types/api';

export const housekeepingApi = {
  getAll: (params?: HousekeepingFilterParams) =>
    apiClient
      .get<PagedResult<HousekeepingTaskListItemDto>>('/housekeeping', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<HousekeepingTaskDetailDto>(`/housekeeping/${id}`).then((r) => r.data),

  create: (data: CreateHousekeepingTaskRequest) =>
    apiClient.post<{ id: string }>('/housekeeping', data).then((r) => r.data),

  assign: (id: string, assignedToUserId: string) =>
    apiClient.post(`/housekeeping/${id}/assign`, { assignedToUserId }),

  complete: (id: string, completionNotes?: string) =>
    apiClient.post(`/housekeeping/${id}/complete`, { completionNotes }),

  cancel: (id: string) => apiClient.post(`/housekeeping/${id}/cancel`),
};
