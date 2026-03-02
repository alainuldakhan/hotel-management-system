using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class PaymentQueryService : DapperQueryBase, IPaymentQueryService
{
    public PaymentQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<IEnumerable<PaymentDto>> GetByBookingIdAsync(
        Guid bookingId, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                p.id                                                AS Id,
                p.booking_id                                        AS BookingId,
                p.invoice_id                                        AS InvoiceId,
                p.amount                                            AS Amount,
                p.method                                            AS Method,
                p.reference                                         AS Reference,
                p.received_at                                       AS ReceivedAt,
                u.first_name || ' ' || u.last_name                 AS ReceivedByUserName,
                p.notes                                             AS Notes
            FROM payments p
            JOIN users u ON u.id = p.received_by_user_id
            WHERE p.booking_id = @BookingId
            ORDER BY p.received_at DESC
            """;

        return await QueryAsync<PaymentDto>(sql, new { BookingId = bookingId }, ct);
    }
}
