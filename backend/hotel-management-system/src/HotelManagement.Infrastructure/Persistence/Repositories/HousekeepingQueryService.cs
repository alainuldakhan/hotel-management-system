using Dapper;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class HousekeepingQueryService : DapperQueryBase, IHousekeepingQueryService
{
    public HousekeepingQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<PagedResultDto<HousekeepingTaskListItemDto>> GetPagedAsync(
        HousekeepingFilterDto filter, CancellationToken ct = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("Offset", (filter.Page - 1) * filter.PageSize);
        parameters.Add("PageSize", filter.PageSize);

        var whereClause = BuildWhereClause(filter, parameters);

        var countSql = $"SELECT COUNT(*) FROM housekeeping_tasks ht {whereClause}";

        var dataSql = $"""
            SELECT
                ht.id                           AS Id,
                CASE ht.type WHEN 1 THEN 'General' WHEN 2 THEN 'Checkout' WHEN 3 THEN 'Turndown' WHEN 4 THEN 'DeepCleaning' WHEN 5 THEN 'Replenishment' ELSE ht.type::text END AS Type,
                CASE ht.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'InProgress' WHEN 3 THEN 'Completed' WHEN 4 THEN 'Cancelled' ELSE ht.status::text END AS Status,
                r.number                        AS RoomNumber,
                r.floor                         AS Floor,
                req.first_name || ' ' || req.last_name  AS RequestedBy,
                asgn.first_name || ' ' || asgn.last_name AS AssignedTo,
                ht.due_date                     AS DueDate,
                ht.created_at                   AS CreatedAt
            FROM housekeeping_tasks ht
            JOIN rooms r ON r.id = ht.room_id
            JOIN users req ON req.id = ht.requested_by_user_id
            LEFT JOIN users asgn ON asgn.id = ht.assigned_to_user_id
            {whereClause}
            ORDER BY
                CASE ht.status WHEN 1 THEN 0 WHEN 2 THEN 1 ELSE 2 END,
                ht.due_date ASC NULLS LAST,
                ht.created_at DESC
            LIMIT @PageSize OFFSET @Offset
            """;

        var total = await QuerySingleAsync<int>(countSql, parameters, ct);
        var items = await QueryAsync<HousekeepingTaskListItemDto>(dataSql, parameters, ct);

        return new PagedResultDto<HousekeepingTaskListItemDto>(items, total, filter.Page, filter.PageSize);
    }

    public async Task<HousekeepingTaskDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                ht.id                           AS Id,
                CASE ht.type WHEN 1 THEN 'General' WHEN 2 THEN 'Checkout' WHEN 3 THEN 'Turndown' WHEN 4 THEN 'DeepCleaning' WHEN 5 THEN 'Replenishment' ELSE ht.type::text END AS Type,
                CASE ht.status WHEN 1 THEN 'Pending' WHEN 2 THEN 'InProgress' WHEN 3 THEN 'Completed' WHEN 4 THEN 'Cancelled' ELSE ht.status::text END AS Status,
                ht.notes                        AS Notes,
                ht.completion_notes             AS CompletionNotes,
                ht.due_date                     AS DueDate,
                ht.completed_at                 AS CompletedAt,
                ht.room_id                      AS RoomId,
                r.number                        AS RoomNumber,
                r.floor                         AS Floor,
                ht.requested_by_user_id         AS RequestedByUserId,
                req.first_name || ' ' || req.last_name AS RequestedBy,
                ht.assigned_to_user_id          AS AssignedToUserId,
                asgn.first_name || ' ' || asgn.last_name AS AssignedTo,
                ht.created_at                   AS CreatedAt,
                ht.updated_at                   AS UpdatedAt
            FROM housekeeping_tasks ht
            JOIN rooms r ON r.id = ht.room_id
            JOIN users req ON req.id = ht.requested_by_user_id
            LEFT JOIN users asgn ON asgn.id = ht.assigned_to_user_id
            WHERE ht.id = @Id
            """;

        return await QueryFirstOrDefaultAsync<HousekeepingTaskDetailDto>(sql, new { Id = id }, ct);
    }

    private static string BuildWhereClause(HousekeepingFilterDto filter, DynamicParameters parameters)
    {
        var conditions = new List<string>();

        if (!string.IsNullOrEmpty(filter.Status) &&
            Enum.TryParse<HousekeepingStatus>(filter.Status, out var statusEnum))
        {
            conditions.Add("ht.status = @Status");
            parameters.Add("Status", (int)statusEnum);
        }
        if (!string.IsNullOrEmpty(filter.Type) &&
            Enum.TryParse<HousekeepingTaskType>(filter.Type, out var typeEnum))
        {
            conditions.Add("ht.type = @Type");
            parameters.Add("Type", (int)typeEnum);
        }
        if (filter.RoomId.HasValue)
        {
            conditions.Add("ht.room_id = @RoomId");
            parameters.Add("RoomId", filter.RoomId.Value);
        }
        if (filter.AssignedToUserId.HasValue)
        {
            conditions.Add("ht.assigned_to_user_id = @AssignedToUserId");
            parameters.Add("AssignedToUserId", filter.AssignedToUserId.Value);
        }

        return conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
    }
}
