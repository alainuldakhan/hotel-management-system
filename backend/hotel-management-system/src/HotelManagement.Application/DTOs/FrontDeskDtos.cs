namespace HotelManagement.Application.DTOs;

/// <summary>Ожидаемый заезд</summary>
public record ArrivalItemDto(
    Guid BookingId,
    string GuestFullName,
    string GuestEmail,
    string? GuestPhone,
    string RoomNumber,
    string RoomTypeName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    int GuestsCount,
    decimal TotalAmount,
    string Status,
    string? SpecialRequests
);

/// <summary>Ожидаемый выезд</summary>
public record DepartureItemDto(
    Guid BookingId,
    string GuestFullName,
    string GuestEmail,
    string RoomNumber,
    string RoomTypeName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    decimal TotalAmount,
    decimal? PaidAmount,
    string PaymentStatus
);

/// <summary>Проживающий гость (текущие заселения)</summary>
public record InHouseGuestDto(
    Guid BookingId,
    string GuestFullName,
    string GuestEmail,
    string? GuestPhone,
    string RoomNumber,
    string RoomTypeName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    DateTime? ActualCheckIn,
    decimal TotalAmount,
    string PaymentStatus
);

/// <summary>Прогноз загрузки на день</summary>
public record ForecastDayDto(
    DateTime Date,
    int BookedRooms,
    int TotalRooms,
    decimal OccupancyPercent,
    decimal ProjectedRevenue
);
