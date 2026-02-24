namespace HotelManagement.Application.DTOs;

public record HousekeepingTaskListItemDto(
    Guid Id,
    string Type,
    string Status,
    string RoomNumber,
    int Floor,
    string RequestedBy,
    string? AssignedTo,
    DateTime? DueDate,
    DateTime CreatedAt
);

public record HousekeepingTaskDetailDto(
    Guid Id,
    string Type,
    string Status,
    string? Notes,
    string? CompletionNotes,
    DateTime? DueDate,
    DateTime? CompletedAt,
    Guid RoomId,
    string RoomNumber,
    int Floor,
    Guid RequestedByUserId,
    string RequestedBy,
    Guid? AssignedToUserId,
    string? AssignedTo,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record HousekeepingFilterDto(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    string? Type = null,
    Guid? RoomId = null,
    Guid? AssignedToUserId = null
);
