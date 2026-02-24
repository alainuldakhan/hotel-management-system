using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Maintenance.Commands;

public record CancelMaintenanceCommand(Guid Id) : IRequest;

public class CancelMaintenanceCommandHandler : IRequestHandler<CancelMaintenanceCommand>
{
    private readonly IMaintenanceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelMaintenanceCommandHandler(IMaintenanceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelMaintenanceCommand request, CancellationToken cancellationToken)
    {
        var maintenance = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(MaintenanceRequest), request.Id);

        maintenance.Cancel();
        _repository.Update(maintenance);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
