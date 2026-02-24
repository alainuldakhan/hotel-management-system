using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands;

public record AddBookingServiceCommand(Guid BookingId, Guid ServiceId, int Quantity = 1) : IRequest;

public class AddBookingServiceCommandValidator : AbstractValidator<AddBookingServiceCommand>
{
    public AddBookingServiceCommandValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
        RuleFor(x => x.ServiceId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(50);
    }
}

public class AddBookingServiceCommandHandler : IRequestHandler<AddBookingServiceCommand>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IAdditionalServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddBookingServiceCommandHandler(
        IBookingRepository bookingRepository,
        IAdditionalServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AddBookingServiceCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.BookingId);

        if (booking.Status is not (BookingStatus.Pending or BookingStatus.Confirmed or BookingStatus.CheckedIn))
            throw new DomainException("Services can only be added to active bookings.");

        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken)
            ?? throw new NotFoundException(nameof(AdditionalService), request.ServiceId);

        var bookingService = BookingService.Create(
            booking.Id, service.Id, request.Quantity, service.Price);

        await _bookingRepository.AddServiceAsync(bookingService, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
