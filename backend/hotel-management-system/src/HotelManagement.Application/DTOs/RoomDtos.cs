namespace HotelManagement.Application.DTOs;

public record RoomListItemDto(
    Guid Id,
    string Number,
    int Floor,
    string Status,
    string RoomTypeName,
    int MaxOccupancy,
    decimal PricePerNight,
    decimal Area,
    string? ImageUrl
);

public record RoomDetailDto(
    Guid Id,
    string Number,
    int Floor,
    string Status,
    string? Notes,
    Guid RoomTypeId,
    string RoomTypeName,
    string RoomTypeDescription,
    int MaxOccupancy,
    decimal BasePrice,
    decimal Area,
    List<string> Amenities,
    string? ImageUrl
);

public record RoomOccupancyStatsDto(
    int TotalRooms,
    int AvailableRooms,
    int OccupiedRooms,
    int CleaningRooms,
    int MaintenanceRooms,
    decimal OccupancyPercent
);
