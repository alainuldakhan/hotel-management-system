using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record CreateRoomCommand(
    string Number,
    int Floor,
    Guid RoomTypeId,
    string? Notes = null
) : IRequest<Guid>;

// ── Validator ─────────────────────────────────────────────────────────────────

public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(x => x.Number)
            .NotEmpty().WithMessage("Room number is required.")
            .MaximumLength(10);

        RuleFor(x => x.Floor)
            .GreaterThanOrEqualTo(0).WithMessage("Floor must be 0 or greater.")
            .LessThanOrEqualTo(100);

        RuleFor(x => x.RoomTypeId)
            .NotEmpty().WithMessage("Room type is required.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Guid>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRoomCommandHandler(
        IRoomRepository roomRepository,
        IRoomTypeRepository roomTypeRepository,
        IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _roomTypeRepository = roomTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        if (await _roomRepository.ExistsAsync(request.Number, cancellationToken))
            throw new DomainException($"Room '{request.Number}' already exists.");

        var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId, cancellationToken)
            ?? throw new NotFoundException(nameof(RoomType), request.RoomTypeId);

        var room = Room.Create(request.Number, request.Floor, request.RoomTypeId, request.Notes);

        await _roomRepository.AddAsync(room, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return room.Id;
    }
}
