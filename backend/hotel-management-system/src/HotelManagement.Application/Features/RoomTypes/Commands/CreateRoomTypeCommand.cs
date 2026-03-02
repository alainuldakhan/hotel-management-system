using FluentValidation;
using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.RoomTypes.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record CreateRoomTypeCommand(
    string Name,
    string? Description,
    int MaxOccupancy,
    decimal BasePrice,
    decimal Area = 25m,
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
            .MaximumLength(1000);

        RuleFor(x => x.MaxOccupancy)
            .GreaterThan(0).WithMessage("Вместимость должна быть больше 0.")
            .LessThanOrEqualTo(20);

        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("Цена должна быть больше 0.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class CreateRoomTypeCommandHandler : IRequestHandler<CreateRoomTypeCommand, Guid>
{
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public CreateRoomTypeCommandHandler(
        IRoomTypeRepository roomTypeRepository,
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _roomTypeRepository = roomTypeRepository;
        _unitOfWork = unitOfWork;
        _cache = cache;
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

        await _cache.RemoveAsync(CacheKeys.RoomTypesAll);

        return roomType.Id;
    }
}
