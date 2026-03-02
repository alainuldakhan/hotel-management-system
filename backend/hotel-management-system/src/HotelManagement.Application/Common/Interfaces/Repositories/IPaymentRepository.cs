using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IPaymentRepository
{
    Task AddAsync(Payment payment, CancellationToken ct = default);
    Task<IReadOnlyList<Payment>> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
}
