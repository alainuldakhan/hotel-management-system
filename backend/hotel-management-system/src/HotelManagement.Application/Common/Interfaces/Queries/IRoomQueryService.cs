using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

/// <summary>
/// Dapper Query-сервис для номеров — только чтение (Read).
/// Использует сырой SQL для максимальной производительности.
/// </summary>
public interface IRoomQueryService
{
    Task<IEnumerable<RoomListItemDto>> GetAvailableRoomsAsync(
        DateTime checkIn, DateTime checkOut,
        int guestsCount, Guid? roomTypeId = null,
        CancellationToken ct = default);

    Task<RoomDetailDto?> GetRoomDetailAsync(Guid roomId, CancellationToken ct = default);
    Task<IEnumerable<RoomListItemDto>> GetAllRoomsAsync(CancellationToken ct = default);
    Task<RoomOccupancyStatsDto> GetOccupancyStatsAsync(CancellationToken ct = default);
}
