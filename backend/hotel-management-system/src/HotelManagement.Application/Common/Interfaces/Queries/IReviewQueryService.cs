using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IReviewQueryService
{
    Task<PagedResultDto<ReviewDto>> GetPagedAsync(ReviewFilterDto filter, CancellationToken ct = default);
    Task<IEnumerable<RoomTypeRatingDto>> GetRatingsAsync(CancellationToken ct = default);
    Task<bool> ReviewExistsForBookingAsync(Guid bookingId, CancellationToken ct = default);
}
