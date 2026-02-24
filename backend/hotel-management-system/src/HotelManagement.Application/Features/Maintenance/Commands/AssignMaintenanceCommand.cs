using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Maintenance.Commands;

public record AssignMaintenanceCommand(Guid Id, Guid AssignedToUserId) : IRequest;

public class AssignMaintenanceCommandHandler : IRequestHandler<AssignMaintenanceCommand>
{
    private readonly IMaintenanceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignMaintenanceCommandHandler(IMaintenanceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AssignMaintenanceCommand request, CancellationToken cancellationToken)
    {
        var maintenance = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(MaintenanceRequest), request.Id);

        maintenance.Assign(request.AssignedToUserId);
        _repository.Update(maintenance);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
