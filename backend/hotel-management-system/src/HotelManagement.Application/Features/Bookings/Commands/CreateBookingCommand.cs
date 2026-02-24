using FluentValidation;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record CreateBookingCommand(
    Guid RoomId,
    Guid GuestId,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int GuestsCount,
    string? SpecialRequests = null
) : IRequest<Guid>;

// ── Validator ─────────────────────────────────────────────────────────────────

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.GuestId).NotEmpty();
        RuleFor(x => x.CheckInDate).GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Check-in date cannot be in the past.");
        RuleFor(x => x.CheckOutDate).GreaterThan(x => x.CheckInDate)
            .WithMessage("Check-out must be after check-in.");
        RuleFor(x => x.GuestsCount).GreaterThan(0).LessThanOrEqualTo(20);
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBookingCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdWithTypeAsync(request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.RoomId);

        if (!room.IsAvailableForBooking())
            throw new DomainException("The selected room is not available.");

        var hasOverlap = await _bookingRepository.HasOverlappingBookingAsync(
            request.RoomId, request.CheckInDate, request.CheckOutDate, ct: cancellationToken);

        if (hasOverlap)
            throw new DomainException("The room is already booked for the selected dates.");

        var nights = (request.CheckOutDate - request.CheckInDate).Days;
        var totalAmount = nights * room.RoomType.BasePrice;

        var booking = Booking.Create(
            request.RoomId, request.GuestId,
            request.CheckInDate, request.CheckOutDate,
            request.GuestsCount, totalAmount,
            request.SpecialRequests
        );

        await _bookingRepository.AddAsync(booking, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Отправляем email подтверждения (fire-and-forget)
        var guest = await _userRepository.GetByIdAsync(request.GuestId, cancellationToken);
        if (guest != null)
        {
            _ = _emailService.SendBookingConfirmationAsync(new BookingEmailData(
                guest.Email, guest.FullName, booking.Id.ToString(),
                room.Number, room.RoomType.Name,
                request.CheckInDate, request.CheckOutDate, nights, totalAmount,
                request.SpecialRequests
            ), cancellationToken);
        }

        return booking.Id;
    }
}
