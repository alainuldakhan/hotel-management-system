using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.RoomTypes.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record UpdateRoomTypeCommand(
    Guid Id,
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice,
    decimal Area,
    List<string> Amenities
) : IRequest;

// ── Validator ─────────────────────────────────────────────────────────────────

public class UpdateRoomTypeCommandValidator : AbstractValidator<UpdateRoomTypeCommand>
{
    public UpdateRoomTypeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000);

        RuleFor(x => x.MaxOccupancy)
            .GreaterThan(0)
            .LessThanOrEqualTo(20);

        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("Base price must be greater than 0.");

        RuleFor(x => x.Area)
            .GreaterThan(0).WithMessage("Area must be greater than 0.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class UpdateRoomTypeCommandHandler : IRequestHandler<UpdateRoomTypeCommand>
{
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoomTypeCommandHandler(IRoomTypeRepository roomTypeRepository, IUnitOfWork unitOfWork)
    {
        _roomTypeRepository = roomTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var roomType = await _roomTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(RoomType), request.Id);

        if (await _roomTypeRepository.NameExistsAsync(request.Name, excludeId: request.Id, ct: cancellationToken))
            throw new DomainException($"Room type '{request.Name}' already exists.");

        roomType.Update(
            request.Name,
            request.Description,
            request.MaxOccupancy,
            request.BasePrice,
            request.Area,
            request.Amenities
        );

        _roomTypeRepository.Update(roomType);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
