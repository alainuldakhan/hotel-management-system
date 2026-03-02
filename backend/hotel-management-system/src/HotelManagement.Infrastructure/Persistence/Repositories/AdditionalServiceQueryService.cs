using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class AdditionalServiceQueryService : DapperQueryBase, IAdditionalServiceQueryService
{
    private readonly ICacheService _cache;

    public AdditionalServiceQueryService(IDbConnectionFactory connectionFactory, ICacheService cache)
        : base(connectionFactory) { _cache = cache; }

    public async Task<IEnumerable<AdditionalServiceDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.ServicesAll,
            async () =>
            {
                var sql = """
                    SELECT
                        id          AS Id,
                        name        AS Name,
                        description AS Description,
                        price       AS Price,
                        icon_url    AS IconUrl,
                        is_active   AS IsActive
                    FROM additional_services
                    ORDER BY name
                    """;
                return (await QueryAsync<AdditionalServiceDto>(sql, ct: ct)).ToList();
            },
            TimeSpan.FromMinutes(15),
            ct);
    }

    public async Task<AdditionalServiceDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                id          AS Id,
                name        AS Name,
                description AS Description,
                price       AS Price,
                icon_url    AS IconUrl,
                is_active   AS IsActive
            FROM additional_services
            WHERE id = @Id
            """;

        return await QueryFirstOrDefaultAsync<AdditionalServiceDto>(sql, new { Id = id }, ct);
    }
}
