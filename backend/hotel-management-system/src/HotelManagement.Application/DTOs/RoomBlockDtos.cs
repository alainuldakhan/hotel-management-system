namespace HotelManagement.Application.DTOs;

public record RoomBlockDto(
    Guid Id,
    Guid RoomId,
    string RoomNumber,
    DateTime BlockedFrom,
    DateTime BlockedTo,
    string Reason,
    string BlockedByUserName,
    bool IsActive,
    DateTime CreatedAt
);
