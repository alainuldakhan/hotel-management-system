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
