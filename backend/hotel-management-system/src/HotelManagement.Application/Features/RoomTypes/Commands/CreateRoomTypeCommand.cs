using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.RoomTypes.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record CreateRoomTypeCommand(
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice,
    decimal Area,
    List<string>? Amenities = null
) : IRequest<Guid>;

// ── Validator ─────────────────────────────────────────────────────────────────

public class CreateRoomTypeCommandValidator : AbstractValidator<CreateRoomTypeCommand>
{
    public CreateRoomTypeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000);

        RuleFor(x => x.MaxOccupancy)
            .GreaterThan(0).WithMessage("Max occupancy must be greater than 0.")
            .LessThanOrEqualTo(20);

        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("Base price must be greater than 0.");

        RuleFor(x => x.Area)
            .GreaterThan(0).WithMessage("Area must be greater than 0.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class CreateRoomTypeCommandHandler : IRequestHandler<CreateRoomTypeCommand, Guid>
{
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRoomTypeCommandHandler(IRoomTypeRepository roomTypeRepository, IUnitOfWork unitOfWork)
    {
        _roomTypeRepository = roomTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        if (await _roomTypeRepository.NameExistsAsync(request.Name, ct: cancellationToken))
            throw new DomainException($"Room type '{request.Name}' already exists.");

        var roomType = RoomType.Create(
            request.Name,
            request.Description,
            request.MaxOccupancy,
            request.BasePrice,
            request.Area,
            request.Amenities
        );

        await _roomTypeRepository.AddAsync(roomType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return roomType.Id;
    }
}
