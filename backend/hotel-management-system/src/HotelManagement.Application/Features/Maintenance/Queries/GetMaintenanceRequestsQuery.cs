using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Maintenance.Queries;

public record GetMaintenanceRequestsQuery(MaintenanceFilterDto Filter) : IRequest<PagedResultDto<MaintenanceRequestListItemDto>>;

public class GetMaintenanceRequestsQueryHandler : IRequestHandler<GetMaintenanceRequestsQuery, PagedResultDto<MaintenanceRequestListItemDto>>
{
    private readonly IMaintenanceQueryService _queryService;

    public GetMaintenanceRequestsQueryHandler(IMaintenanceQueryService queryService) => _queryService = queryService;

    public Task<PagedResultDto<MaintenanceRequestListItemDto>> Handle(GetMaintenanceRequestsQuery request, CancellationToken cancellationToken)
        => _queryService.GetPagedAsync(request.Filter, cancellationToken);
}

public record GetMaintenanceRequestByIdQuery(Guid Id) : IRequest<MaintenanceRequestDetailDto>;

public class GetMaintenanceRequestByIdQueryHandler : IRequestHandler<GetMaintenanceRequestByIdQuery, MaintenanceRequestDetailDto>
{
    private readonly IMaintenanceQueryService _queryService;

    public GetMaintenanceRequestByIdQueryHandler(IMaintenanceQueryService queryService) => _queryService = queryService;

    public async Task<MaintenanceRequestDetailDto> Handle(GetMaintenanceRequestByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("MaintenanceRequest", request.Id);
    }
}
