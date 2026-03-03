using Dapper;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class MaintenanceQueryService : DapperQueryBase, IMaintenanceQueryService
{
    public MaintenanceQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<PagedResultDto<MaintenanceRequestListItemDto>> GetPagedAsync(
        MaintenanceFilterDto filter, CancellationToken ct = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("Offset", (filter.Page - 1) * filter.PageSize);
        parameters.Add("PageSize", filter.PageSize);

        var whereClause = BuildWhereClause(filter, parameters);

        var countSql = $"SELECT COUNT(*) FROM maintenance_requests mr {whereClause}";

        var dataSql = $"""
            SELECT
                mr.id                       AS Id,
                mr.title                    AS Title,
                CASE mr.status WHEN 1 THEN 'New' WHEN 2 THEN 'InProgress' WHEN 3 THEN 'Completed' WHEN 4 THEN 'Cancelled' ELSE mr.status::text END AS Status,
                CASE mr.priority WHEN 1 THEN 'Low' WHEN 2 THEN 'Medium' WHEN 3 THEN 'High' WHEN 4 THEN 'Critical' ELSE mr.priority::text END AS Priority,
                r.number                    AS RoomNumber,
                rep.first_name || ' ' || rep.last_name AS ReportedBy,
                asgn.first_name || ' ' || asgn.last_name AS AssignedTo,
                mr.created_at               AS CreatedAt
            FROM maintenance_requests mr
            JOIN rooms r ON r.id = mr.room_id
            JOIN users rep ON rep.id = mr.reported_by_user_id
            LEFT JOIN users asgn ON asgn.id = mr.assigned_to_user_id
            {whereClause}
            ORDER BY mr.created_at DESC
            LIMIT @PageSize OFFSET @Offset
            """;

        var total = await QuerySingleAsync<int>(countSql, parameters, ct);
        var items = await QueryAsync<MaintenanceRequestListItemDto>(dataSql, parameters, ct);

        return new PagedResultDto<MaintenanceRequestListItemDto>(items, total, filter.Page, filter.PageSize);
    }

    public async Task<MaintenanceRequestDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                mr.id                       AS Id,
                mr.title                    AS Title,
                mr.description              AS Description,
                CASE mr.status WHEN 1 THEN 'New' WHEN 2 THEN 'InProgress' WHEN 3 THEN 'Completed' WHEN 4 THEN 'Cancelled' ELSE mr.status::text END AS Status,
                CASE mr.priority WHEN 1 THEN 'Low' WHEN 2 THEN 'Medium' WHEN 3 THEN 'High' WHEN 4 THEN 'Critical' ELSE mr.priority::text END AS Priority,
                mr.resolution               AS Resolution,
                mr.resolved_at              AS ResolvedAt,
                mr.room_id                  AS RoomId,
                r.number                    AS RoomNumber,
                mr.reported_by_user_id      AS ReportedByUserId,
                rep.first_name || ' ' || rep.last_name AS ReportedBy,
                mr.assigned_to_user_id      AS AssignedToUserId,
                asgn.first_name || ' ' || asgn.last_name AS AssignedTo,
                mr.created_at               AS CreatedAt,
                mr.updated_at               AS UpdatedAt
            FROM maintenance_requests mr
            JOIN rooms r ON r.id = mr.room_id
            JOIN users rep ON rep.id = mr.reported_by_user_id
            LEFT JOIN users asgn ON asgn.id = mr.assigned_to_user_id
            WHERE mr.id = @Id
            """;

        return await QueryFirstOrDefaultAsync<MaintenanceRequestDetailDto>(sql, new { Id = id }, ct);
    }

    private static string BuildWhereClause(MaintenanceFilterDto filter, DynamicParameters parameters)
    {
        var conditions = new List<string>();

        if (!string.IsNullOrEmpty(filter.Status) &&
            Enum.TryParse<MaintenanceStatus>(filter.Status, out var statusEnum))
        {
            conditions.Add("mr.status = @Status");
            parameters.Add("Status", (int)statusEnum);
        }
        if (!string.IsNullOrEmpty(filter.Priority) &&
            Enum.TryParse<MaintenancePriority>(filter.Priority, out var priorityEnum))
        {
            conditions.Add("mr.priority = @Priority");
            parameters.Add("Priority", (int)priorityEnum);
        }
        if (filter.RoomId.HasValue)
        {
            conditions.Add("mr.room_id = @RoomId");
            parameters.Add("RoomId", filter.RoomId.Value);
        }
        if (filter.AssignedToUserId.HasValue)
        {
            conditions.Add("mr.assigned_to_user_id = @AssignedToUserId");
            parameters.Add("AssignedToUserId", filter.AssignedToUserId.Value);
        }

        return conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
    }
}
