using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IPaymentQueryService
{
    Task<IEnumerable<PaymentDto>> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
}
