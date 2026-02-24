using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities;

/// <summary>Связь между бронированием и заказанными доп. услугами.</summary>
public class BookingService : BaseEntity
{
    public int Quantity { get; private set; } = 1;
    public decimal UnitPrice { get; private set; }      // Цена на момент заказа

    // FK
    public Guid BookingId { get; private set; }
    public Guid AdditionalServiceId { get; private set; }

    // Navigation
    public Booking Booking { get; private set; } = null!;
    public AdditionalService AdditionalService { get; private set; } = null!;

    protected BookingService() { }

    public static BookingService Create(Guid bookingId, Guid serviceId, int quantity, decimal unitPrice)
    {
        return new BookingService
        {
            BookingId = bookingId,
            AdditionalServiceId = serviceId,
            Quantity = quantity,
            UnitPrice = unitPrice
        };
    }

    public decimal TotalPrice => Quantity * UnitPrice;
}
