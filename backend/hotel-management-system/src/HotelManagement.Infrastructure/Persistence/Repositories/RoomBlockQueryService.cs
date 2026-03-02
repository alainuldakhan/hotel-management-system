using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomBlockQueryService : DapperQueryBase, IRoomBlockQueryService
{
    public RoomBlockQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<IEnumerable<RoomBlockDto>> GetByRoomIdAsync(
        Guid roomId, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                rb.id                                               AS Id,
                rb.room_id                                          AS RoomId,
                r.number                                            AS RoomNumber,
                rb.blocked_from                                     AS BlockedFrom,
                rb.blocked_to                                       AS BlockedTo,
                rb.reason                                           AS Reason,
                u.first_name || ' ' || u.last_name                 AS BlockedByUserName,
                rb.is_active                                        AS IsActive,
                rb.created_at                                       AS CreatedAt
            FROM room_blocks rb
            JOIN rooms r ON r.id = rb.room_id
            JOIN users u ON u.id = rb.blocked_by_user_id
            WHERE rb.room_id = @RoomId
            ORDER BY rb.blocked_from DESC
            """;

        return await QueryAsync<RoomBlockDto>(sql, new { RoomId = roomId }, ct);
    }

    public async Task<IEnumerable<RoomBlockDto>> GetActiveBlocksAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                rb.id                                               AS Id,
                rb.room_id                                          AS RoomId,
                r.number                                            AS RoomNumber,
                rb.blocked_from                                     AS BlockedFrom,
                rb.blocked_to                                       AS BlockedTo,
                rb.reason                                           AS Reason,
                u.first_name || ' ' || u.last_name                 AS BlockedByUserName,
                rb.is_active                                        AS IsActive,
                rb.created_at                                       AS CreatedAt
            FROM room_blocks rb
            JOIN rooms r ON r.id = rb.room_id
            JOIN users u ON u.id = rb.blocked_by_user_id
            WHERE rb.is_active = true
            ORDER BY rb.blocked_from
            """;

        return await QueryAsync<RoomBlockDto>(sql, ct: ct);
    }
}
