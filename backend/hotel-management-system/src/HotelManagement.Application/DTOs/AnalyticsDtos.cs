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

/// <summary>
/// Ключевые показатели эффективности отеля (KPI) по стандартам индустрии.
/// ADR, RevPAR, ALOS — обязательный набор для управленческой отчётности.
/// </summary>
public record HotelKpiDto(
    decimal Adr,                    // Average Daily Rate = Room Revenue / Rooms Sold
    decimal RevPar,                 // Revenue per Available Room = ADR × Occupancy%
    decimal AverageLengthOfStay,    // ALOS = Total Room Nights / Total Bookings
    decimal OccupancyPercent,       // % загруженности за период
    int     TotalRoomNightsSold,    // всего ночей продано
    decimal TotalRevenue,           // выручка за период
    int     RoomsOnBooks30Days,     // брони на следующие 30 дней
    int     RoomsOnBooks60Days,     // брони на следующие 60 дней
    int     RoomsOnBooks90Days      // брони на следующие 90 дней
);
