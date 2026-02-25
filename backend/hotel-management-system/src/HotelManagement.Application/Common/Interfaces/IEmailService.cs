namespace HotelManagement.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendBookingConfirmationAsync(BookingEmailData data, CancellationToken ct = default);
    Task SendCheckInNotificationAsync(BookingEmailData data, CancellationToken ct = default);
    Task SendCheckOutReceiptAsync(BookingEmailData data, CancellationToken ct = default);
    Task SendBookingCancellationAsync(BookingEmailData data, CancellationToken ct = default);
    Task SendBookingReminderAsync(BookingEmailData data, CancellationToken ct = default);
}

public record BookingEmailData(
    string GuestEmail,
    string GuestFullName,
    string BookingId,
    string RoomNumber,
    string RoomTypeName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NightsCount,
    decimal TotalAmount,
    string? SpecialRequests = null
);
