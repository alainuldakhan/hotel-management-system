using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Features.Invoices.Queries;

public record GetAllInvoicesQuery(InvoiceFilterDto Filter) : IRequest<PagedResultDto<InvoiceDto>>;

public class GetAllInvoicesQueryHandler
    : IRequestHandler<GetAllInvoicesQuery, PagedResultDto<InvoiceDto>>
{
    private readonly IInvoiceQueryService _queryService;

    public GetAllInvoicesQueryHandler(IInvoiceQueryService queryService)
        => _queryService = queryService;

    public Task<PagedResultDto<InvoiceDto>> Handle(GetAllInvoicesQuery request, CancellationToken ct)
        => _queryService.GetAllPagedAsync(request.Filter, ct);
}
