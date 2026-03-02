using HotelManagement.Domain.Common;
using HotelManagement.Domain.Exceptions;

namespace HotelManagement.Domain.Entities;

/// <summary>
/// Блокировка номера — временно запрещает бронирование (VIP-бронь, технические работы и т.д.)
/// </summary>
public class RoomBlock : BaseEntity
{
    public Guid RoomId { get; private set; }
    public DateTime BlockedFrom { get; private set; }
    public DateTime BlockedTo { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public Guid BlockedByUserId { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public Room Room { get; private set; } = null!;

    protected RoomBlock() { }

    public static RoomBlock Create(
        Guid roomId,
        DateTime blockedFrom,
        DateTime blockedTo,
        string reason,
        Guid blockedByUserId)
    {
        if (blockedFrom >= blockedTo)
            throw new DomainException("Block end date must be after start date.");

        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Block reason is required.");

        return new RoomBlock
        {
            RoomId          = roomId,
            BlockedFrom     = blockedFrom.Date,
            BlockedTo       = blockedTo.Date,
            Reason          = reason,
            BlockedByUserId = blockedByUserId
        };
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
