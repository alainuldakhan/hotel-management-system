using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class PricingRuleQueryService : DapperQueryBase, IPricingRuleQueryService
{
    private readonly ICacheService _cache;

    public PricingRuleQueryService(IDbConnectionFactory connectionFactory, ICacheService cache)
        : base(connectionFactory) { _cache = cache; }

    public async Task<IEnumerable<PricingRuleDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.PricingRulesAll,
            async () =>
            {
                var sql = """
                    SELECT
                        pr.id                       AS Id,
                        pr.name                     AS Name,
                        pr.multiplier               AS Multiplier,
                        pr.start_date               AS StartDate,
                        pr.end_date                 AS EndDate,
                        pr.applicable_days          AS ApplicableDays,
                        pr.min_occupancy_percent    AS MinOccupancyPercent,
                        pr.max_days_before_check_in AS MaxDaysBeforeCheckIn,
                        pr.room_type_id             AS RoomTypeId,
                        rt.name                     AS RoomTypeName,
                        pr.is_active                AS IsActive
                    FROM pricing_rules pr
                    LEFT JOIN room_types rt ON rt.id = pr.room_type_id
                    ORDER BY pr.name
                    """;
                var rows = await QueryAsync<PricingRuleRaw>(sql, ct: ct);
                return rows.Select(MapToDto).ToList();
            },
            TimeSpan.FromMinutes(5),
            ct);
    }

    public async Task<PricingRuleDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                pr.id                       AS Id,
                pr.name                     AS Name,
                pr.multiplier               AS Multiplier,
                pr.start_date               AS StartDate,
                pr.end_date                 AS EndDate,
                pr.applicable_days          AS ApplicableDays,
                pr.min_occupancy_percent    AS MinOccupancyPercent,
                pr.max_days_before_check_in AS MaxDaysBeforeCheckIn,
                pr.room_type_id             AS RoomTypeId,
                rt.name                     AS RoomTypeName,
                pr.is_active                AS IsActive
            FROM pricing_rules pr
            LEFT JOIN room_types rt ON rt.id = pr.room_type_id
            WHERE pr.id = @Id
            """;

        var raw = await QueryFirstOrDefaultAsync<PricingRuleRaw>(sql, new { Id = id }, ct);
        return raw is null ? null : MapToDto(raw);
    }

    private static PricingRuleDto MapToDto(PricingRuleRaw raw)
    {
        var days = raw.ApplicableDays?
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(int.Parse)
            .ToArray();

        return new PricingRuleDto(
            raw.Id, raw.Name, raw.Multiplier,
            raw.StartDate, raw.EndDate,
            days,
            raw.MinOccupancyPercent, raw.MaxDaysBeforeCheckIn,
            raw.RoomTypeId, raw.RoomTypeName, raw.IsActive
        );
    }

    private class PricingRuleRaw
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = "";
        public decimal Multiplier { get; init; }
        public DateTime? StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public string? ApplicableDays { get; init; }
        public int? MinOccupancyPercent { get; init; }
        public int? MaxDaysBeforeCheckIn { get; init; }
        public Guid? RoomTypeId { get; init; }
        public string? RoomTypeName { get; init; }
        public bool IsActive { get; init; }
    }
}
