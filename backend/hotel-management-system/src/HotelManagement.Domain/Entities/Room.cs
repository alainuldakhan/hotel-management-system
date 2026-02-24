using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities;

public class Room : BaseEntity
{
    public string Number { get; private set; } = string.Empty;    // "101", "202A"
    public int Floor { get; private set; }
    public RoomStatus Status { get; private set; } = RoomStatus.Available;
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; } = true;

    // FK
    public Guid RoomTypeId { get; private set; }

    // Navigation
    public RoomType RoomType { get; private set; } = null!;
    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; private set; } = new List<MaintenanceRequest>();

    protected Room() { }

    public static Room Create(string number, int floor, Guid roomTypeId, string? notes = null)
    {
        return new Room
        {
            Number = number,
            Floor = floor,
            RoomTypeId = roomTypeId,
            Notes = notes
        };
    }

    public void Update(string number, int floor, Guid roomTypeId, string? notes)
    {
        Number = number;
        Floor = floor;
        RoomTypeId = roomTypeId;
        Notes = notes;
        SetUpdatedAt();
    }

    public void ChangeStatus(RoomStatus newStatus)
    {
        Status = newStatus;
        SetUpdatedAt();
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public bool IsAvailableForBooking() =>
        IsActive && Status == RoomStatus.Available;
}
