using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Interfaces;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

/// <summary>
/// EF Core-репозиторий для Room — только команды (Write).
/// </summary>
public interface IRoomRepository : IRepository<Room>
{
    Task<Room?> GetByNumberAsync(string number, CancellationToken ct = default);
    Task<Room?> GetByIdWithTypeAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsAsync(string number, CancellationToken ct = default);
}
