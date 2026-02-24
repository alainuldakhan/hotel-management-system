using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;

namespace HotelManagement.Domain.Entities;

public class Booking : BaseEntity
{
    public DateTime CheckInDate { get; private set; }
    public DateTime CheckOutDate { get; private set; }
    public int GuestsCount { get; private set; }
    public BookingStatus Status { get; private set; } = BookingStatus.Pending;
    public decimal TotalAmount { get; private set; }
    public decimal? PaidAmount { get; private set; }
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;
    public string? QrCodeToken { get; private set; }
    public string? SpecialRequests { get; private set; }
    public DateTime? ActualCheckIn { get; private set; }
    public DateTime? ActualCheckOut { get; private set; }

    // FK
    public Guid RoomId { get; private set; }
    public Guid GuestId { get; private set; }           // User with Role = Guest

    // Navigation
    public Room Room { get; private set; } = null!;
    public User Guest { get; private set; } = null!;
    public ICollection<BookingService> BookingServices { get; private set; } = new List<BookingService>();
    public ICollection<Invoice> Invoices { get; private set; } = new List<Invoice>();

    protected Booking() { }

    public static Booking Create(Guid roomId, Guid guestId, DateTime checkIn,
        DateTime checkOut, int guestsCount, decimal totalAmount, string? specialRequests = null)
    {
        if (checkIn >= checkOut)
            throw new DomainException("Check-out date must be after check-in date.");

        if (guestsCount <= 0)
            throw new DomainException("Guests count must be at least 1.");

        return new Booking
        {
            RoomId = roomId,
            GuestId = guestId,
            CheckInDate = checkIn,
            CheckOutDate = checkOut,
            GuestsCount = guestsCount,
            TotalAmount = totalAmount,
            SpecialRequests = specialRequests,
            QrCodeToken = Guid.NewGuid().ToString("N")  // QR-токен для digital check-in
        };
    }

    public void Confirm()
    {
        if (Status != BookingStatus.Pending)
            throw new DomainException("Only pending bookings can be confirmed.");

        Status = BookingStatus.Confirmed;
        SetUpdatedAt();
    }

    public void CheckIn()
    {
        if (Status != BookingStatus.Confirmed)
            throw new DomainException("Only confirmed bookings can be checked in.");

        Status = BookingStatus.CheckedIn;
        ActualCheckIn = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void CheckOut()
    {
        if (Status != BookingStatus.CheckedIn)
            throw new DomainException("Only checked-in bookings can be checked out.");

        Status = BookingStatus.CheckedOut;
        ActualCheckOut = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void Cancel(string? reason = null)
    {
        if (Status is BookingStatus.CheckedIn or BookingStatus.CheckedOut)
            throw new DomainException("Cannot cancel a booking that is checked-in or completed.");

        Status = BookingStatus.Cancelled;
        if (reason != null) SpecialRequests = reason;
        SetUpdatedAt();
    }

    public void RegisterPayment(decimal amount)
    {
        PaidAmount = (PaidAmount ?? 0) + amount;
        PaymentStatus = PaidAmount >= TotalAmount ? PaymentStatus.Paid : PaymentStatus.PartiallyPaid;
        SetUpdatedAt();
    }

    public int NightsCount => (CheckOutDate - CheckInDate).Days;
}
