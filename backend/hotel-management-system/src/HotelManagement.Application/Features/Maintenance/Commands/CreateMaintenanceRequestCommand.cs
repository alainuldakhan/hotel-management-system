using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Maintenance.Commands;

public record CreateMaintenanceRequestCommand(
    Guid RoomId,
    Guid ReportedByUserId,
    string Title,
    string Description,
    MaintenancePriority Priority = MaintenancePriority.Medium
) : IRequest<Guid>;

public class CreateMaintenanceRequestCommandValidator : AbstractValidator<CreateMaintenanceRequestCommand>
{
    public CreateMaintenanceRequestCommandValidator()
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.ReportedByUserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Priority).IsInEnum();
    }
}

public class CreateMaintenanceRequestCommandHandler : IRequestHandler<CreateMaintenanceRequestCommand, Guid>
{
    private readonly IMaintenanceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMaintenanceRequestCommandHandler(IMaintenanceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateMaintenanceRequestCommand request, CancellationToken cancellationToken)
    {
        var maintenanceRequest = MaintenanceRequest.Create(
            request.RoomId, request.ReportedByUserId,
            request.Title, request.Description, request.Priority);

        await _repository.AddAsync(maintenanceRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return maintenanceRequest.Id;
    }
}
