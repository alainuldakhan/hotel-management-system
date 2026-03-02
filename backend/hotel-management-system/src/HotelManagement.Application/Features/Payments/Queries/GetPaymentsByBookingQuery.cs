using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Payments.Queries;

public record GetPaymentsByBookingQuery(Guid BookingId) : IRequest<IEnumerable<PaymentDto>>;

public class GetPaymentsByBookingQueryHandler
    : IRequestHandler<GetPaymentsByBookingQuery, IEnumerable<PaymentDto>>
{
    private readonly IPaymentQueryService _queryService;

    public GetPaymentsByBookingQueryHandler(IPaymentQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<PaymentDto>> Handle(GetPaymentsByBookingQuery request, CancellationToken ct)
        => _queryService.GetByBookingIdAsync(request.BookingId, ct);
}
