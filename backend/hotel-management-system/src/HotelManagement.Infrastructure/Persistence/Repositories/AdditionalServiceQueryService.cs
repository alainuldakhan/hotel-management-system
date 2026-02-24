using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class AdditionalServiceQueryService : DapperQueryBase, IAdditionalServiceQueryService
{
    public AdditionalServiceQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<IEnumerable<AdditionalServiceDto>> GetAllAsync(CancellationToken ct = default)
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

        return await QueryAsync<AdditionalServiceDto>(sql, ct: ct);
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
