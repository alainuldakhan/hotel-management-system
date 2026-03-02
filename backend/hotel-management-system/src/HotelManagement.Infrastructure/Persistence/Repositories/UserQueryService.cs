using Dapper;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class UserQueryService : DapperQueryBase, IUserQueryService
{
    public UserQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<PagedResultDto<UserListItemDto>> GetAllAsync(
        string? role = null, string? search = null,
        int page = 1, int pageSize = 20,
        CancellationToken ct = default)
    {
        var whereClauses = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(role))
        {
            whereClauses.Add("role::text = @Role");
            parameters.Add("Role", role);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            whereClauses.Add("(first_name ILIKE @Search OR last_name ILIKE @Search OR email ILIKE @Search)");
            parameters.Add("Search", $"%{search}%");
        }

        var where = whereClauses.Count > 0
            ? "WHERE " + string.Join(" AND ", whereClauses)
            : "";

        var offset = (page - 1) * pageSize;
        parameters.Add("Limit", pageSize);
        parameters.Add("Offset", offset);

        var countSql = $"SELECT COUNT(*) FROM users {where}";
        var dataSql = $"""
            SELECT
                id                                  AS Id,
                first_name                          AS FirstName,
                last_name                           AS LastName,
                first_name || ' ' || last_name      AS FullName,
                email                               AS Email,
                phone_number                        AS PhoneNumber,
                role::text                          AS Role,
                is_active                           AS IsActive,
                is_dnr                              AS IsDnr,
                dnr_reason                          AS DnrReason,
                created_at                          AS CreatedAt
            FROM users
            {where}
            ORDER BY created_at DESC
            LIMIT @Limit OFFSET @Offset
            """;

        using var connection = _connectionFactory.CreateConnection();
        var totalCount = await connection.QuerySingleAsync<int>(countSql, parameters);
        var items = await connection.QueryAsync<UserListItemDto>(dataSql, parameters);

        return new PagedResultDto<UserListItemDto>(items, totalCount, page, pageSize);
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

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                u.id                                                    AS Id,
                u.first_name                                            AS FirstName,
                u.last_name                                             AS LastName,
                u.email                                                 AS Email,
                u.phone_number                                          AS PhoneNumber,
                u.role::text                                            AS Role,
                u.created_at                                            AS CreatedAt,
                COUNT(b.id)                                             AS TotalBookings,
                COALESCE(SUM(b.total_amount), 0)                        AS TotalSpent,
                MAX(b.created_at)                                       AS LastBookingDate
            FROM users u
            LEFT JOIN bookings b ON b.guest_id = u.id AND b.status != 'Cancelled'
            WHERE u.id = @UserId
            GROUP BY u.id, u.first_name, u.last_name, u.email,
                     u.phone_number, u.role, u.created_at
            """;

        return await QueryFirstOrDefaultAsync<UserProfileDto>(sql, new { UserId = userId }, ct);
    }
}
