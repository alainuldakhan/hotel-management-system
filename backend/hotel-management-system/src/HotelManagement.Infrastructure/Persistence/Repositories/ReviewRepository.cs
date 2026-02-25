using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class ReviewRepository : BaseRepository<Review>, IReviewRepository
{
    public ReviewRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Review?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(r => r.BookingId == bookingId, ct);

    public new async Task AddAsync(Review review, CancellationToken ct = default)
        => await _dbSet.AddAsync(review, ct);
}
