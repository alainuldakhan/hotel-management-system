using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Housekeeping.Queries;

public record GetHousekeepingTasksQuery(HousekeepingFilterDto Filter)
    : IRequest<PagedResultDto<HousekeepingTaskListItemDto>>;

public class GetHousekeepingTasksQueryHandler
    : IRequestHandler<GetHousekeepingTasksQuery, PagedResultDto<HousekeepingTaskListItemDto>>
{
    private readonly IHousekeepingQueryService _queryService;

    public GetHousekeepingTasksQueryHandler(IHousekeepingQueryService queryService)
        => _queryService = queryService;

    public Task<PagedResultDto<HousekeepingTaskListItemDto>> Handle(
        GetHousekeepingTasksQuery request, CancellationToken cancellationToken)
        => _queryService.GetPagedAsync(request.Filter, cancellationToken);
}

public record GetHousekeepingTaskByIdQuery(Guid Id) : IRequest<HousekeepingTaskDetailDto>;

public class GetHousekeepingTaskByIdQueryHandler
    : IRequestHandler<GetHousekeepingTaskByIdQuery, HousekeepingTaskDetailDto>
{
    private readonly IHousekeepingQueryService _queryService;

    public GetHousekeepingTaskByIdQueryHandler(IHousekeepingQueryService queryService)
        => _queryService = queryService;

    public async Task<HousekeepingTaskDetailDto> Handle(
        GetHousekeepingTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("HousekeepingTask", request.Id);
    }
}
