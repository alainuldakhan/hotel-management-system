import client from './client';
import type { UserDto } from '../types/api';

export const profileApi = {
  get: () => client.get<UserDto>('/profile'),
  update: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    client.put('/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    client.post('/profile/change-password', data),
};
