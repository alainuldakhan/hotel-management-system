using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
        => _context = context;

    public async Task AddAsync(Payment payment, CancellationToken ct = default)
        => await _context.Payments.AddAsync(payment, ct);

    public async Task<IReadOnlyList<Payment>> GetByBookingIdAsync(
        Guid bookingId, CancellationToken ct = default)
        => await _context.Payments
            .Where(p => p.BookingId == bookingId)
            .OrderByDescending(p => p.ReceivedAt)
            .ToListAsync(ct);
}
