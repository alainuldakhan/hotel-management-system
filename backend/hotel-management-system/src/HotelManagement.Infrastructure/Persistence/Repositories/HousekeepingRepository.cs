using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class HousekeepingRepository : BaseRepository<HousekeepingTask>, IHousekeepingRepository
{
    public HousekeepingRepository(ApplicationDbContext context) : base(context) { }

    public new async Task<HousekeepingTask?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public new async Task AddAsync(HousekeepingTask task, CancellationToken ct = default)
        => await _dbSet.AddAsync(task, ct);

    public new void Update(HousekeepingTask task)
        => _dbSet.Update(task);
}
