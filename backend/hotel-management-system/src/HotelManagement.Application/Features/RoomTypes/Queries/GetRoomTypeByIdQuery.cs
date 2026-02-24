using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.RoomTypes.Queries;

// ── Query ─────────────────────────────────────────────────────────────────────

public record GetRoomTypeByIdQuery(Guid Id) : IRequest<RoomTypeDetailDto>;

// ── Handler ───────────────────────────────────────────────────────────────────

public class GetRoomTypeByIdQueryHandler : IRequestHandler<GetRoomTypeByIdQuery, RoomTypeDetailDto>
{
    private readonly IRoomTypeQueryService _queryService;

    public GetRoomTypeByIdQueryHandler(IRoomTypeQueryService queryService)
    {
        _queryService = queryService;
    }

    public async Task<RoomTypeDetailDto> Handle(GetRoomTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("RoomType", request.Id);
    }
}
