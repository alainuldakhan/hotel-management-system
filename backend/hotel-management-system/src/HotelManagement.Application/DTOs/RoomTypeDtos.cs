namespace HotelManagement.Application.DTOs;

public record RoomTypeListItemDto(
    Guid Id,
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice,
    decimal Area,
    int RoomsCount,
    string? ImageUrl,
    bool IsActive
);

public record RoomTypeDetailDto(
    Guid Id,
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice,
    decimal Area,
    List<string> Amenities,
    string? ImageUrl,
    bool IsActive,
    DateTime CreatedAt
);
