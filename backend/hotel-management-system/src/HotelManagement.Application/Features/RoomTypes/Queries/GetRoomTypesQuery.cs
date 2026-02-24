using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.RoomTypes.Queries;

// ── Query ─────────────────────────────────────────────────────────────────────

public record GetRoomTypesQuery : IRequest<IEnumerable<RoomTypeListItemDto>>;

// ── Handler ───────────────────────────────────────────────────────────────────

public class GetRoomTypesQueryHandler : IRequestHandler<GetRoomTypesQuery, IEnumerable<RoomTypeListItemDto>>
{
    private readonly IRoomTypeQueryService _queryService;

    public GetRoomTypesQueryHandler(IRoomTypeQueryService queryService)
    {
        _queryService = queryService;
    }

    public Task<IEnumerable<RoomTypeListItemDto>> Handle(GetRoomTypesQuery request, CancellationToken cancellationToken)
        => _queryService.GetAllAsync(cancellationToken);
}
