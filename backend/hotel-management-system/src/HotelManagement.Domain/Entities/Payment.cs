using HotelManagement.Domain.Common;
using HotelManagement.Domain.Exceptions;

namespace HotelManagement.Domain.Entities;

/// <summary>
/// Платёж — детальная запись о каждом принятом платеже.
/// Одно бронирование может иметь несколько платежей (частичная оплата, доплата при выезде).
/// </summary>
public class Payment : BaseEntity
{
    public Guid BookingId { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public decimal Amount { get; private set; }
    public string Method { get; private set; } = string.Empty;   // Cash / Card / BankTransfer / Online
    public string? Reference { get; private set; }               // номер транзакции / чека
    public DateTime ReceivedAt { get; private set; }
    public Guid ReceivedByUserId { get; private set; }
    public string? Notes { get; private set; }

    // Navigation
    public Booking Booking { get; private set; } = null!;

    protected Payment() { }

    public static Payment Create(
        Guid bookingId,
        decimal amount,
        string method,
        Guid receivedByUserId,
        Guid? invoiceId = null,
        string? reference = null,
        string? notes = null)
    {
        if (amount <= 0)
            throw new DomainException("Payment amount must be greater than zero.");

        if (string.IsNullOrWhiteSpace(method))
            throw new DomainException("Payment method is required.");

        return new Payment
        {
            BookingId         = bookingId,
            InvoiceId         = invoiceId,
            Amount            = amount,
            Method            = method,
            Reference         = reference,
            ReceivedAt        = DateTime.UtcNow,
            ReceivedByUserId  = receivedByUserId,
            Notes             = notes
        };
    }
}
