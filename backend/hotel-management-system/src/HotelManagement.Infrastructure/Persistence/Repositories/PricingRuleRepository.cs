using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class PricingRuleRepository : BaseRepository<PricingRule>, IPricingRuleRepository
{
    public PricingRuleRepository(ApplicationDbContext context) : base(context) { }

    public new async Task<PricingRule?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public new async Task AddAsync(PricingRule rule, CancellationToken ct = default)
        => await _dbSet.AddAsync(rule, ct);

    public new void Update(PricingRule rule)
        => _dbSet.Update(rule);

    public async Task<IReadOnlyList<PricingRule>> GetActiveRulesForRoomTypeAsync(
        Guid? roomTypeId, CancellationToken ct = default)
        => await _dbSet
            .Where(r => r.IsActive
                && (r.RoomTypeId == null || r.RoomTypeId == roomTypeId))
            .ToListAsync(ct);
}
