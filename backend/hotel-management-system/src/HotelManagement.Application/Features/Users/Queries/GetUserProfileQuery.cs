using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Users.Queries;

public record GetUserProfileQuery(Guid UserId) : IRequest<UserProfileDto>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserQueryService _queryService;

    public GetUserProfileQueryHandler(IUserQueryService queryService) => _queryService = queryService;

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await _queryService.GetProfileAsync(request.UserId, cancellationToken);
        return profile ?? throw new NotFoundException("User", request.UserId);
    }
}
