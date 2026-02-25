using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities;

public class Review : BaseEntity
{
    public int Rating { get; private set; }         // 1 – 5
    public string? Comment { get; private set; }
    public Guid BookingId { get; private set; }
    public Guid GuestId { get; private set; }
    public Guid RoomTypeId { get; private set; }

    // Navigation
    public Booking Booking { get; private set; } = null!;
    public User Guest { get; private set; } = null!;
    public RoomType RoomType { get; private set; } = null!;

    protected Review() { }

    public static Review Create(Guid bookingId, Guid guestId, Guid roomTypeId, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

        return new Review
        {
            BookingId  = bookingId,
            GuestId    = guestId,
            RoomTypeId = roomTypeId,
            Rating     = rating,
            Comment    = comment?.Trim(),
        };
    }
}
