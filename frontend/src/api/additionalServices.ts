import client from './client';
import type { AdditionalServiceDto } from '../types/api';

export const servicesApi = {
  getAll: () => client.get<AdditionalServiceDto[]>('/additional-services'),
  getById: (id: string) => client.get<AdditionalServiceDto>(`/additional-services/${id}`),
  create: (data: { name: string; description?: string; price: number }) =>
    client.post<AdditionalServiceDto>('/additional-services', data),
  update: (id: string, data: { name?: string; description?: string; price?: number; isActive?: boolean }) =>
    client.put(`/additional-services/${id}`, data),
  delete: (id: string) => client.delete(`/additional-services/${id}`),
};
