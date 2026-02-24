using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class UserQueryService : DapperQueryBase, IUserQueryService
{
    public UserQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<IEnumerable<UserListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                id              AS Id,
                first_name      AS FirstName,
                last_name       AS LastName,
                email           AS Email,
                phone_number    AS PhoneNumber,
                role::text      AS Role,
                is_active       AS IsActive,
                created_at      AS CreatedAt
            FROM users
            ORDER BY created_at DESC
            """;

        return await QueryAsync<UserListItemDto>(sql, ct: ct);
    }

    public async Task<UserListItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                id              AS Id,
                first_name      AS FirstName,
                last_name       AS LastName,
                email           AS Email,
                phone_number    AS PhoneNumber,
                role::text      AS Role,
                is_active       AS IsActive,
                created_at      AS CreatedAt
            FROM users
            WHERE id = @Id
            """;

        return await QueryFirstOrDefaultAsync<UserListItemDto>(sql, new { Id = id }, ct);
    }
}
