import apiClient from './client';
import type { AdditionalServiceDto, CreateServiceRequest, UpdateServiceRequest } from '../types/api';

export const servicesApi = {
  getAll: () =>
    apiClient.get<AdditionalServiceDto[]>('/additional-services').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<AdditionalServiceDto>(`/additional-services/${id}`).then((r) => r.data),

  create: (data: CreateServiceRequest) =>
    apiClient.post<{ id: string }>('/additional-services', data).then((r) => r.data),

  update: (id: string, data: UpdateServiceRequest) =>
    apiClient.put(`/additional-services/${id}`, { id, ...data }),

  delete: (id: string) => apiClient.delete(`/additional-services/${id}`),
};
