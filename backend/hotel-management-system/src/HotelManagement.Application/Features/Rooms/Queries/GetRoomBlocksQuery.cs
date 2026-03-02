using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries;

public record GetRoomBlocksQuery(Guid RoomId) : IRequest<IEnumerable<RoomBlockDto>>;

public class GetRoomBlocksQueryHandler : IRequestHandler<GetRoomBlocksQuery, IEnumerable<RoomBlockDto>>
{
    private readonly IRoomBlockQueryService _queryService;

    public GetRoomBlocksQueryHandler(IRoomBlockQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<RoomBlockDto>> Handle(GetRoomBlocksQuery request, CancellationToken ct)
        => _queryService.GetByRoomIdAsync(request.RoomId, ct);
}

public record GetActiveBlocksQuery() : IRequest<IEnumerable<RoomBlockDto>>;

public class GetActiveBlocksQueryHandler : IRequestHandler<GetActiveBlocksQuery, IEnumerable<RoomBlockDto>>
{
    private readonly IRoomBlockQueryService _queryService;

    public GetActiveBlocksQueryHandler(IRoomBlockQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<RoomBlockDto>> Handle(GetActiveBlocksQuery request, CancellationToken ct)
        => _queryService.GetActiveBlocksAsync(ct);
}
