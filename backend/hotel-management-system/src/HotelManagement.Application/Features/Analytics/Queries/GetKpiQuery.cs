using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Analytics.Queries;

public record GetKpiQuery(DateTime From, DateTime To) : IRequest<HotelKpiDto>;

public class GetKpiQueryHandler : IRequestHandler<GetKpiQuery, HotelKpiDto>
{
    private readonly IAnalyticsQueryService _queryService;

    public GetKpiQueryHandler(IAnalyticsQueryService queryService)
        => _queryService = queryService;

    public Task<HotelKpiDto> Handle(GetKpiQuery request, CancellationToken ct)
        => _queryService.GetKpiStatsAsync(request.From, request.To, ct);
}
