using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Housekeeping.Commands;

public record CancelHousekeepingTaskCommand(Guid Id) : IRequest;

public class CancelHousekeepingTaskCommandHandler : IRequestHandler<CancelHousekeepingTaskCommand>
{
    private readonly IHousekeepingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelHousekeepingTaskCommandHandler(IHousekeepingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelHousekeepingTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(HousekeepingTask), request.Id);

        task.Cancel();
        _repository.Update(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
