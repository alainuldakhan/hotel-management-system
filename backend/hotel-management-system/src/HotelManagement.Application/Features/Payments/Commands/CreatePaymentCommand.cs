using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Payments.Commands;

public record CreatePaymentCommand(
    Guid BookingId,
    decimal Amount,
    string Method,
    Guid ReceivedByUserId,
    Guid? InvoiceId = null,
    string? Reference = null,
    string? Notes = null
) : IRequest<Guid>;

public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    private static readonly string[] AllowedMethods =
        ["Cash", "Card", "BankTransfer", "Online"];

    public CreatePaymentCommandValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Method)
            .NotEmpty()
            .Must(m => AllowedMethods.Contains(m))
            .WithMessage("Method must be one of: Cash, Card, BankTransfer, Online.");
        RuleFor(x => x.ReceivedByUserId).NotEmpty();
        RuleFor(x => x.Reference).MaximumLength(200).When(x => x.Reference != null);
        RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes != null);
    }
}

public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Guid>
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePaymentCommandHandler(
        IPaymentRepository paymentRepository,
        IBookingRepository bookingRepository,
        IInvoiceRepository invoiceRepository,
        IUnitOfWork unitOfWork)
    {
        _paymentRepository = paymentRepository;
        _bookingRepository = bookingRepository;
        _invoiceRepository = invoiceRepository;
        _unitOfWork        = unitOfWork;
    }

    public async Task<Guid> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.BookingId);

        // Регистрируем платёж на бронировании (обновляет paid_amount + payment_status)
        booking.RegisterPayment(request.Amount);
        _bookingRepository.Update(booking);

        // Если указан инвойс — обновляем статус
        if (request.InvoiceId.HasValue)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId.Value, cancellationToken);
            if (invoice != null && booking.PaymentStatus == Domain.Enums.PaymentStatus.Paid)
                invoice.MarkAsPaid(request.Method, request.Notes);
        }

        var payment = Payment.Create(
            request.BookingId,
            request.Amount,
            request.Method,
            request.ReceivedByUserId,
            request.InvoiceId,
            request.Reference,
            request.Notes
        );

        await _paymentRepository.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return payment.Id;
    }
}
