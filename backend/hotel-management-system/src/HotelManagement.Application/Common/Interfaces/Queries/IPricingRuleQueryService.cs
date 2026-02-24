using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IPricingRuleQueryService
{
    Task<IEnumerable<PricingRuleDto>> GetAllAsync(CancellationToken ct = default);
    Task<PricingRuleDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
