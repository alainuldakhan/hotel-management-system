using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities;

public class MaintenanceRequest : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public MaintenanceStatus Status { get; private set; } = MaintenanceStatus.New;
    public MaintenancePriority Priority { get; private set; } = MaintenancePriority.Medium;
    public string? Resolution { get; private set; }
    public DateTime? ResolvedAt { get; private set; }

    // FK
    public Guid RoomId { get; private set; }
    public Guid ReportedByUserId { get; private set; }
    public Guid? AssignedToUserId { get; private set; }

    // Navigation
    public Room Room { get; private set; } = null!;
    public User ReportedBy { get; private set; } = null!;
    public User? AssignedTo { get; private set; }

    protected MaintenanceRequest() { }

    public static MaintenanceRequest Create(Guid roomId, Guid reportedByUserId,
        string title, string description, MaintenancePriority priority = MaintenancePriority.Medium)
    {
        return new MaintenanceRequest
        {
            RoomId = roomId,
            ReportedByUserId = reportedByUserId,
            Title = title,
            Description = description,
            Priority = priority
        };
    }

    public void Assign(Guid assignedToUserId)
    {
        AssignedToUserId = assignedToUserId;
        Status = MaintenanceStatus.InProgress;
        SetUpdatedAt();
    }

    public void Resolve(string resolution)
    {
        Status = MaintenanceStatus.Completed;
        Resolution = resolution;
        ResolvedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void Cancel()
    {
        Status = MaintenanceStatus.Cancelled;
        SetUpdatedAt();
    }
}
