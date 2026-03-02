namespace HotelManagement.Application.DTOs;

public record UserListItemDto(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? PhoneNumber,
    string Role,
    bool IsActive,
    bool IsDnr,
    string? DnrReason,
    DateTime CreatedAt
);

public record UserProfileDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Role,
    DateTime CreatedAt,
    int TotalBookings,
    decimal TotalSpent,
    DateTime? LastBookingDate
);
