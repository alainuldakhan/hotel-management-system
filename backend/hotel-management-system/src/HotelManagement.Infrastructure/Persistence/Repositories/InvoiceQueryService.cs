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
}
