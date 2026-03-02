namespace HotelManagement.Application.DTOs;

public record InvoiceDto(
    Guid Id,
    string InvoiceNumber,
    Guid BookingId,
    string RoomNumber,
    string GuestFullName,
    decimal Amount,
    string Status,
    string? PaymentMethod,
    DateTime? PaidAt,
    string? Notes,
    DateTime CreatedAt
);

/// <summary>Расширенный счёт для PDF — включает данные бронирования и услуги</summary>
public record InvoiceDetailDto(
    Guid Id,
    string InvoiceNumber,
    string GuestFullName,
    string GuestEmail,
    string? GuestPhone,
    string RoomNumber,
    string RoomTypeName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    decimal BaseAmount,
    decimal Amount,
    string Status,
    string? PaymentMethod,
    DateTime? PaidAt,
    string? Notes,
    DateTime CreatedAt,
    List<InvoiceServiceLineDto> Services
);

public record InvoiceServiceLineDto(
    string ServiceName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);

/// <summary>Строка ежедневного отчёта по заселению</summary>
public record DailyOccupancyItemDto(
    string RoomNumber,
    string RoomTypeName,
    string GuestFullName,
    string GuestEmail,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    string Status,
    decimal TotalAmount
);

/// <summary>Фильтр для пагинированного списка инвойсов</summary>
public record InvoiceFilterDto(
    string? Status = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 20
);
