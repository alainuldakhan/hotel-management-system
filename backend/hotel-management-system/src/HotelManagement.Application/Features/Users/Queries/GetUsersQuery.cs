using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Users.Queries;

public record GetUsersQuery : IRequest<IEnumerable<UserListItemDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IEnumerable<UserListItemDto>>
{
    private readonly IUserQueryService _queryService;

    public GetUsersQueryHandler(IUserQueryService queryService) => _queryService = queryService;

    public Task<IEnumerable<UserListItemDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        => _queryService.GetAllAsync(cancellationToken);
}

public record GetUserByIdQuery(Guid Id) : IRequest<UserListItemDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserListItemDto>
{
    private readonly IUserQueryService _queryService;

    public GetUserByIdQueryHandler(IUserQueryService queryService) => _queryService = queryService;

    public async Task<UserListItemDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("User", request.Id);
    }
}
