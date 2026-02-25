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
