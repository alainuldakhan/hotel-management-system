using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Maintenance.Commands;

public record ResolveMaintenanceCommand(Guid Id, string Resolution) : IRequest;

public class ResolveMaintenanceCommandValidator : AbstractValidator<ResolveMaintenanceCommand>
{
    public ResolveMaintenanceCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Resolution).NotEmpty().MaximumLength(2000);
    }
}

public class ResolveMaintenanceCommandHandler : IRequestHandler<ResolveMaintenanceCommand>
{
    private readonly IMaintenanceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ResolveMaintenanceCommandHandler(IMaintenanceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ResolveMaintenanceCommand request, CancellationToken cancellationToken)
    {
        var maintenance = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(MaintenanceRequest), request.Id);

        maintenance.Resolve(request.Resolution);
        _repository.Update(maintenance);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
