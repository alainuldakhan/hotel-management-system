using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IPricingRuleRepository
{
    Task<PricingRule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(PricingRule rule, CancellationToken ct = default);
    void Update(PricingRule rule);
}
