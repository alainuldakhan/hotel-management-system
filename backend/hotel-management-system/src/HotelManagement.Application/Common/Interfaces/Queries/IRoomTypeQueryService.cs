using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IRoomTypeQueryService
{
    Task<IEnumerable<RoomTypeListItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<RoomTypeDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
