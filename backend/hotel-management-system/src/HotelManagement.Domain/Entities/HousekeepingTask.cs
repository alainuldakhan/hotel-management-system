using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;

namespace HotelManagement.Domain.Entities;

public class HousekeepingTask : BaseEntity
{
    public HousekeepingTaskType Type { get; private set; }
    public HousekeepingStatus Status { get; private set; } = HousekeepingStatus.Pending;
    public string? Notes { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletionNotes { get; private set; }

    // FK
    public Guid RoomId { get; private set; }
    public Guid RequestedByUserId { get; private set; }
    public Guid? AssignedToUserId { get; private set; }

    // Navigation
    public Room Room { get; private set; } = null!;
    public User RequestedBy { get; private set; } = null!;
    public User? AssignedTo { get; private set; }

    protected HousekeepingTask() { }

    public static HousekeepingTask Create(
        Guid roomId,
        Guid requestedByUserId,
        HousekeepingTaskType type,
        string? notes = null,
        DateTime? dueDate = null)
    {
        return new HousekeepingTask
        {
            RoomId = roomId,
            RequestedByUserId = requestedByUserId,
            Type = type,
            Notes = notes,
            DueDate = dueDate
        };
    }

    public void Assign(Guid assignedToUserId)
    {
        if (Status == HousekeepingStatus.Completed || Status == HousekeepingStatus.Cancelled)
            throw new DomainException("Cannot assign a completed or cancelled task.");

        AssignedToUserId = assignedToUserId;
        Status = HousekeepingStatus.InProgress;
        SetUpdatedAt();
    }

    public void Complete(string? completionNotes = null)
    {
        if (Status == HousekeepingStatus.Cancelled)
            throw new DomainException("Cannot complete a cancelled task.");

        Status = HousekeepingStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletionNotes = completionNotes;
        SetUpdatedAt();
    }

    public void Cancel()
    {
        if (Status == HousekeepingStatus.Completed)
            throw new DomainException("Cannot cancel a completed task.");

        Status = HousekeepingStatus.Cancelled;
        SetUpdatedAt();
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes;
        SetUpdatedAt();
    }
}
