import client from './client';
import type { ArrivalItemDto, DepartureItemDto, InHouseGuestDto, ForecastDayDto } from '../types/api';

export const frontDeskApi = {
  getArrivals: (date?: string) =>
    client.get<ArrivalItemDto[]>('/front-desk/arrivals', { params: { date } }),
  getDepartures: (date?: string) =>
    client.get<DepartureItemDto[]>('/front-desk/departures', { params: { date } }),
  getInHouse: () => client.get<InHouseGuestDto[]>('/front-desk/in-house'),
  getForecast: (days: number = 30) =>
    client.get<ForecastDayDto[]>('/front-desk/forecast', { params: { days } }),
};
