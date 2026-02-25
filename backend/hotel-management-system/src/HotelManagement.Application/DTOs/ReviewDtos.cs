namespace HotelManagement.Application.DTOs;

public record ReviewDto(
    Guid Id,
    int Rating,
    string? Comment,
    string GuestFullName,
    string RoomTypeName,
    DateTime CreatedAt
);

public record RoomTypeRatingDto(
    Guid RoomTypeId,
    string RoomTypeName,
    double AverageRating,
    int ReviewCount
);

public record ReviewFilterDto(
    Guid? RoomTypeId = null,
    int Page = 1,
    int PageSize = 20
);
