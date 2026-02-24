using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.PricingRules.Queries;

public record GetPricingRulesQuery : IRequest<IEnumerable<PricingRuleDto>>;

public class GetPricingRulesQueryHandler : IRequestHandler<GetPricingRulesQuery, IEnumerable<PricingRuleDto>>
{
    private readonly IPricingRuleQueryService _queryService;

    public GetPricingRulesQueryHandler(IPricingRuleQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<PricingRuleDto>> Handle(GetPricingRulesQuery request, CancellationToken cancellationToken)
        => _queryService.GetAllAsync(cancellationToken);
}

public record GetPricingRuleByIdQuery(Guid Id) : IRequest<PricingRuleDto>;

public class GetPricingRuleByIdQueryHandler : IRequestHandler<GetPricingRuleByIdQuery, PricingRuleDto>
{
    private readonly IPricingRuleQueryService _queryService;

    public GetPricingRuleByIdQueryHandler(IPricingRuleQueryService queryService)
        => _queryService = queryService;

    public async Task<PricingRuleDto> Handle(GetPricingRuleByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("PricingRule", request.Id);
    }
}
