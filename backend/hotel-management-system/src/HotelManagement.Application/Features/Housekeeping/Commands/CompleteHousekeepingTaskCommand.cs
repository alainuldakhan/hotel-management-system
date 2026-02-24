using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Housekeeping.Commands;

public record CompleteHousekeepingTaskCommand(Guid Id, string? CompletionNotes = null) : IRequest;

public class CompleteHousekeepingTaskCommandHandler : IRequestHandler<CompleteHousekeepingTaskCommand>
{
    private readonly IHousekeepingRepository _repository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompleteHousekeepingTaskCommandHandler(
        IHousekeepingRepository repository,
        IRoomRepository roomRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _roomRepository = roomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CompleteHousekeepingTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(HousekeepingTask), request.Id);

        task.Complete(request.CompletionNotes);
        _repository.Update(task);

        // После уборки — устанавливаем номер обратно в Available
        var room = await _roomRepository.GetByIdAsync(task.RoomId, cancellationToken);
        if (room != null && room.Status == Domain.Enums.RoomStatus.Cleaning)
        {
            room.ChangeStatus(Domain.Enums.RoomStatus.Available);
            _roomRepository.Update(room);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
