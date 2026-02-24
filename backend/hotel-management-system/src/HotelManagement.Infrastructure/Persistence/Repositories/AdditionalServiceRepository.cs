using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class AdditionalServiceRepository : BaseRepository<AdditionalService>, IAdditionalServiceRepository
{
    public AdditionalServiceRepository(ApplicationDbContext context) : base(context) { }

    public new async Task<AdditionalService?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null, CancellationToken ct = default)
        => await _dbSet.AnyAsync(
            s => s.Name == name && s.IsActive && (excludeId == null || s.Id != excludeId.Value),
            ct);

    public new async Task AddAsync(AdditionalService service, CancellationToken ct = default)
        => await _dbSet.AddAsync(service, ct);

    public new void Update(AdditionalService service)
        => _dbSet.Update(service);
}
