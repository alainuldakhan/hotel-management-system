import client from './client';
import type { RoomTypeDto } from '../types/api';

export const roomTypesApi = {
  getAll: () => client.get<RoomTypeDto[]>('/room-types'),
  getById: (id: string) => client.get<RoomTypeDto>(`/room-types/${id}`),
  create: (data: { name: string; description?: string; basePrice: number; capacity: number; amenities?: string[] }) =>
    client.post<RoomTypeDto>('/room-types', data),
  update: (id: string, data: { name?: string; description?: string; basePrice?: number; capacity?: number; amenities?: string[] }) =>
    client.put(`/room-types/${id}`, data),
  delete: (id: string) => client.delete(`/room-types/${id}`),
};
