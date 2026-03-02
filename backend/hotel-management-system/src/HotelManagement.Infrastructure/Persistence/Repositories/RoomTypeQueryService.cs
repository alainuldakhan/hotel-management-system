using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomTypeQueryService : DapperQueryBase, IRoomTypeQueryService
{
    private readonly ICacheService _cache;

    public RoomTypeQueryService(IDbConnectionFactory connectionFactory, ICacheService cache)
        : base(connectionFactory) { _cache = cache; }

    public async Task<IEnumerable<RoomTypeListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.RoomTypesAll,
            async () =>
            {
                var sql = """
                    SELECT
                        rt.id               AS Id,
                        rt.name             AS Name,
                        rt.description      AS Description,
                        rt.max_occupancy    AS MaxOccupancy,
                        rt.base_price       AS BasePrice,
                        rt.area             AS Area,
                        COUNT(r.id)         AS RoomsCount,
                        rt.image_url        AS ImageUrl,
                        rt.is_active        AS IsActive,
                        rt.amenities        AS AmenitiesCsv
                    FROM room_types rt
                    LEFT JOIN rooms r ON r.room_type_id = rt.id AND r.is_active = true
                    GROUP BY rt.id, rt.name, rt.description, rt.max_occupancy,
                             rt.base_price, rt.area, rt.image_url, rt.is_active, rt.amenities
                    ORDER BY rt.name
                    """;
                return (await QueryAsync<RoomTypeListItemDto>(sql, ct: ct)).ToList();
            },
            TimeSpan.FromMinutes(10),
            ct);
    }

    public async Task<RoomTypeDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                id              AS Id,
                name            AS Name,
                description     AS Description,
                max_occupancy   AS MaxOccupancy,
                base_price      AS BasePrice,
                area            AS Area,
                amenities       AS Amenities,
                image_url       AS ImageUrl,
                is_active       AS IsActive,
                created_at      AS CreatedAt
            FROM room_types
            WHERE id = @Id
            """;

        var raw = await QueryFirstOrDefaultAsync<RoomTypeDetailRaw>(sql, new { Id = id }, ct);
        if (raw is null) return null;

        return new RoomTypeDetailDto(
            raw.Id, raw.Name, raw.Description, raw.MaxOccupancy,
            raw.BasePrice, raw.Area,
            raw.Amenities?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? [],
            raw.ImageUrl, raw.IsActive, raw.CreatedAt
        );
    }

    private class RoomTypeDetailRaw
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = "";
        public string Description { get; init; } = "";
        public int MaxOccupancy { get; init; }
        public decimal BasePrice { get; init; }
        public decimal Area { get; init; }
        public string? Amenities { get; init; }
        public string? ImageUrl { get; init; }
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
