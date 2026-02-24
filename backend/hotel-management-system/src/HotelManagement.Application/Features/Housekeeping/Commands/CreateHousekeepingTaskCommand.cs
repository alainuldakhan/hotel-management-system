using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Housekeeping.Commands;

public record CreateHousekeepingTaskCommand(
    Guid RoomId,
    Guid RequestedByUserId,
    HousekeepingTaskType Type,
    string? Notes = null,
    DateTime? DueDate = null
) : IRequest<Guid>;

public class CreateHousekeepingTaskCommandValidator : AbstractValidator<CreateHousekeepingTaskCommand>
{
    public CreateHousekeepingTaskCommandValidator()
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.RequestedByUserId).NotEmpty();
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}

public class CreateHousekeepingTaskCommandHandler : IRequestHandler<CreateHousekeepingTaskCommand, Guid>
{
    private readonly IHousekeepingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateHousekeepingTaskCommandHandler(IHousekeepingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateHousekeepingTaskCommand request, CancellationToken cancellationToken)
    {
        var task = HousekeepingTask.Create(
            request.RoomId, request.RequestedByUserId,
            request.Type, request.Notes, request.DueDate);

        await _repository.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}
