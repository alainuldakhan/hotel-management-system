using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IRoomBlockQueryService
{
    Task<IEnumerable<RoomBlockDto>> GetByRoomIdAsync(Guid roomId, CancellationToken ct = default);
    Task<IEnumerable<RoomBlockDto>> GetActiveBlocksAsync(CancellationToken ct = default);
}
