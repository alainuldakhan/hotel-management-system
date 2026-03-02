using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IRoomBlockRepository
{
    Task<RoomBlock?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(RoomBlock block, CancellationToken ct = default);
    void Update(RoomBlock block);

    /// <summary>Проверяет наличие активной блокировки номера на указанный период</summary>
    Task<bool> HasActiveBlockAsync(
        Guid roomId, DateTime from, DateTime to, CancellationToken ct = default);
}
