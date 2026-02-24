using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using MediatR;

namespace HotelManagement.Application.Features.AdditionalServices.Queries;

public record GetAdditionalServicesQuery : IRequest<IEnumerable<AdditionalServiceDto>>;

public class GetAdditionalServicesQueryHandler : IRequestHandler<GetAdditionalServicesQuery, IEnumerable<AdditionalServiceDto>>
{
    private readonly IAdditionalServiceQueryService _queryService;

    public GetAdditionalServicesQueryHandler(IAdditionalServiceQueryService queryService)
        => _queryService = queryService;

    public Task<IEnumerable<AdditionalServiceDto>> Handle(GetAdditionalServicesQuery request, CancellationToken cancellationToken)
        => _queryService.GetAllAsync(cancellationToken);
}

public record GetAdditionalServiceByIdQuery(Guid Id) : IRequest<AdditionalServiceDto>;

public class GetAdditionalServiceByIdQueryHandler : IRequestHandler<GetAdditionalServiceByIdQuery, AdditionalServiceDto>
{
    private readonly IAdditionalServiceQueryService _queryService;

    public GetAdditionalServiceByIdQueryHandler(IAdditionalServiceQueryService queryService)
        => _queryService = queryService;

    public async Task<AdditionalServiceDto> Handle(GetAdditionalServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _queryService.GetByIdAsync(request.Id, cancellationToken);
        return result ?? throw new NotFoundException("AdditionalService", request.Id);
    }
}
