import client from './client';
import type { PricingRuleDto } from '../types/api';

export const pricingRulesApi = {
  getAll: () => client.get<PricingRuleDto[]>('/pricing-rules'),
  getById: (id: string) => client.get<PricingRuleDto>(`/pricing-rules/${id}`),
  create: (data: {
    name: string;
    multiplier: number;
    startDate?: string;
    endDate?: string;
    applicableDays?: number[];
    minOccupancyPercent?: number;
    maxDaysBeforeCheckIn?: number;
    roomTypeId?: string;
  }) => client.post<PricingRuleDto>('/pricing-rules', data),
  update: (id: string, data: {
    name?: string;
    multiplier?: number;
    startDate?: string;
    endDate?: string;
    applicableDays?: number[];
    minOccupancyPercent?: number;
    maxDaysBeforeCheckIn?: number;
    roomTypeId?: string;
    isActive?: boolean;
  }) => client.put<PricingRuleDto>(`/pricing-rules/${id}`, data),
  delete: (id: string) => client.delete(`/pricing-rules/${id}`),
};
