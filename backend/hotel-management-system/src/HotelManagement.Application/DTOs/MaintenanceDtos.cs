namespace HotelManagement.Application.DTOs;

public record MaintenanceRequestListItemDto(
    Guid Id,
    string Title,
    string Status,
    string Priority,
    string RoomNumber,
    string ReportedBy,
    string? AssignedTo,
    DateTime CreatedAt
);

public record MaintenanceRequestDetailDto(
    Guid Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    string? Resolution,
    DateTime? ResolvedAt,
    Guid RoomId,
    string RoomNumber,
    Guid ReportedByUserId,
    string ReportedBy,
    Guid? AssignedToUserId,
    string? AssignedTo,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record MaintenanceFilterDto(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    string? Priority = null,
    Guid? RoomId = null,
    Guid? AssignedToUserId = null
);
