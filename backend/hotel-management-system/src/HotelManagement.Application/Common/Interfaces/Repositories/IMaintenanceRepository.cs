using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IMaintenanceRepository
{
    Task<MaintenanceRequest?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(MaintenanceRequest request, CancellationToken ct = default);
    void Update(MaintenanceRequest request);
}
