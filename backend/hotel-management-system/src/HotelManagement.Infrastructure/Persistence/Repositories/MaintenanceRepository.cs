using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class MaintenanceRepository : BaseRepository<MaintenanceRequest>, IMaintenanceRepository
{
    public MaintenanceRepository(ApplicationDbContext context) : base(context) { }

    public new async Task<MaintenanceRequest?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public new async Task AddAsync(MaintenanceRequest request, CancellationToken ct = default)
        => await _dbSet.AddAsync(request, ct);

    public new void Update(MaintenanceRequest request)
        => _dbSet.Update(request);
}
