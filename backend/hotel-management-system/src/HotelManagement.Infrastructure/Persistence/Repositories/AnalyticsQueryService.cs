using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class AnalyticsQueryService : DapperQueryBase, IAnalyticsQueryService
{
    public AnalyticsQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                (SELECT COUNT(*) FROM rooms WHERE is_active = true)
                    AS TotalRooms,
                (SELECT COUNT(*) FROM rooms WHERE is_active = true AND status = 2)
                    AS OccupiedRooms,
                ROUND(
                    (SELECT COUNT(*) FROM rooms WHERE is_active = true AND status = 2) * 100.0
                    / NULLIF((SELECT COUNT(*) FROM rooms WHERE is_active = true), 0), 2
                )   AS OccupancyPercent,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bookings
                 WHERE DATE(created_at) = CURRENT_DATE AND status NOT IN (5))
                    AS RevenueToday,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bookings
                 WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
                   AND status NOT IN (5))
                    AS RevenueThisMonth,
                (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE)
                    AS BookingsToday,
                (SELECT COUNT(*) FROM bookings WHERE DATE(check_in_date) = CURRENT_DATE AND status = 3)
                    AS CheckInsToday,
                (SELECT COUNT(*) FROM bookings WHERE DATE(check_out_date) = CURRENT_DATE AND status = 4)
                    AS CheckOutsToday,
                (SELECT COUNT(*) FROM maintenance_requests WHERE status IN (1, 2))
                    AS PendingMaintenanceRequests,
                (SELECT COUNT(*) FROM bookings WHERE status IN (2, 3))
                    AS ActiveBookings
            """;

        return await QuerySingleAsync<DashboardStatsDto>(sql, ct: ct);
    }

    public async Task<IEnumerable<RevenueByPeriodDto>> GetRevenueByPeriodAsync(
        DateTime from, DateTime to, string groupBy, CancellationToken ct = default)
    {
        // groupBy: "day" | "week" | "month"
        var truncation = groupBy switch
        {
            "week"  => "week",
            "month" => "month",
            _       => "day"
        };

        var sql = $"""
            SELECT
                TO_CHAR(DATE_TRUNC('{truncation}', b.created_at), 'YYYY-MM-DD') AS Period,
                COALESCE(SUM(b.total_amount), 0)                                 AS Revenue,
                COUNT(b.id)                                                      AS BookingsCount,
                COALESCE(AVG(b.total_amount), 0)                                 AS AverageBookingValue
            FROM bookings b
            WHERE b.created_at BETWEEN @From AND @To
              AND b.status NOT IN (5)
            GROUP BY DATE_TRUNC('{truncation}', b.created_at)
            ORDER BY DATE_TRUNC('{truncation}', b.created_at)
            """;

        return await QueryAsync<RevenueByPeriodDto>(sql, new { From = from, To = to }, ct);
    }

    public async Task<IEnumerable<OccupancyByRoomTypeDto>> GetOccupancyByRoomTypeAsync(
        DateTime from, DateTime to, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                rt.name                                                          AS RoomTypeName,
                COUNT(DISTINCT r.id)                                             AS TotalRooms,
                ROUND(
                    COUNT(DISTINCT b.id) * 100.0
                    / NULLIF(COUNT(DISTINCT r.id) * DATE_PART('day', @To - @From), 0), 2
                )                                                                AS AverageOccupancyPercent,
                COALESCE(SUM(b.total_amount), 0)                                 AS TotalRevenue,
                COALESCE(
                    SUM(b.total_amount)
                    / NULLIF(DATE_PART('day', @To - @From) * COUNT(DISTINCT r.id), 0), 0
                )                                                                AS AverageDailyRate
            FROM room_types rt
            JOIN rooms r ON r.room_type_id = rt.id AND r.is_active = true
            LEFT JOIN bookings b ON b.room_id = r.id
                AND b.check_in_date >= @From
                AND b.check_out_date <= @To
                AND b.status NOT IN (5)
            GROUP BY rt.id, rt.name
            ORDER BY TotalRevenue DESC
            """;

        return await QueryAsync<OccupancyByRoomTypeDto>(sql, new { From = from, To = to }, ct);
    }

    public async Task<IEnumerable<TopGuestDto>> GetTopGuestsAsync(
        int count = 10, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                u.id                                                AS GuestId,
                u.first_name || ' ' || u.last_name                 AS FullName,
                u.email                                             AS Email,
                COUNT(b.id)                                         AS TotalBookings,
                COALESCE(SUM(
                    DATE_PART('day', b.check_out_date - b.check_in_date)
                )::int, 0)                                          AS TotalNights,
                COALESCE(SUM(b.total_amount), 0)                    AS TotalSpent,
                MAX(b.created_at)                                   AS LastVisit
            FROM users u
            JOIN bookings b ON b.guest_id = u.id AND b.status NOT IN (5)
            WHERE u.role = 1
            GROUP BY u.id, u.first_name, u.last_name, u.email
            ORDER BY TotalSpent DESC
            LIMIT @Count
            """;

        return await QueryAsync<TopGuestDto>(sql, new { Count = count }, ct);
    }
}
