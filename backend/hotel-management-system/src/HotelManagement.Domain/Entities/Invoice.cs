using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities;

public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; private set; } = string.Empty;   // INV-2025-0001
    public decimal Amount { get; private set; }
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public string? PaymentMethod { get; private set; }                  // Cash, Card, Online
    public DateTime? PaidAt { get; private set; }
    public string? Notes { get; private set; }

    // FK
    public Guid BookingId { get; private set; }

    // Navigation
    public Booking Booking { get; private set; } = null!;

    protected Invoice() { }

    public static Invoice Create(Guid bookingId, decimal amount, string invoiceNumber)
    {
        return new Invoice
        {
            BookingId = bookingId,
            Amount = amount,
            InvoiceNumber = invoiceNumber
        };
    }

    public void MarkAsPaid(string paymentMethod, string? notes = null)
    {
        Status = PaymentStatus.Paid;
        PaymentMethod = paymentMethod;
        PaidAt = DateTime.UtcNow;
        Notes = notes;
        SetUpdatedAt();
    }
}
