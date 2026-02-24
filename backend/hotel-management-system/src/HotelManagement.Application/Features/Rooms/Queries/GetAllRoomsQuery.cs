using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries;

public record GetAllRoomsQuery : IRequest<IEnumerable<RoomListItemDto>>;

public class GetAllRoomsQueryHandler : IRequestHandler<GetAllRoomsQuery, IEnumerable<RoomListItemDto>>
{
    private readonly IRoomQueryService _queryService;

    public GetAllRoomsQueryHandler(IRoomQueryService queryService) => _queryService = queryService;

    public Task<IEnumerable<RoomListItemDto>> Handle(GetAllRoomsQuery request, CancellationToken cancellationToken)
        => _queryService.GetAllRoomsAsync(cancellationToken);
}
