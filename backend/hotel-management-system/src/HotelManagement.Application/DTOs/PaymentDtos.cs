namespace HotelManagement.Application.DTOs;

public record PaymentDto(
    Guid Id,
    Guid BookingId,
    Guid? InvoiceId,
    decimal Amount,
    string Method,
    string? Reference,
    DateTime ReceivedAt,
    string ReceivedByUserName,
    string? Notes
);
