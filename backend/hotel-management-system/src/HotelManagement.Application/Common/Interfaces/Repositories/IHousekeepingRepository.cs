using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IHousekeepingRepository
{
    Task<HousekeepingTask?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(HousekeepingTask task, CancellationToken ct = default);
    void Update(HousekeepingTask task);
}
