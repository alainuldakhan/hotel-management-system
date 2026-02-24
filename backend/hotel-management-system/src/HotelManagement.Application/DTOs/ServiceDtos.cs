namespace HotelManagement.Application.DTOs;

public record AdditionalServiceDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string? IconUrl,
    bool IsActive
);

public record PricingRuleDto(
    Guid Id,
    string Name,
    decimal Multiplier,
    DateTime? StartDate,
    DateTime? EndDate,
    int[]? ApplicableDays,
    int? MinOccupancyPercent,
    int? MaxDaysBeforeCheckIn,
    Guid? RoomTypeId,
    string? RoomTypeName,
    bool IsActive
);
