using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries;

public record GetAvailableRoomsQuery(
    DateTime CheckIn,
    DateTime CheckOut,
    int GuestsCount,
    Guid? RoomTypeId = null
) : IRequest<IEnumerable<RoomListItemDto>>;

public class GetAvailableRoomsQueryValidator : AbstractValidator<GetAvailableRoomsQuery>
{
    public GetAvailableRoomsQueryValidator()
    {
        RuleFor(x => x.CheckIn).GreaterThanOrEqualTo(DateTime.UtcNow.Date);
        RuleFor(x => x.CheckOut).GreaterThan(x => x.CheckIn).WithMessage("Check-out must be after check-in.");
        RuleFor(x => x.GuestsCount).GreaterThan(0).LessThanOrEqualTo(20);
    }
}

public class GetAvailableRoomsQueryHandler : IRequestHandler<GetAvailableRoomsQuery, IEnumerable<RoomListItemDto>>
{
    private readonly IRoomQueryService _queryService;

    public GetAvailableRoomsQueryHandler(IRoomQueryService queryService) => _queryService = queryService;

    public Task<IEnumerable<RoomListItemDto>> Handle(GetAvailableRoomsQuery request, CancellationToken cancellationToken)
        => _queryService.GetAvailableRoomsAsync(
            request.CheckIn, request.CheckOut,
            request.GuestsCount, request.RoomTypeId, cancellationToken);
}
