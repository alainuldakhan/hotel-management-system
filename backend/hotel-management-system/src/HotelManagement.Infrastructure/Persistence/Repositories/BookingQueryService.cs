using Dapper;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

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
                b.status::text                                      AS Status,
                b.payment_status::text                              AS PaymentStatus,
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

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            whereClauses.Add("b.status::text = @Status");
            parameters.Add("Status", filter.Status);
        }
        if (!string.IsNullOrWhiteSpace(filter.PaymentStatus))
        {
            whereClauses.Add("b.payment_status::text = @PaymentStatus");
            parameters.Add("PaymentStatus", filter.PaymentStatus);
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
                b.status::text                                      AS Status,
                b.payment_status::text                              AS PaymentStatus,
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
                b.status::text                                      AS Status,
                b.payment_status::text                              AS PaymentStatus,
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
