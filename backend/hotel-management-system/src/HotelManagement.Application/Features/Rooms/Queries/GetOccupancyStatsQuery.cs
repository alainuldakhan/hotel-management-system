using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries;

public record GetOccupancyStatsQuery : IRequest<RoomOccupancyStatsDto>;

public class GetOccupancyStatsQueryHandler : IRequestHandler<GetOccupancyStatsQuery, RoomOccupancyStatsDto>
{
    private readonly IRoomQueryService _queryService;

    public GetOccupancyStatsQueryHandler(IRoomQueryService queryService) => _queryService = queryService;

    public Task<RoomOccupancyStatsDto> Handle(GetOccupancyStatsQuery request, CancellationToken cancellationToken)
        => _queryService.GetOccupancyStatsAsync(cancellationToken);
}
