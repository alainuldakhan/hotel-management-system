using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.Invoices.Queries;

public record GetInvoicesByBookingQuery(Guid BookingId) : IRequest<IEnumerable<InvoiceDto>>;

public class GetInvoicesByBookingQueryHandler : IRequestHandler<GetInvoicesByBookingQuery, IEnumerable<InvoiceDto>>
{
    private readonly IInvoiceQueryService _queryService;

    public GetInvoicesByBookingQueryHandler(IInvoiceQueryService queryService) => _queryService = queryService;

    public Task<IEnumerable<InvoiceDto>> Handle(GetInvoicesByBookingQuery request, CancellationToken cancellationToken)
        => _queryService.GetByBookingIdAsync(request.BookingId, cancellationToken);
}

public record GetInvoiceByIdQuery(Guid Id) : IRequest<InvoiceDto>;

public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, InvoiceDto>
{
    private readonly IInvoiceQueryService _queryService;

    public GetInvoiceByIdQueryHandler(IInvoiceQueryService queryService) => _queryService = queryService;

    public async Task<InvoiceDto> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("Invoice", request.Id);
    }
}
