using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class InvoiceQueryService : DapperQueryBase, IInvoiceQueryService
{
    public InvoiceQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<IEnumerable<InvoiceDto>> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                i.id                AS Id,
                i.invoice_number    AS InvoiceNumber,
                i.booking_id        AS BookingId,
                r.number            AS RoomNumber,
                u.first_name || ' ' || u.last_name AS GuestFullName,
                i.amount            AS Amount,
                i.status::text      AS Status,
                i.payment_method    AS PaymentMethod,
                i.paid_at           AS PaidAt,
                i.notes             AS Notes,
                i.created_at        AS CreatedAt
            FROM invoices i
            JOIN bookings b ON b.id = i.booking_id
            JOIN rooms r ON r.id = b.room_id
            JOIN users u ON u.id = b.guest_id
            WHERE i.booking_id = @BookingId
            ORDER BY i.created_at DESC
            """;

        return await QueryAsync<InvoiceDto>(sql, new { BookingId = bookingId }, ct);
    }

    public async Task<InvoiceDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                i.id                AS Id,
                i.invoice_number    AS InvoiceNumber,
                i.booking_id        AS BookingId,
                r.number            AS RoomNumber,
                u.first_name || ' ' || u.last_name AS GuestFullName,
                i.amount            AS Amount,
                i.status::text      AS Status,
                i.payment_method    AS PaymentMethod,
                i.paid_at           AS PaidAt,
                i.notes             AS Notes,
                i.created_at        AS CreatedAt
            FROM invoices i
            JOIN bookings b ON b.id = i.booking_id
            JOIN rooms r ON r.id = b.room_id
            JOIN users u ON u.id = b.guest_id
            WHERE i.id = @Id
            """;

        return await QueryFirstOrDefaultAsync<InvoiceDto>(sql, new { Id = id }, ct);
    }

    public async Task<InvoiceDetailDto?> GetDetailByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                i.id                AS Id,
                i.booking_id        AS BookingId,
                i.invoice_number    AS InvoiceNumber,
                u.first_name || ' ' || u.last_name AS GuestFullName,
                u.email             AS GuestEmail,
                u.phone_number      AS GuestPhone,
                r.number            AS RoomNumber,
                rt.name             AS RoomTypeName,
                b.check_in_date     AS CheckInDate,
                b.check_out_date    AS CheckOutDate,
                DATE_PART('day', b.check_out_date - b.check_in_date)::int AS NightsCount,
                b.total_amount      AS BaseAmount,
                i.amount            AS Amount,
                i.status::text      AS Status,
                i.payment_method    AS PaymentMethod,
                i.paid_at           AS PaidAt,
                i.notes             AS Notes,
                i.created_at        AS CreatedAt
            FROM invoices i
            JOIN bookings b    ON b.id  = i.booking_id
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            WHERE i.id = @Id
            """;

        var raw = await QueryFirstOrDefaultAsync<InvoiceDetailRaw>(sql, new { Id = id }, ct);
        if (raw is null) return null;

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

        var services = await QueryAsync<InvoiceServiceLineDto>(
            servicesSql, new { BookingId = raw.BookingId }, ct);

        return new InvoiceDetailDto(
            raw.Id, raw.InvoiceNumber,
            raw.GuestFullName, raw.GuestEmail, raw.GuestPhone,
            raw.RoomNumber, raw.RoomTypeName,
            raw.CheckInDate, raw.CheckOutDate, raw.NightsCount,
            raw.BaseAmount, raw.Amount,
            raw.Status, raw.PaymentMethod, raw.PaidAt, raw.Notes, raw.CreatedAt,
            services.ToList()
        );
    }

    public async Task<IEnumerable<DailyOccupancyItemDto>> GetDailyOccupancyAsync(
        DateTime date, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                r.number            AS RoomNumber,
                rt.name             AS RoomTypeName,
                u.first_name || ' ' || u.last_name AS GuestFullName,
                u.email             AS GuestEmail,
                b.check_in_date     AS CheckInDate,
                b.check_out_date    AS CheckOutDate,
                b.status::text      AS Status,
                b.total_amount      AS TotalAmount
            FROM bookings b
            JOIN rooms r       ON r.id  = b.room_id
            JOIN room_types rt ON rt.id = r.room_type_id
            JOIN users u       ON u.id  = b.guest_id
            WHERE b.status NOT IN ('Cancelled')
              AND b.check_in_date  <= @Date
              AND b.check_out_date >  @Date
            ORDER BY r.number
            """;

        return await QueryAsync<DailyOccupancyItemDto>(sql, new { Date = date.Date }, ct);
    }


    public async Task<PagedResultDto<InvoiceDto>> GetAllPagedAsync(InvoiceFilterDto filter, CancellationToken ct = default)
    {
        var whereClauses = new List<string>();
        var parameters = new Dapper.DynamicParameters();
        if (!string.IsNullOrWhiteSpace(filter.Status)) { whereClauses.Add("i.status::text = @Status"); parameters.Add("Status", filter.Status); }
        if (filter.From.HasValue) { whereClauses.Add("i.created_at >= @From"); parameters.Add("From", filter.From); }
        if (filter.To.HasValue) { whereClauses.Add("i.created_at <= @To"); parameters.Add("To", filter.To); }
        var where = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";
        var offset = (filter.Page - 1) * filter.PageSize;
        parameters.Add("Limit", filter.PageSize);
        parameters.Add("Offset", offset);
        var countSql = $"SELECT COUNT(*) FROM invoices i JOIN bookings b ON b.id = i.booking_id JOIN rooms r ON r.id = b.room_id JOIN users u ON u.id = b.guest_id {where}";
        var dataSql = $"SELECT i.id AS Id, i.invoice_number AS InvoiceNumber, i.booking_id AS BookingId, r.number AS RoomNumber, u.first_name || ' ' || u.last_name AS GuestFullName, i.amount AS Amount, i.status::text AS Status, i.payment_method AS PaymentMethod, i.paid_at AS PaidAt, i.notes AS Notes, i.created_at AS CreatedAt FROM invoices i JOIN bookings b ON b.id = i.booking_id JOIN rooms r ON r.id = b.room_id JOIN users u ON u.id = b.guest_id {where} ORDER BY i.created_at DESC LIMIT @Limit OFFSET @Offset";
        var totalCount = await QuerySingleAsync<int>(countSql, parameters, ct);
        var items = await QueryAsync<InvoiceDto>(dataSql, parameters, ct);
        return new PagedResultDto<InvoiceDto>(items, totalCount, filter.Page, filter.PageSize);
    }

    private class InvoiceDetailRaw
    {
        public Guid Id { get; init; }
        public Guid BookingId { get; init; }
        public string InvoiceNumber { get; init; } = "";
        public string GuestFullName { get; init; } = "";
        public string GuestEmail { get; init; } = "";
        public string? GuestPhone { get; init; }
        public string RoomNumber { get; init; } = "";
        public string RoomTypeName { get; init; } = "";
        public DateTime CheckInDate { get; init; }
        public DateTime CheckOutDate { get; init; }
        public int NightsCount { get; init; }
        public decimal BaseAmount { get; init; }
        public decimal Amount { get; init; }
        public string Status { get; init; } = "";
        public string? PaymentMethod { get; init; }
        public DateTime? PaidAt { get; init; }
        public string? Notes { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
