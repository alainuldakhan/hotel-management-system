using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class AnalyticsQueryService : DapperQueryBase, IAnalyticsQueryService
{
    private readonly ICacheService _cache;

    public AnalyticsQueryService(IDbConnectionFactory connectionFactory, ICacheService cache)
        : base(connectionFactory) { _cache = cache; }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.DashboardStats,
            () => FetchDashboardStatsAsync(ct),
            TimeSpan.FromSeconds(60),
            ct);
    }

    private async Task<DashboardStatsDto> FetchDashboardStatsAsync(CancellationToken ct)
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

    public async Task<HotelKpiDto> GetKpiStatsAsync(
        DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.KpiStats(from, to),
            () => FetchKpiStatsAsync(from, to, ct),
            TimeSpan.FromMinutes(5),
            ct);
    }

    private async Task<HotelKpiDto> FetchKpiStatsAsync(
        DateTime from, DateTime to, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;

        var sql = """
            WITH period_bookings AS (
                SELECT
                    b.id,
                    b.total_amount,
                    DATE_PART('day', b.check_out_date - b.check_in_date)::int AS nights
                FROM bookings b
                WHERE b.status NOT IN (5)   -- исключаем отменённые
                  AND b.check_in_date >= @From
                  AND b.check_out_date <= @To
            ),
            room_counts AS (
                SELECT COUNT(*) AS total FROM rooms WHERE is_active = true
            ),
            adr_data AS (
                SELECT
                    COALESCE(SUM(total_amount), 0)              AS total_revenue,
                    COALESCE(SUM(nights), 0)                    AS total_room_nights,
                    COUNT(id)                                    AS total_bookings
                FROM period_bookings
            ),
            forecast AS (
                SELECT
                    COUNT(*) FILTER (WHERE check_in_date >= @Today
                        AND check_in_date < @Today + INTERVAL '30 days'
                        AND status IN (2, 3))                   AS books_30,
                    COUNT(*) FILTER (WHERE check_in_date >= @Today
                        AND check_in_date < @Today + INTERVAL '60 days'
                        AND status IN (2, 3))                   AS books_60,
                    COUNT(*) FILTER (WHERE check_in_date >= @Today
                        AND check_in_date < @Today + INTERVAL '90 days'
                        AND status IN (2, 3))                   AS books_90
                FROM bookings
            )
            SELECT
                -- ADR = Revenue / Room Nights Sold
                ROUND(
                    ad.total_revenue / NULLIF(ad.total_room_nights, 0), 2
                )                                               AS Adr,
                -- RevPAR = ADR × Occupancy%
                ROUND(
                    (ad.total_revenue / NULLIF(ad.total_room_nights, 0))
                    * (ad.total_room_nights * 100.0
                       / NULLIF(rc.total * DATE_PART('day', @To::date - @From::date), 0))
                    / 100.0, 2
                )                                               AS RevPar,
                -- ALOS = Total Nights / Total Bookings
                ROUND(
                    ad.total_room_nights::numeric / NULLIF(ad.total_bookings, 0), 2
                )                                               AS AverageLengthOfStay,
                -- Occupancy %
                ROUND(
                    ad.total_room_nights * 100.0
                    / NULLIF(rc.total * DATE_PART('day', @To::date - @From::date), 0), 2
                )                                               AS OccupancyPercent,
                ad.total_room_nights                            AS TotalRoomNightsSold,
                ad.total_revenue                                AS TotalRevenue,
                f.books_30                                      AS RoomsOnBooks30Days,
                f.books_60                                      AS RoomsOnBooks60Days,
                f.books_90                                      AS RoomsOnBooks90Days
            FROM adr_data ad
            CROSS JOIN room_counts rc
            CROSS JOIN forecast f
            """;

        return await QuerySingleAsync<HotelKpiDto>(sql, new { From = from, To = to, Today = today }, ct);
    }
}
