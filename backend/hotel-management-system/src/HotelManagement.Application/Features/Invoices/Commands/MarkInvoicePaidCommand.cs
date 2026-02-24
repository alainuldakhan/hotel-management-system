using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Invoices.Commands;

public record MarkInvoicePaidCommand(Guid Id, string PaymentMethod, string? Notes = null) : IRequest;

public class MarkInvoicePaidCommandValidator : AbstractValidator<MarkInvoicePaidCommand>
{
    public MarkInvoicePaidCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.PaymentMethod).NotEmpty().MaximumLength(50);
    }
}

public class MarkInvoicePaidCommandHandler : IRequestHandler<MarkInvoicePaidCommand>
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkInvoicePaidCommandHandler(
        IInvoiceRepository invoiceRepository,
        IBookingRepository bookingRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(MarkInvoicePaidCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), request.Id);

        invoice.MarkAsPaid(request.PaymentMethod, request.Notes);
        _invoiceRepository.Update(invoice);

        // Register payment on booking
        var booking = await _bookingRepository.GetByIdAsync(invoice.BookingId, cancellationToken);
        if (booking != null)
        {
            booking.RegisterPayment(invoice.Amount);
            _bookingRepository.Update(booking);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
