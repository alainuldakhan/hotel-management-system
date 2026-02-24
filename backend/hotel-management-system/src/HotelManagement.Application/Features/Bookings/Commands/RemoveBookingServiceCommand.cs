using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands;

public record RemoveBookingServiceCommand(Guid BookingId, Guid ServiceId) : IRequest;

public class RemoveBookingServiceCommandHandler : IRequestHandler<RemoveBookingServiceCommand>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveBookingServiceCommandHandler(IBookingRepository bookingRepository, IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RemoveBookingServiceCommand request, CancellationToken cancellationToken)
    {
        var bookingService = await _bookingRepository.GetServiceAsync(
            request.BookingId, request.ServiceId, cancellationToken)
            ?? throw new NotFoundException("BookingService", $"{request.BookingId}/{request.ServiceId}");

        _bookingRepository.RemoveService(bookingService);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
