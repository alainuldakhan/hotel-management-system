import client from './client';
import type { LoginResponse, UserDto } from '../types/api';

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    client.post<LoginResponse>('/auth/register', data),
  refresh: (refreshToken: string) =>
    client.post<LoginResponse>('/auth/refresh', { refreshToken }),
  me: () => client.get<UserDto>('/auth/me'),
};
