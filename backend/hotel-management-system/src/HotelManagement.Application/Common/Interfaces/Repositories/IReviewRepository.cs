using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IReviewRepository
{
    Task<Review?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task AddAsync(Review review, CancellationToken ct = default);
}
