using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IRoomTypeRepository
{
    Task<RoomType?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> NameExistsAsync(string name, Guid? excludeId = null, CancellationToken ct = default);
    Task<bool> HasRoomsAsync(Guid roomTypeId, CancellationToken ct = default);
    Task AddAsync(RoomType roomType, CancellationToken ct = default);
    void Update(RoomType roomType);
}
