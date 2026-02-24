import apiClient from './client';
import type { UserListItemDto } from '../types/api';
import type { UserRole } from '../types/enums';

export const usersApi = {
  getAll: () =>
    apiClient.get<UserListItemDto[]>('/users').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<UserListItemDto>(`/users/${id}`).then((r) => r.data),

  updateRole: (id: string, role: UserRole) =>
    apiClient.patch(`/users/${id}/role`, role, {
      headers: { 'Content-Type': 'application/json' },
    }),
};
