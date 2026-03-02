using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands;

// ── Block Room ────────────────────────────────────────────────────────────────

public record BlockRoomCommand(
    Guid RoomId,
    DateTime BlockedFrom,
    DateTime BlockedTo,
    string Reason,
    Guid BlockedByUserId
) : IRequest<Guid>;

public class BlockRoomCommandValidator : AbstractValidator<BlockRoomCommand>
{
    public BlockRoomCommandValidator()
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.BlockedFrom).GreaterThanOrEqualTo(DateTime.UtcNow.Date);
        RuleFor(x => x.BlockedTo).GreaterThan(x => x.BlockedFrom);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BlockedByUserId).NotEmpty();
    }
}

public class BlockRoomCommandHandler : IRequestHandler<BlockRoomCommand, Guid>
{
    private readonly IRoomBlockRepository _blockRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public BlockRoomCommandHandler(
        IRoomBlockRepository blockRepository,
        IRoomRepository roomRepository,
        IUnitOfWork unitOfWork)
    {
        _blockRepository = blockRepository;
        _roomRepository  = roomRepository;
        _unitOfWork      = unitOfWork;
    }

    public async Task<Guid> Handle(BlockRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.RoomId);

        var hasOverlap = await _blockRepository.HasActiveBlockAsync(
            request.RoomId, request.BlockedFrom, request.BlockedTo, cancellationToken);

        if (hasOverlap)
            throw new DomainException("The room already has an active block for the selected dates.");

        var block = RoomBlock.Create(
            request.RoomId,
            request.BlockedFrom,
            request.BlockedTo,
            request.Reason,
            request.BlockedByUserId
        );

        await _blockRepository.AddAsync(block, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return block.Id;
    }
}

// ── Unblock Room ──────────────────────────────────────────────────────────────

public record UnblockRoomCommand(Guid BlockId) : IRequest;

public class UnblockRoomCommandHandler : IRequestHandler<UnblockRoomCommand>
{
    private readonly IRoomBlockRepository _blockRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UnblockRoomCommandHandler(IRoomBlockRepository blockRepository, IUnitOfWork unitOfWork)
    {
        _blockRepository = blockRepository;
        _unitOfWork      = unitOfWork;
    }

    public async Task Handle(UnblockRoomCommand request, CancellationToken cancellationToken)
    {
        var block = await _blockRepository.GetByIdAsync(request.BlockId, cancellationToken)
            ?? throw new NotFoundException(nameof(RoomBlock), request.BlockId);

        block.Deactivate();
        _blockRepository.Update(block);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
