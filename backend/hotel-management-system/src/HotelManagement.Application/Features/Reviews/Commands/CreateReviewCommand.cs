using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Reviews.Commands;

public record CreateReviewCommand(
    Guid BookingId,
    Guid GuestId,
    int Rating,
    string? Comment
) : IRequest<Guid>;

public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
        RuleFor(x => x.GuestId).NotEmpty();
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(2000).When(x => x.Comment != null);
    }
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IReviewRepository _reviewRepository;
    private readonly IReviewQueryService _reviewQueryService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReviewCommandHandler(
        IBookingRepository bookingRepository,
        IReviewRepository reviewRepository,
        IReviewQueryService reviewQueryService,
        IUnitOfWork unitOfWork)
    {
        _bookingRepository    = bookingRepository;
        _reviewRepository     = reviewRepository;
        _reviewQueryService   = reviewQueryService;
        _unitOfWork           = unitOfWork;
    }

    public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdWithDetailsAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.BookingId);

        if (booking.GuestId != request.GuestId)
            throw new DomainException("You can only review your own bookings.");

        if (booking.Status != BookingStatus.CheckedOut)
            throw new DomainException("You can only leave a review after check-out.");

        var alreadyExists = await _reviewQueryService.ReviewExistsForBookingAsync(request.BookingId, cancellationToken);
        if (alreadyExists)
            throw new DomainException("A review for this booking already exists.");

        var review = Review.Create(
            request.BookingId,
            request.GuestId,
            booking.Room.RoomTypeId,
            request.Rating,
            request.Comment
        );

        await _reviewRepository.AddAsync(review, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return review.Id;
    }
}
