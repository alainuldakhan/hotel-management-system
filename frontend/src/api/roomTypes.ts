import apiClient from './client';
import type {
  CreateRoomTypeRequest,
  RoomTypeDetailDto,
  RoomTypeListItemDto,
  UpdateRoomTypeRequest,
} from '../types/api';

export const roomTypesApi = {
  getAll: () =>
    apiClient.get<RoomTypeListItemDto[]>('/room-types').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<RoomTypeDetailDto>(`/room-types/${id}`).then((r) => r.data),

  create: (data: CreateRoomTypeRequest) =>
    apiClient.post<{ id: string }>('/room-types', data).then((r) => r.data),

  update: (id: string, data: UpdateRoomTypeRequest) =>
    apiClient.put(`/room-types/${id}`, { id, ...data }),

  delete: (id: string) => apiClient.delete(`/room-types/${id}`),
};
