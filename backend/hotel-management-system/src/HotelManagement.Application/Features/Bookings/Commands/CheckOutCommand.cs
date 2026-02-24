using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands;

public record CheckOutCommand(Guid Id) : IRequest;

public class CheckOutCommandHandler : IRequestHandler<CheckOutCommand>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public CheckOutCommandHandler(
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

    public async Task Handle(CheckOutCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.Id);

        booking.CheckOut();
        _bookingRepository.Update(booking);

        // Устанавливаем номер в статус "Уборка" после выезда
        var room = await _roomRepository.GetByIdWithTypeAsync(booking.RoomId, cancellationToken);
        if (room != null)
        {
            room.ChangeStatus(RoomStatus.Cleaning);
            _roomRepository.Update(room);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Отправка email-квитанции гостю
        var bookingWithDetails = await _bookingRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (bookingWithDetails?.Guest != null && room != null)
        {
            _ = _emailService.SendCheckOutReceiptAsync(new BookingEmailData(
                bookingWithDetails.Guest.Email, bookingWithDetails.Guest.FullName,
                booking.Id.ToString(), room.Number, room.RoomType.Name,
                booking.CheckInDate, booking.CheckOutDate, booking.NightsCount, booking.TotalAmount
            ), cancellationToken);
        }
    }
}
