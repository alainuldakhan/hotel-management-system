using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Interfaces;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

/// <summary>
/// EF Core-репозиторий для Booking — только команды (Write).
/// </summary>
public interface IBookingRepository : IRepository<Booking>
{
    Task<Booking?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<Booking?> GetByQrTokenAsync(string qrToken, CancellationToken ct = default);
    Task<bool> HasOverlappingBookingAsync(
        Guid roomId, DateTime checkIn, DateTime checkOut,
        Guid? excludeBookingId = null, CancellationToken ct = default);

    // BookingService management
    Task AddServiceAsync(BookingService service, CancellationToken ct = default);
    Task<BookingService?> GetServiceAsync(Guid bookingId, Guid serviceId, CancellationToken ct = default);
    void RemoveService(BookingService service);
}
