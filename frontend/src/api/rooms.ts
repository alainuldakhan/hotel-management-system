import apiClient from './client';
import type {
  CreateRoomRequest,
  RoomDetailDto,
  RoomListItemDto,
  RoomOccupancyStatsDto,
  UpdateRoomRequest,
} from '../types/api';
import type { RoomStatus } from '../types/enums';

export const roomsApi = {
  getAll: () =>
    apiClient.get<RoomListItemDto[]>('/rooms').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<RoomDetailDto>(`/rooms/${id}`).then((r) => r.data),

  getAvailable: (checkIn: string, checkOut: string, guestsCount: number, roomTypeId?: string) =>
    apiClient
      .get<RoomListItemDto[]>('/rooms/available', {
        params: { checkIn, checkOut, guestsCount, roomTypeId },
      })
      .then((r) => r.data),

  getOccupancyStats: () =>
    apiClient.get<RoomOccupancyStatsDto>('/rooms/occupancy-stats').then((r) => r.data),

  create: (data: CreateRoomRequest) =>
    apiClient.post<{ id: string }>('/rooms', data).then((r) => r.data),

  update: (id: string, data: UpdateRoomRequest) =>
    apiClient.put(`/rooms/${id}`, { id, ...data }),

  updateStatus: (id: string, status: RoomStatus) =>
    apiClient.patch(`/rooms/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' },
    }),

  delete: (id: string) => apiClient.delete(`/rooms/${id}`),
};
