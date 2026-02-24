using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class BookingRepository : BaseRepository<Booking>, IBookingRepository
{
    public BookingRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Booking?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await _dbSet
            .Include(b => b.Guest)
            .Include(b => b.Room).ThenInclude(r => r.RoomType)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

    public async Task<Booking?> GetByQrTokenAsync(string qrToken, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(b => b.QrCodeToken == qrToken, ct);

    public async Task<bool> HasOverlappingBookingAsync(
        Guid roomId, DateTime checkIn, DateTime checkOut,
        Guid? excludeBookingId = null, CancellationToken ct = default)
        => await _dbSet.AnyAsync(b =>
            b.RoomId == roomId &&
            b.Id != excludeBookingId &&
            b.Status != Domain.Enums.BookingStatus.Cancelled &&
            b.Status != Domain.Enums.BookingStatus.CheckedOut &&
            b.CheckInDate < checkOut &&
            b.CheckOutDate > checkIn,
        ct);

    public async Task AddServiceAsync(BookingService service, CancellationToken ct = default)
        => await _context.Set<BookingService>().AddAsync(service, ct);

    public async Task<BookingService?> GetServiceAsync(Guid bookingId, Guid serviceId, CancellationToken ct = default)
        => await _context.Set<BookingService>()
            .FirstOrDefaultAsync(bs => bs.BookingId == bookingId && bs.AdditionalServiceId == serviceId, ct);

    public void RemoveService(BookingService service)
        => _context.Set<BookingService>().Remove(service);
}
