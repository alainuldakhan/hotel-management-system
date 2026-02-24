using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Housekeeping.Commands;

public record AssignHousekeepingTaskCommand(Guid Id, Guid AssignedToUserId) : IRequest;

public class AssignHousekeepingTaskCommandValidator : AbstractValidator<AssignHousekeepingTaskCommand>
{
    public AssignHousekeepingTaskCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AssignedToUserId).NotEmpty();
    }
}

public class AssignHousekeepingTaskCommandHandler : IRequestHandler<AssignHousekeepingTaskCommand>
{
    private readonly IHousekeepingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignHousekeepingTaskCommandHandler(IHousekeepingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AssignHousekeepingTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(HousekeepingTask), request.Id);

        task.Assign(request.AssignedToUserId);
        _repository.Update(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
