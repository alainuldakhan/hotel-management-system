using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries;

public record GetRoomByIdQuery(Guid Id) : IRequest<RoomDetailDto>;

public class GetRoomByIdQueryHandler : IRequestHandler<GetRoomByIdQuery, RoomDetailDto>
{
    private readonly IRoomQueryService _queryService;

    public GetRoomByIdQueryHandler(IRoomQueryService queryService) => _queryService = queryService;

    public async Task<RoomDetailDto> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetRoomDetailAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("Room", request.Id);
    }
}
