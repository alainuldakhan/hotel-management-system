namespace HotelManagement.Application.DTOs;

public record BookingListItemDto(
    Guid Id,
    string RoomNumber,
    string RoomTypeName,
    string GuestFullName,
    string GuestEmail,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    int GuestsCount,
    string Status,
    string PaymentStatus,
    decimal TotalAmount,
    DateTime CreatedAt
);

public record BookingDetailDto(
    Guid Id,
    Guid RoomId,
    string RoomNumber,
    string RoomTypeName,
    Guid GuestId,
    string GuestFullName,
    string GuestEmail,
    string? GuestPhone,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    int GuestsCount,
    string Status,
    string PaymentStatus,
    decimal TotalAmount,
    decimal? PaidAmount,
    string? QrCodeToken,
    string? SpecialRequests,
    DateTime? ActualCheckIn,
    DateTime? ActualCheckOut,
    List<BookingServiceItemDto> Services,
    DateTime CreatedAt
);

public record BookingServiceItemDto(
    string ServiceName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);

public record BookingFilterDto(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    string? PaymentStatus = null,
    DateTime? CheckInFrom = null,
    DateTime? CheckInTo = null,
    Guid? GuestId = null,
    Guid? RoomId = null,
    string? SearchTerm = null
);

public record PagedResultDto<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize
)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}

// ── Шахматка (Room Booking Grid) ──────────────────────────────────────────────

public record BookingGridItemDto(
    Guid Id,
    string GuestFullName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    string Status
);

public record RoomGridRowDto(
    Guid RoomId,
    string RoomNumber,
    int Floor,
    string RoomTypeName,
    string RoomStatus,
    List<BookingGridItemDto> Bookings
);
