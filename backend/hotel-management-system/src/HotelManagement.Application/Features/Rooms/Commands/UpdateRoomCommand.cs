using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record UpdateRoomCommand(
    Guid Id,
    string Number,
    int Floor,
    Guid RoomTypeId,
    string? Notes = null
) : IRequest;

// ── Validator ─────────────────────────────────────────────────────────────────

public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
{
    public UpdateRoomCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.Number)
            .NotEmpty().WithMessage("Room number is required.")
            .MaximumLength(10);

        RuleFor(x => x.Floor)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(100);

        RuleFor(x => x.RoomTypeId)
            .NotEmpty().WithMessage("Room type is required.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoomCommandHandler(
        IRoomRepository roomRepository,
        IRoomTypeRepository roomTypeRepository,
        IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _roomTypeRepository = roomTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.Id);

        // Check number uniqueness excluding self
        var existing = await _roomRepository.GetByNumberAsync(request.Number, cancellationToken);
        if (existing != null && existing.Id != request.Id)
            throw new DomainException($"Room '{request.Number}' already exists.");

        // Validate room type exists
        _ = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId, cancellationToken)
            ?? throw new NotFoundException(nameof(RoomType), request.RoomTypeId);

        room.Update(request.Number, request.Floor, request.RoomTypeId, request.Notes);
        _roomRepository.Update(room);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
