using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomQueryService : DapperQueryBase, IRoomQueryService
{
    public RoomQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<IEnumerable<RoomListItemDto>> GetAvailableRoomsAsync(
        DateTime checkIn, DateTime checkOut, int guestsCount,
        Guid? roomTypeId = null, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                r.id                AS Id,
                r.number            AS Number,
                r.floor             AS Floor,
                r.status::text      AS Status,
                rt.name             AS RoomTypeName,
                rt.max_occupancy    AS MaxOccupancy,
                rt.base_price       AS PricePerNight,
                rt.area             AS Area,
                rt.image_url        AS ImageUrl
            FROM rooms r
            JOIN room_types rt ON rt.id = r.room_type_id
            WHERE r.is_active = true
              AND r.status = 1
              AND rt.max_occupancy >= @GuestsCount
              AND (@RoomTypeId IS NULL OR r.room_type_id = @RoomTypeId)
              AND NOT EXISTS (
                  SELECT 1 FROM bookings b
                  WHERE b.room_id = r.id
                    AND b.status NOT IN (4, 5)
                    AND b.check_in_date  < @CheckOut
                    AND b.check_out_date > @CheckIn
              )
            ORDER BY rt.base_price ASC
            """;

        return await QueryAsync<RoomListItemDto>(sql, new
        {
            CheckIn = checkIn,
            CheckOut = checkOut,
            GuestsCount = guestsCount,
            RoomTypeId = roomTypeId
        }, ct);
    }

    public async Task<RoomDetailDto?> GetRoomDetailAsync(Guid roomId, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                r.id                    AS Id,
                r.number                AS Number,
                r.floor                 AS Floor,
                r.status::text          AS Status,
                r.notes                 AS Notes,
                rt.id                   AS RoomTypeId,
                rt.name                 AS RoomTypeName,
                rt.description          AS RoomTypeDescription,
                rt.max_occupancy        AS MaxOccupancy,
                rt.base_price           AS BasePrice,
                rt.area                 AS Area,
                rt.amenities            AS Amenities,
                rt.image_url            AS ImageUrl
            FROM rooms r
            JOIN room_types rt ON rt.id = r.room_type_id
            WHERE r.id = @RoomId
            """;

        var result = await QueryFirstOrDefaultAsync<RoomDetailRaw>(sql, new { RoomId = roomId }, ct);
        if (result is null) return null;

        return new RoomDetailDto(
            result.Id, result.Number, result.Floor, result.Status, result.Notes,
            result.RoomTypeId, result.RoomTypeName, result.RoomTypeDescription,
            result.MaxOccupancy, result.BasePrice, result.Area,
            result.Amenities?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? [],
            result.ImageUrl
        );
    }

    public async Task<IEnumerable<RoomListItemDto>> GetAllRoomsAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                r.id                AS Id,
                r.number            AS Number,
                r.floor             AS Floor,
                r.status::text      AS Status,
                rt.name             AS RoomTypeName,
                rt.max_occupancy    AS MaxOccupancy,
                rt.base_price       AS PricePerNight,
                rt.area             AS Area,
                rt.image_url        AS ImageUrl
            FROM rooms r
            JOIN room_types rt ON rt.id = r.room_type_id
            WHERE r.is_active = true
            ORDER BY r.floor, r.number
            """;

        return await QueryAsync<RoomListItemDto>(sql, ct: ct);
    }

    public async Task<RoomOccupancyStatsDto> GetOccupancyStatsAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                COUNT(*)                                            AS TotalRooms,
                COUNT(*) FILTER (WHERE status = 1)                 AS AvailableRooms,
                COUNT(*) FILTER (WHERE status = 2)                 AS OccupiedRooms,
                COUNT(*) FILTER (WHERE status = 3)                 AS CleaningRooms,
                COUNT(*) FILTER (WHERE status = 4)                 AS MaintenanceRooms,
                ROUND(
                    COUNT(*) FILTER (WHERE status = 2) * 100.0
                    / NULLIF(COUNT(*), 0), 2
                )                                                   AS OccupancyPercent
            FROM rooms
            WHERE is_active = true
            """;

        return await QuerySingleAsync<RoomOccupancyStatsDto>(sql, ct: ct);
    }

    // Внутренний RAW-класс для маппинга amenities как строки
    private class RoomDetailRaw
    {
        public Guid Id { get; init; }
        public string Number { get; init; } = "";
        public int Floor { get; init; }
        public string Status { get; init; } = "";
        public string? Notes { get; init; }
        public Guid RoomTypeId { get; init; }
        public string RoomTypeName { get; init; } = "";
        public string RoomTypeDescription { get; init; } = "";
        public int MaxOccupancy { get; init; }
        public decimal BasePrice { get; init; }
        public decimal Area { get; init; }
        public string? Amenities { get; init; }
        public string? ImageUrl { get; init; }
    }
}
