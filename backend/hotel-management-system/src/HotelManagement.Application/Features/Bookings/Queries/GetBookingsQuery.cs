using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Queries;

public record GetBookingsQuery(BookingFilterDto Filter) : IRequest<PagedResultDto<BookingListItemDto>>;

public class GetBookingsQueryHandler : IRequestHandler<GetBookingsQuery, PagedResultDto<BookingListItemDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetBookingsQueryHandler(IBookingQueryService queryService) => _queryService = queryService;

    public Task<PagedResultDto<BookingListItemDto>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
        => _queryService.GetPagedAsync(request.Filter, cancellationToken);
}

public record GetBookingByIdQuery(Guid Id) : IRequest<BookingDetailDto>;

public class GetBookingByIdQueryHandler : IRequestHandler<GetBookingByIdQuery, BookingDetailDto>
{
    private readonly IBookingQueryService _queryService;

    public GetBookingByIdQueryHandler(IBookingQueryService queryService) => _queryService = queryService;

    public async Task<BookingDetailDto> Handle(GetBookingByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("Booking", request.Id);
    }
}

public record GetGuestBookingsQuery(Guid GuestId) : IRequest<IEnumerable<BookingListItemDto>>;

public class GetGuestBookingsQueryHandler : IRequestHandler<GetGuestBookingsQuery, IEnumerable<BookingListItemDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetGuestBookingsQueryHandler(IBookingQueryService queryService) => _queryService = queryService;

    public Task<IEnumerable<BookingListItemDto>> Handle(GetGuestBookingsQuery request, CancellationToken cancellationToken)
        => _queryService.GetGuestBookingsAsync(request.GuestId, cancellationToken);
}

public record GetBookingByQrQuery(string QrToken) : IRequest<BookingDetailDto>;

public class GetBookingByQrQueryHandler : IRequestHandler<GetBookingByQrQuery, BookingDetailDto>
{
    private readonly IBookingQueryService _queryService;

    public GetBookingByQrQueryHandler(IBookingQueryService queryService) => _queryService = queryService;

    public async Task<BookingDetailDto> Handle(GetBookingByQrQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByQrTokenAsync(request.QrToken, cancellationToken);
        return result ?? throw new NotFoundException("Booking", request.QrToken);
    }
}

// ── Шахматка ─────────────────────────────────────────────────────────────────

public record GetBookingGridQuery(DateTime StartDate, DateTime EndDate)
    : IRequest<List<RoomGridRowDto>>;

public class GetBookingGridQueryHandler : IRequestHandler<GetBookingGridQuery, List<RoomGridRowDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetBookingGridQueryHandler(IBookingQueryService queryService) => _queryService = queryService;

    public Task<List<RoomGridRowDto>> Handle(GetBookingGridQuery request, CancellationToken cancellationToken)
        => _queryService.GetGridAsync(request.StartDate, request.EndDate, cancellationToken);
}
