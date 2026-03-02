using HotelManagement.Application.Features.Payments.Commands;
using HotelManagement.Application.Features.Payments.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Управление платежами — история оплат по бронированиям,
/// приём новых платежей (Cash / Card / BankTransfer / Online).
/// </summary>
[ApiController]
[Route("api/payments")]
[Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Список платежей по бронированию</summary>
    [HttpGet("booking/{bookingId:guid}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPaymentsByBookingQuery(bookingId), ct));

    /// <summary>Принять платёж по бронированию</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaymentRequest body, CancellationToken ct)
    {
        var staffId = GetStaffId();
        if (staffId == null) return Unauthorized();

        var command = new CreatePaymentCommand(
            body.BookingId, body.Amount, body.Method,
            staffId.Value, body.InvoiceId, body.Reference, body.Notes);

        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    private Guid? GetStaffId()
        => Guid.TryParse(User.FindFirst("sub")?.Value, out var id) ? id : null;
}

public record CreatePaymentRequest(
    Guid BookingId,
    decimal Amount,
    string Method,
    Guid? InvoiceId = null,
    string? Reference = null,
    string? Notes = null
);
