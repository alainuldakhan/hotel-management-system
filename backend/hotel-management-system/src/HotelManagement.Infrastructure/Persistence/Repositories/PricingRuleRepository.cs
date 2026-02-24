using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;

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
}
