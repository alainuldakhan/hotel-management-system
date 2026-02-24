namespace HotelManagement.Application.DTOs;

public record DashboardStatsDto(
    int TotalRooms,
    int OccupiedRooms,
    decimal OccupancyPercent,
    decimal RevenueToday,
    decimal RevenueThisMonth,
    int BookingsToday,
    int CheckInsToday,
    int CheckOutsToday,
    int PendingMaintenanceRequests,
    int ActiveBookings
);

public record RevenueByPeriodDto(
    string Period,       // "2025-01", "2025-W03", "2025-01-15"
    decimal Revenue,
    int BookingsCount,
    decimal AverageBookingValue
);

public record OccupancyByRoomTypeDto(
    string RoomTypeName,
    int TotalRooms,
    decimal AverageOccupancyPercent,
    decimal TotalRevenue,
    decimal AverageDailyRate
);

public record TopGuestDto(
    Guid GuestId,
    string FullName,
    string Email,
    int TotalBookings,
    int TotalNights,
    decimal TotalSpent,
    DateTime LastVisit
);
