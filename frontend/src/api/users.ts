import client from './client';
import type { UserDto, PagedResult } from '../types/api';

export const usersApi = {
  getAll: (params?: { page?: number; pageSize?: number; role?: string; search?: string }) =>
    client.get<PagedResult<UserDto>>('/users', { params }),
  getById: (id: string) => client.get<UserDto>(`/users/${id}`),
  update: (id: string, data: { firstName?: string; lastName?: string; phone?: string }) =>
    client.put(`/users/${id}`, data),
  deactivate: (id: string) => client.post(`/users/${id}/deactivate`),
  activate: (id: string) => client.post(`/users/${id}/activate`),
  flagDnr: (id: string, reason: string) => client.post(`/users/${id}/dnr`, { reason }),
  unflagDnr: (id: string) => client.delete(`/users/${id}/dnr`),
  changePassword: (id: string, data: { currentPassword: string; newPassword: string }) =>
    client.post(`/users/${id}/change-password`, data),
};
