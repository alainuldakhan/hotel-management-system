using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

/// <summary>
/// Dapper Query-сервис для бронирований — только чтение.
/// </summary>
public interface IBookingQueryService
{
    Task<BookingDetailDto?> GetByIdAsync(Guid bookingId, CancellationToken ct = default);
    Task<BookingDetailDto?> GetByQrTokenAsync(string qrToken, CancellationToken ct = default);
    Task<PagedResultDto<BookingListItemDto>> GetPagedAsync(BookingFilterDto filter, CancellationToken ct = default);
    Task<IEnumerable<BookingListItemDto>> GetGuestBookingsAsync(Guid guestId, CancellationToken ct = default);
    Task<List<RoomGridRowDto>> GetGridAsync(DateTime startDate, DateTime endDate, CancellationToken ct = default);
    Task<IEnumerable<BookingListItemDto>> GetTomorrowCheckInsAsync(CancellationToken ct = default);

    // ── Front Desk ──────────────────────────────────────────────────────────
    Task<IEnumerable<ArrivalItemDto>> GetArrivalsAsync(DateTime date, CancellationToken ct = default);
    Task<IEnumerable<DepartureItemDto>> GetDeparturesAsync(DateTime date, CancellationToken ct = default);
    Task<IEnumerable<InHouseGuestDto>> GetInHouseGuestsAsync(CancellationToken ct = default);
    Task<IEnumerable<ForecastDayDto>> GetForecastAsync(int days, CancellationToken ct = default);
}
