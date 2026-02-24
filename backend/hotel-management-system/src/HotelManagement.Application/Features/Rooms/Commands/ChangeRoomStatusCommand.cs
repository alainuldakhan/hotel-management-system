using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record ChangeRoomStatusCommand(Guid Id, RoomStatus Status) : IRequest;

// ── Validator ─────────────────────────────────────────────────────────────────

public class ChangeRoomStatusCommandValidator : AbstractValidator<ChangeRoomStatusCommand>
{
    public ChangeRoomStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class ChangeRoomStatusCommandHandler : IRequestHandler<ChangeRoomStatusCommand>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ChangeRoomStatusCommandHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ChangeRoomStatusCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.Id);

        room.ChangeStatus(request.Status);
        _roomRepository.Update(room);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
