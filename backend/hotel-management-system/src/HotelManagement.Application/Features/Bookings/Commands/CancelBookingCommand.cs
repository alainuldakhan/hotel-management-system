using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands;

public record CancelBookingCommand(Guid Id, string? Reason = null) : IRequest;

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public CancelBookingCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.Id);

        booking.Cancel(request.Reason);
        _bookingRepository.Update(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Отправка email об отмене бронирования
        var bookingWithDetails = await _bookingRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        var room = await _roomRepository.GetByIdWithTypeAsync(booking.RoomId, cancellationToken);
        if (bookingWithDetails?.Guest != null && room != null)
        {
            _ = _emailService.SendBookingCancellationAsync(new BookingEmailData(
                bookingWithDetails.Guest.Email, bookingWithDetails.Guest.FullName,
                booking.Id.ToString(), room.Number, room.RoomType.Name,
                booking.CheckInDate, booking.CheckOutDate, booking.NightsCount, booking.TotalAmount
            ), cancellationToken);
        }
    }
}
