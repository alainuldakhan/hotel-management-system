using Dapper;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class BookingQueryService : DapperQueryBase, IBookingQueryService
{
    public BookingQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<BookingDetailDto?> GetByIdAsync(Guid bookingId, CancellationToken ct = default)
        => await GetBookingDetail("b.id = @Id", new { Id = bookingId }, ct);

    public async Task<BookingDetailDto?> GetByQrTokenAsync(string qrToken, CancellationToken ct = default)
        => await GetBookingDetail("b.qr_code_token = @QrToken", new { QrToken = qrToken }, ct);

    public async Task<IEnumerable<BookingListItemDto>> GetGuestBookingsAsync(
        Guid guestId, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                b.id                                                AS Id,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.guests_count                                      AS GuestsCount,
                CASE b.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'CheckedIn' WHEN 4 THEN 'CheckedOut' WHEN 5 THEN 'Cancelled' WHEN 6 THEN 'NoShow' ELSE b.status::text END AS Status,
                CASE b.payment_status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Paid' WHEN 3 THEN 'PartiallyPaid' WHEN 4 THEN 'Refunded' WHEN 5 THEN 'Failed' ELSE b.payment_status::text END AS PaymentStatus,
                b.total_amount                                      AS TotalAmount,
                b.created_at                                        AS CreatedAt
            FROM bookings b
            JOIN rooms r        ON r.id  = b.room_id
            JOIN room_types rt  ON rt.id = r.room_type_id
            JOIN users u        ON u.id  = b.guest_id
            WHERE b.guest_id = @GuestId
            ORDER BY b.created_at DESC
            """;

        return await QueryAsync<BookingListItemDto>(sql, new { GuestId = guestId }, ct);
    }

    public async Task<PagedResultDto<BookingListItemDto>> GetPagedAsync(
        BookingFilterDto filter, CancellationToken ct = default)
    {
        var whereClauses = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(filter.Status) &&
            Enum.TryParse<BookingStatus>(filter.Status, out var statusEnum))
        {
            whereClauses.Add("b.status = @Status");
            parameters.Add("Status", (int)statusEnum);
        }
        if (!string.IsNullOrWhiteSpace(filter.PaymentStatus) &&
            Enum.TryParse<PaymentStatus>(filter.PaymentStatus, out var paymentEnum))
        {
            whereClauses.Add("b.payment_status = @PaymentStatus");
            parameters.Add("PaymentStatus", (int)paymentEnum);
        }
        if (filter.CheckInFrom.HasValue)
        {
            whereClauses.Add("b.check_in_date >= @CheckInFrom");
            parameters.Add("CheckInFrom", filter.CheckInFrom);
        }
        if (filter.CheckInTo.HasValue)
        {
            whereClauses.Add("b.check_in_date <= @CheckInTo");
            parameters.Add("CheckInTo", filter.CheckInTo);
        }
        if (filter.GuestId.HasValue)
        {
            whereClauses.Add("b.guest_id = @GuestId");
            parameters.Add("GuestId", filter.GuestId);
        }
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            whereClauses.Add("(u.email ILIKE @Search OR r.number ILIKE @Search OR u.first_name ILIKE @Search OR u.last_name ILIKE @Search)");
            parameters.Add("Search", $"%{filter.SearchTerm}%");
        }

        var where = whereClauses.Count > 0
            ? "WHERE " + string.Join(" AND ", whereClauses)
            : "";

        var offset = (filter.Page - 1) * filter.PageSize;
        parameters.Add("Limit", filter.PageSize);
        parameters.Add("Offset", offset);

        var countSql = $"""
            SELECT COUNT(*)
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            {where}
            """;

        var dataSql = $"""
            SELECT
                b.id                                                AS Id,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.guests_count                                      AS GuestsCount,
                CASE b.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'CheckedIn' WHEN 4 THEN 'CheckedOut' WHEN 5 THEN 'Cancelled' WHEN 6 THEN 'NoShow' ELSE b.status::text END AS Status,
                CASE b.payment_status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Paid' WHEN 3 THEN 'PartiallyPaid' WHEN 4 THEN 'Refunded' WHEN 5 THEN 'Failed' ELSE b.payment_status::text END AS PaymentStatus,
                b.total_amount                                      AS TotalAmount,
                b.created_at                                        AS CreatedAt
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            {where}
            ORDER BY b.created_at DESC
            LIMIT @Limit OFFSET @Offset
            """;

        using var connection = _connectionFactory.CreateConnection();
        var totalCount = await connection.QuerySingleAsync<int>(countSql, parameters);
        var items = await connection.QueryAsync<BookingListItemDto>(dataSql, parameters);

        return new PagedResultDto<BookingListItemDto>(items, totalCount, filter.Page, filter.PageSize);
    }

    // Приватный метод для переиспользования логики получения деталей брони
    private async Task<BookingDetailDto?> GetBookingDetail(
        string condition, object param, CancellationToken ct)
    {
        var sql = $"""
            SELECT
                b.id                                                AS Id,
                b.room_id                                           AS RoomId,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                b.guest_id                                          AS GuestId,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                u.phone_number                                      AS GuestPhone,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.guests_count                                      AS GuestsCount,
                CASE b.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'CheckedIn' WHEN 4 THEN 'CheckedOut' WHEN 5 THEN 'Cancelled' WHEN 6 THEN 'NoShow' ELSE b.status::text END AS Status,
                CASE b.payment_status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Paid' WHEN 3 THEN 'PartiallyPaid' WHEN 4 THEN 'Refunded' WHEN 5 THEN 'Failed' ELSE b.payment_status::text END AS PaymentStatus,
                b.total_amount                                      AS TotalAmount,
                b.paid_amount                                       AS PaidAmount,
                b.qr_code_token                                     AS QrCodeToken,
                b.special_requests                                  AS SpecialRequests,
                b.actual_check_in                                   AS ActualCheckIn,
                b.actual_check_out                                  AS ActualCheckOut,
                b.created_at                                        AS CreatedAt
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            WHERE {condition}
            """;

        var booking = await QueryFirstOrDefaultAsync<BookingDetailRaw>(sql, param, ct);
        if (booking is null) return null;

        // Отдельным запросом получаем услуги бронирования
        var servicesSql = """
            SELECT
                s.name          AS ServiceName,
                bs.quantity     AS Quantity,
                bs.unit_price   AS UnitPrice,
                bs.quantity * bs.unit_price AS TotalPrice
            FROM booking_services bs
            JOIN additional_services s ON s.id = bs.additional_service_id
            WHERE bs.booking_id = @BookingId
            """;

        var services = await QueryAsync<BookingServiceItemDto>(
            servicesSql, new { BookingId = booking.Id }, ct);

        return new BookingDetailDto(
            booking.Id, booking.RoomId, booking.RoomNumber, booking.RoomTypeName,
            booking.GuestId, booking.GuestFullName, booking.GuestEmail, booking.GuestPhone,
            booking.CheckInDate, booking.CheckOutDate, booking.NightsCount, booking.GuestsCount,
            booking.Status, booking.PaymentStatus, booking.TotalAmount, booking.PaidAmount,
            booking.QrCodeToken, booking.SpecialRequests,
            booking.ActualCheckIn, booking.ActualCheckOut,
            services.ToList(), booking.CreatedAt
        );
    }

    public async Task<List<RoomGridRowDto>> GetGridAsync(
        DateTime startDate, DateTime endDate, CancellationToken ct = default)
    {
        // Все активные номера
        var roomsSql = """
            SELECT
                r.id            AS RoomId,
                r.number        AS RoomNumber,
                r.floor         AS Floor,
                rt.name         AS RoomTypeName,
                CASE r.status WHEN 1 THEN 'Available' WHEN 2 THEN 'Occupied' WHEN 3 THEN 'Cleaning' WHEN 4 THEN 'Maintenance' WHEN 5 THEN 'OutOfService' ELSE r.status::text END AS RoomStatus
            FROM rooms r
            JOIN room_types rt ON rt.id = r.room_type_id
            WHERE r.is_active = true
            ORDER BY r.floor, r.number
            """;

        // Брони, пересекающиеся с [startDate, endDate]
        var bookingsSql = """
            SELECT
                b.id                                                AS Id,
                b.room_id                                           AS RoomId,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                CASE b.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'CheckedIn' WHEN 4 THEN 'CheckedOut' WHEN 5 THEN 'Cancelled' WHEN 6 THEN 'NoShow' ELSE b.status::text END AS Status
            FROM bookings b
            JOIN users u ON u.id = b.guest_id
            WHERE b.status NOT IN (5)
              AND b.check_in_date  < @EndDate
              AND b.check_out_date > @StartDate
            ORDER BY b.check_in_date
            """;

        using var connection = _connectionFactory.CreateConnection();
        var rooms    = (await connection.QueryAsync<RoomGridRaw>(roomsSql)).ToList();
        var bookings = (await connection.QueryAsync<BookingGridRaw>(
            bookingsSql, new { StartDate = startDate, EndDate = endDate })).ToList();

        var bookingsByRoom = bookings.GroupBy(b => b.RoomId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return rooms.Select(r =>
        {
            var roomBookings = bookingsByRoom.TryGetValue(r.RoomId, out var bList)
                ? bList.Select(b => new BookingGridItemDto(
                    b.Id, b.GuestFullName, b.CheckInDate, b.CheckOutDate, b.NightsCount, b.Status
                  )).ToList()
                : new List<BookingGridItemDto>();

            return new RoomGridRowDto(
                r.RoomId, r.RoomNumber, r.Floor, r.RoomTypeName, r.RoomStatus, roomBookings);
        }).ToList();
    }

    public async Task<IEnumerable<BookingListItemDto>> GetTomorrowCheckInsAsync(CancellationToken ct = default)
    {
        var tomorrow = DateTime.UtcNow.Date.AddDays(1);
        var sql = """
            SELECT
                b.id                                                AS Id,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.guests_count                                      AS GuestsCount,
                CASE b.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'CheckedIn' WHEN 4 THEN 'CheckedOut' WHEN 5 THEN 'Cancelled' WHEN 6 THEN 'NoShow' ELSE b.status::text END AS Status,
                CASE b.payment_status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Paid' WHEN 3 THEN 'PartiallyPaid' WHEN 4 THEN 'Refunded' WHEN 5 THEN 'Failed' ELSE b.payment_status::text END AS PaymentStatus,
                b.total_amount                                      AS TotalAmount,
                b.created_at                                        AS CreatedAt
            FROM bookings b
            JOIN rooms r        ON r.id  = b.room_id
            JOIN room_types rt  ON rt.id = r.room_type_id
            JOIN users u        ON u.id  = b.guest_id
            WHERE b.check_in_date::date = @Tomorrow
              AND b.status = 2
            ORDER BY b.check_in_date
            """;

        return await QueryAsync<BookingListItemDto>(sql, new { Tomorrow = tomorrow }, ct);
    }

    // ── Front Desk ────────────────────────────────────────────────────────────

    public async Task<IEnumerable<ArrivalItemDto>> GetArrivalsAsync(
        DateTime date, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                b.id                                                AS BookingId,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                u.phone_number                                      AS GuestPhone,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.guests_count                                      AS GuestsCount,
                b.total_amount                                      AS TotalAmount,
                CASE b.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'CheckedIn' WHEN 4 THEN 'CheckedOut' WHEN 5 THEN 'Cancelled' WHEN 6 THEN 'NoShow' ELSE b.status::text END AS Status,
                b.special_requests                                  AS SpecialRequests
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            WHERE b.check_in_date::date = @Date
              AND b.status IN (2, 3)
            ORDER BY b.check_in_date, r.number
            """;
        return await QueryAsync<ArrivalItemDto>(sql, new { Date = date.Date }, ct);
    }

    public async Task<IEnumerable<DepartureItemDto>> GetDeparturesAsync(
        DateTime date, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                b.id                                                AS BookingId,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.total_amount                                      AS TotalAmount,
                b.paid_amount                                       AS PaidAmount,
                CASE b.payment_status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Paid' WHEN 3 THEN 'PartiallyPaid' WHEN 4 THEN 'Refunded' WHEN 5 THEN 'Failed' ELSE b.payment_status::text END AS PaymentStatus
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            WHERE b.check_out_date::date = @Date
              AND b.status = 3
            ORDER BY b.check_out_date, r.number
            """;
        return await QueryAsync<DepartureItemDto>(sql, new { Date = date.Date }, ct);
    }

    public async Task<IEnumerable<InHouseGuestDto>> GetInHouseGuestsAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                b.id                                                AS BookingId,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                u.email                                             AS GuestEmail,
                u.phone_number                                      AS GuestPhone,
                r.number                                            AS RoomNumber,
                rt.name                                             AS RoomTypeName,
                b.check_in_date                                     AS CheckInDate,
                b.check_out_date                                    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.actual_check_in                                   AS ActualCheckIn,
                b.total_amount                                      AS TotalAmount,
                CASE b.payment_status WHEN 1 THEN 'Pending' WHEN 2 THEN 'Paid' WHEN 3 THEN 'PartiallyPaid' WHEN 4 THEN 'Refunded' WHEN 5 THEN 'Failed' ELSE b.payment_status::text END AS PaymentStatus
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            WHERE b.status = 3
            ORDER BY r.number
            """;
        return await QueryAsync<InHouseGuestDto>(sql, ct: ct);
    }

    public async Task<IEnumerable<ForecastDayDto>> GetForecastAsync(
        int days, CancellationToken ct = default)
    {
        var sql = """
            WITH date_series AS (
                SELECT generate_series(
                    CURRENT_DATE,
                    CURRENT_DATE + (@Days - 1) * INTERVAL '1 day',
                    '1 day'::interval
                )::date AS forecast_date
            ),
            room_count AS (
                SELECT COUNT(*) AS total FROM rooms WHERE is_active = true
            )
            SELECT
                ds.forecast_date                                    AS Date,
                COUNT(b.id)::int                                    AS BookedRooms,
                rc.total::int                                       AS TotalRooms,
                ROUND(COUNT(b.id) * 100.0 / NULLIF(rc.total, 0), 2) AS OccupancyPercent,
                COALESCE(SUM(b.total_amount /
                    NULLIF(DATE_PART('day', b.check_out_date - b.check_in_date), 0)), 0) AS ProjectedRevenue
            FROM date_series ds
            CROSS JOIN room_count rc
            LEFT JOIN bookings b ON b.status IN (2, 3)
                AND b.check_in_date <= ds.forecast_date
                AND b.check_out_date > ds.forecast_date
            GROUP BY ds.forecast_date, rc.total
            ORDER BY ds.forecast_date
            """;
        return await QueryAsync<ForecastDayDto>(sql, new { Days = days }, ct);
    }
    private class RoomGridRaw
    {
        public Guid RoomId { get; init; }
        public string RoomNumber { get; init; } = "";
        public int Floor { get; init; }
        public string RoomTypeName { get; init; } = "";
        public string RoomStatus { get; init; } = "";
    }

    private class BookingGridRaw
    {
        public Guid Id { get; init; }
        public Guid RoomId { get; init; }
        public string GuestFullName { get; init; } = "";
        public DateTime CheckInDate { get; init; }
        public DateTime CheckOutDate { get; init; }
        public int NightsCount { get; init; }
        public string Status { get; init; } = "";
    }

    private class BookingDetailRaw
    {
        public Guid Id { get; init; }
        public Guid RoomId { get; init; }
        public string RoomNumber { get; init; } = "";
        public string RoomTypeName { get; init; } = "";
        public Guid GuestId { get; init; }
        public string GuestFullName { get; init; } = "";
        public string GuestEmail { get; init; } = "";
        public string? GuestPhone { get; init; }
        public DateTime CheckInDate { get; init; }
        public DateTime CheckOutDate { get; init; }
        public int NightsCount { get; init; }
        public int GuestsCount { get; init; }
        public string Status { get; init; } = "";
        public string PaymentStatus { get; init; } = "";
        public decimal TotalAmount { get; init; }
        public decimal? PaidAmount { get; init; }
        public string? QrCodeToken { get; init; }
        public string? SpecialRequests { get; init; }
        public DateTime? ActualCheckIn { get; init; }
        public DateTime? ActualCheckOut { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
