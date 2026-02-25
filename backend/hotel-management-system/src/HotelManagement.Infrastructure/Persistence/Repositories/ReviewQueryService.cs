using Dapper;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class ReviewQueryService : DapperQueryBase, IReviewQueryService
{
    public ReviewQueryService(IDbConnectionFactory connectionFactory)
        : base(connectionFactory) { }

    public async Task<PagedResultDto<ReviewDto>> GetPagedAsync(ReviewFilterDto filter, CancellationToken ct = default)
    {
        var whereClause = filter.RoomTypeId.HasValue
            ? "WHERE r.room_type_id = @RoomTypeId"
            : "";

        var countSql = $"""
            SELECT COUNT(*) FROM reviews r
            {whereClause}
            """;

        var dataSql = $"""
            SELECT
                r.id                                                AS Id,
                r.rating                                            AS Rating,
                r.comment                                           AS Comment,
                u.first_name || ' ' || u.last_name                 AS GuestFullName,
                rt.name                                             AS RoomTypeName,
                r.created_at                                        AS CreatedAt
            FROM reviews r
            JOIN users u      ON u.id  = r.guest_id
            JOIN room_types rt ON rt.id = r.room_type_id
            {whereClause}
            ORDER BY r.created_at DESC
            LIMIT @PageSize OFFSET @Offset
            """;

        var param = new
        {
            RoomTypeId = filter.RoomTypeId,
            PageSize   = filter.PageSize,
            Offset     = (filter.Page - 1) * filter.PageSize,
        };

        using var connection = _connectionFactory.CreateConnection();
        var total = await connection.ExecuteScalarAsync<int>(countSql, param);
        var items = (await connection.QueryAsync<ReviewDto>(dataSql, param)).ToList();

        return new PagedResultDto<ReviewDto>(items, total, filter.Page, filter.PageSize);
    }

    public async Task<IEnumerable<RoomTypeRatingDto>> GetRatingsAsync(CancellationToken ct = default)
    {
        var sql = """
            SELECT
                rt.id                       AS RoomTypeId,
                rt.name                     AS RoomTypeName,
                ROUND(AVG(r.rating), 2)     AS AverageRating,
                COUNT(r.id)                 AS ReviewCount
            FROM room_types rt
            LEFT JOIN reviews r ON r.room_type_id = rt.id
            GROUP BY rt.id, rt.name
            ORDER BY AverageRating DESC NULLS LAST
            """;

        return await QueryAsync<RoomTypeRatingDto>(sql, ct: ct);
    }

    public async Task<bool> ReviewExistsForBookingAsync(Guid bookingId, CancellationToken ct = default)
    {
        var sql = "SELECT COUNT(1) FROM reviews WHERE booking_id = @BookingId";
        using var connection = _connectionFactory.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { BookingId = bookingId });
        return count > 0;
    }
}
