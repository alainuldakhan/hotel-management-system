using FluentValidation;
using HotelManagement.Application.Common;
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
    private readonly IPricingRuleRepository _pricingRuleRepository;
    private readonly IRoomBlockRepository _roomBlockRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public CreateBookingCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IPricingRuleRepository pricingRuleRepository,
        IRoomBlockRepository roomBlockRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _bookingRepository     = bookingRepository;
        _roomRepository        = roomRepository;
        _userRepository        = userRepository;
        _pricingRuleRepository = pricingRuleRepository;
        _roomBlockRepository   = roomBlockRepository;
        _emailService          = emailService;
        _unitOfWork            = unitOfWork;
        _cache                 = cache;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        // 1. Загружаем гостя и проверяем DNR
        var guest = await _userRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), request.GuestId);

        if (guest.IsDnr)
            throw new DomainException(
                $"Guest is flagged as Do Not Rent. Reason: {guest.DnrReason}");

        // 2. Загружаем номер
        var room = await _roomRepository.GetByIdWithTypeAsync(request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Room), request.RoomId);

        if (!room.IsAvailableForBooking())
            throw new DomainException("The selected room is not available.");

        // 3. Проверяем пересечение броней
        var hasOverlap = await _bookingRepository.HasOverlappingBookingAsync(
            request.RoomId, request.CheckInDate, request.CheckOutDate, ct: cancellationToken);

        if (hasOverlap)
            throw new DomainException("The room is already booked for the selected dates.");

        // 4. Проверяем активные блокировки номера
        var isBlocked = await _roomBlockRepository.HasActiveBlockAsync(
            request.RoomId, request.CheckInDate, request.CheckOutDate, cancellationToken);

        if (isBlocked)
            throw new DomainException("The room is blocked for the selected dates.");

        // 5. Динамическое ценообразование — применяем активные PricingRule
        var nights = (request.CheckOutDate - request.CheckInDate).Days;
        var baseNightRate = room.RoomType.BasePrice;

        var pricingRules = await _pricingRuleRepository
            .GetActiveRulesForRoomTypeAsync(room.RoomTypeId, cancellationToken);

        // Применяем все подходящие правила (мультипликативно)
        var priceMultiplier = pricingRules
            .Where(r => r.IsApplicable(request.CheckInDate))
            .Aggregate(1m, (acc, rule) => acc * rule.Multiplier);

        var totalAmount = Math.Round(nights * baseNightRate * priceMultiplier, 2);

        // 6. Создаём бронирование
        var booking = Booking.Create(
            request.RoomId, request.GuestId,
            request.CheckInDate, request.CheckOutDate,
            request.GuestsCount, totalAmount,
            request.SpecialRequests
        );

        await _bookingRepository.AddAsync(booking, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Инвалидируем дашборд и KPI — новое бронирование меняет статистику
        await Task.WhenAll(
            _cache.RemoveAsync(CacheKeys.DashboardStats),
            _cache.RemoveByPrefixAsync(CacheKeys.KpiPrefix)
        );

        // 7. Email подтверждения (fire-and-forget)
        _ = _emailService.SendBookingConfirmationAsync(new BookingEmailData(
            guest.Email, guest.FullName, booking.Id.ToString(),
            room.Number, room.RoomType.Name,
            request.CheckInDate, request.CheckOutDate, nights, totalAmount,
            request.SpecialRequests
        ), cancellationToken);

        return booking.Id;
    }
}
