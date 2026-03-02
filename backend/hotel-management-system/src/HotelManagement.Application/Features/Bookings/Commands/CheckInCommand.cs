using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands;

// Check-in by booking ID
public record CheckInCommand(Guid Id) : IRequest;

public class CheckInCommandHandler : IRequestHandler<CheckInCommand>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public CheckInCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task Handle(CheckInCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.Id);

        booking.CheckIn();
        _bookingRepository.Update(booking);

        var room = await _roomRepository.GetByIdWithTypeAsync(booking.RoomId, cancellationToken);
        if (room != null)
        {
            room.ChangeStatus(RoomStatus.Occupied);
            _roomRepository.Update(room);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _cache.RemoveAsync(CacheKeys.DashboardStats);

        // Отправка email о заселении
        var bookingWithDetails = await _bookingRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (bookingWithDetails?.Guest != null && room != null)
        {
            _ = _emailService.SendCheckInNotificationAsync(new BookingEmailData(
                bookingWithDetails.Guest.Email, bookingWithDetails.Guest.FullName,
                booking.Id.ToString(), room.Number, room.RoomType.Name,
                booking.CheckInDate, booking.CheckOutDate, booking.NightsCount, booking.TotalAmount
            ), cancellationToken);
        }
    }
}

// Check-in by QR token
public record CheckInByQrCommand(string QrToken) : IRequest;

public class CheckInByQrCommandHandler : IRequestHandler<CheckInByQrCommand>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public CheckInByQrCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task Handle(CheckInByQrCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByQrTokenAsync(request.QrToken, cancellationToken)
            ?? throw new NotFoundException("Booking with QR token", request.QrToken);

        booking.CheckIn();
        _bookingRepository.Update(booking);

        var room = await _roomRepository.GetByIdWithTypeAsync(booking.RoomId, cancellationToken);
        if (room != null)
        {
            room.ChangeStatus(RoomStatus.Occupied);
            _roomRepository.Update(room);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _cache.RemoveAsync(CacheKeys.DashboardStats);

        var bookingWithDetails = await _bookingRepository.GetByIdWithDetailsAsync(booking.Id, cancellationToken);
        if (bookingWithDetails?.Guest != null && room != null)
        {
            _ = _emailService.SendCheckInNotificationAsync(new BookingEmailData(
                bookingWithDetails.Guest.Email, bookingWithDetails.Guest.FullName,
                booking.Id.ToString(), room.Number, room.RoomType.Name,
                booking.CheckInDate, booking.CheckOutDate, booking.NightsCount, booking.TotalAmount
            ), cancellationToken);
        }
    }
}
