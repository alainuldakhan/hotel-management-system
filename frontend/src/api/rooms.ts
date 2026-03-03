import client from './client';
import type { RoomDto, RoomBlockDto } from '../types/api';

export const roomsApi = {
  getAll: () => client.get<RoomDto[]>('/rooms'),
  getById: (id: string) => client.get<RoomDto>(`/rooms/${id}`),
  create: (data: { number: string; floor: number; roomTypeId: string; description?: string }) =>
    client.post<RoomDto>('/rooms', data),
  update: (id: string, data: { number?: string; floor?: number; roomTypeId?: string; description?: string }) =>
    client.put(`/rooms/${id}`, data),
  delete: (id: string) => client.delete(`/rooms/${id}`),
  changeStatus: (id: string, status: string) =>
    client.patch(`/rooms/${id}/status`, { status }),
  blockRoom: (id: string, data: { blockedFrom: string; blockedTo: string; reason: string }) =>
    client.post(`/rooms/${id}/block`, data),
  unblockRoom: (id: string, blockId: string) =>
    client.delete(`/rooms/${id}/block/${blockId}`),
  getBlocks: (id: string) => client.get<RoomBlockDto[]>(`/rooms/${id}/blocks`),
};
