import apiClient from './client';
import type { UserProfileDto } from '../types/api';

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const profileApi = {
  getProfile: () => apiClient.get<UserProfileDto>('/profile').then((r) => r.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch('/profile', payload),
};
