using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Invoices.Commands;

public record GenerateInvoiceCommand(Guid BookingId, string? Notes = null) : IRequest<Guid>;

public class GenerateInvoiceCommandValidator : AbstractValidator<GenerateInvoiceCommand>
{
    public GenerateInvoiceCommandValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
    }
}

public class GenerateInvoiceCommandHandler : IRequestHandler<GenerateInvoiceCommand, Guid>
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateInvoiceCommandHandler(
        IInvoiceRepository invoiceRepository,
        IBookingRepository bookingRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(GenerateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException(nameof(Booking), request.BookingId);

        // Generate invoice number: INV-YYYY-NNNN
        var year = DateTime.UtcNow.Year;
        var count = await _invoiceRepository.GetCurrentYearCountAsync(cancellationToken);
        var invoiceNumber = $"INV-{year}-{(count + 1):D4}";

        var invoice = Invoice.Create(booking.Id, booking.TotalAmount, invoiceNumber);

        await _invoiceRepository.AddAsync(invoice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice.Id;
    }
}
