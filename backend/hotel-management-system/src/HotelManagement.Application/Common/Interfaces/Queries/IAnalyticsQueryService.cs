using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

/// <summary>
/// Dapper Query-сервис для аналитики — сложные SQL-запросы с агрегацией.
/// Идеальный кандидат для Dapper вместо EF Core.
/// </summary>
public interface IAnalyticsQueryService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default);
    Task<IEnumerable<RevenueByPeriodDto>> GetRevenueByPeriodAsync(
        DateTime from, DateTime to, string groupBy, CancellationToken ct = default);
    Task<IEnumerable<OccupancyByRoomTypeDto>> GetOccupancyByRoomTypeAsync(
        DateTime from, DateTime to, CancellationToken ct = default);
    Task<IEnumerable<TopGuestDto>> GetTopGuestsAsync(int count = 10, CancellationToken ct = default);

    /// <summary>
    /// KPI отеля за период: ADR, RevPAR, ALOS, OccupancyPercent, Rooms on Books.
    /// </summary>
    Task<HotelKpiDto> GetKpiStatsAsync(DateTime from, DateTime to, CancellationToken ct = default);
}
