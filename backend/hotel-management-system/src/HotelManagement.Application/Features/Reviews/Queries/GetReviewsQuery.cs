using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Reviews.Queries;

public record GetReviewsQuery(Guid? RoomTypeId = null, int Page = 1, int PageSize = 20)
    : IRequest<PagedResultDto<ReviewDto>>;

public class GetReviewsQueryHandler : IRequestHandler<GetReviewsQuery, PagedResultDto<ReviewDto>>
{
    private readonly IReviewQueryService _queryService;

    public GetReviewsQueryHandler(IReviewQueryService queryService) => _queryService = queryService;

    public Task<PagedResultDto<ReviewDto>> Handle(GetReviewsQuery request, CancellationToken cancellationToken)
        => _queryService.GetPagedAsync(
            new ReviewFilterDto(request.RoomTypeId, request.Page, request.PageSize),
            cancellationToken);
}

public record GetRoomTypeRatingsQuery : IRequest<IEnumerable<RoomTypeRatingDto>>;

public class GetRoomTypeRatingsQueryHandler : IRequestHandler<GetRoomTypeRatingsQuery, IEnumerable<RoomTypeRatingDto>>
{
    private readonly IReviewQueryService _queryService;

    public GetRoomTypeRatingsQueryHandler(IReviewQueryService queryService) => _queryService = queryService;

    public Task<IEnumerable<RoomTypeRatingDto>> Handle(GetRoomTypeRatingsQuery request, CancellationToken cancellationToken)
        => _queryService.GetRatingsAsync(cancellationToken);
}
