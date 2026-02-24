using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record DeleteRoomCommand(Guid Id) : IRequest;

// ── Handler ───────────────────────────────────────────────────────────────────

public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRoomCommandHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.Id);

        room.Deactivate();
        _roomRepository.Update(room);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
