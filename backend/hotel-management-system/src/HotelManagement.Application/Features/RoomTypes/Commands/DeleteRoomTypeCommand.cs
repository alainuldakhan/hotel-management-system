using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.RoomTypes.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record DeleteRoomTypeCommand(Guid Id) : IRequest;

// ── Handler ───────────────────────────────────────────────────────────────────

public class DeleteRoomTypeCommandHandler : IRequestHandler<DeleteRoomTypeCommand>
{
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRoomTypeCommandHandler(IRoomTypeRepository roomTypeRepository, IUnitOfWork unitOfWork)
    {
        _roomTypeRepository = roomTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var roomType = await _roomTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(RoomType), request.Id);

        if (await _roomTypeRepository.HasRoomsAsync(request.Id, cancellationToken))
            throw new DomainException("Cannot deactivate a room type that has active rooms assigned to it.");

        roomType.Deactivate();
        _roomTypeRepository.Update(roomType);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
