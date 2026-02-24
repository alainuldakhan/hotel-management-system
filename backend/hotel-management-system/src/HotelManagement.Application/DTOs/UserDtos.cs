namespace HotelManagement.Application.DTOs;

public record UserListItemDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Role,
    bool IsActive,
    DateTime CreatedAt
);
