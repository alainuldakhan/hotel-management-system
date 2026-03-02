using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Queries;

// ── Arrivals ──────────────────────────────────────────────────────────────────

public record GetArrivalsQuery(DateTime? Date = null) : IRequest<IEnumerable<ArrivalItemDto>>;

public class GetArrivalsQueryHandler : IRequestHandler<GetArrivalsQuery, IEnumerable<ArrivalItemDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetArrivalsQueryHandler(IBookingQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<ArrivalItemDto>> Handle(GetArrivalsQuery request, CancellationToken ct)
        => _queryService.GetArrivalsAsync(request.Date ?? DateTime.UtcNow.Date, ct);
}

// ── Departures ────────────────────────────────────────────────────────────────

public record GetDeparturesQuery(DateTime? Date = null) : IRequest<IEnumerable<DepartureItemDto>>;

public class GetDeparturesQueryHandler : IRequestHandler<GetDeparturesQuery, IEnumerable<DepartureItemDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetDeparturesQueryHandler(IBookingQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<DepartureItemDto>> Handle(GetDeparturesQuery request, CancellationToken ct)
        => _queryService.GetDeparturesAsync(request.Date ?? DateTime.UtcNow.Date, ct);
}

// ── In-House ──────────────────────────────────────────────────────────────────

public record GetInHouseGuestsQuery() : IRequest<IEnumerable<InHouseGuestDto>>;

public class GetInHouseGuestsQueryHandler
    : IRequestHandler<GetInHouseGuestsQuery, IEnumerable<InHouseGuestDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetInHouseGuestsQueryHandler(IBookingQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<InHouseGuestDto>> Handle(GetInHouseGuestsQuery request, CancellationToken ct)
        => _queryService.GetInHouseGuestsAsync(ct);
}

// ── Forecast ──────────────────────────────────────────────────────────────────

public record GetForecastQuery(int Days = 30) : IRequest<IEnumerable<ForecastDayDto>>;

public class GetForecastQueryHandler : IRequestHandler<GetForecastQuery, IEnumerable<ForecastDayDto>>
{
    private readonly IBookingQueryService _queryService;

    public GetForecastQueryHandler(IBookingQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<ForecastDayDto>> Handle(GetForecastQuery request, CancellationToken ct)
        => _queryService.GetForecastAsync(request.Days, ct);
}
