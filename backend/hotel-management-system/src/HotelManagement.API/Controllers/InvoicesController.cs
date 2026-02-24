using HotelManagement.Application.Features.Invoices.Commands;
using HotelManagement.Application.Features.Invoices.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvoicesController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetInvoiceByIdQuery(id), ct));

    [HttpGet("booking/{bookingId:guid}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId, CancellationToken ct)
        => Ok(await _mediator.Send(new GetInvoicesByBookingQuery(bookingId), ct));

    [HttpPost]
    public async Task<IActionResult> Generate([FromBody] GenerateInvoiceCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPost("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkPaid(Guid id, [FromBody] MarkPaidRequest body, CancellationToken ct)
    {
        await _mediator.Send(new MarkInvoicePaidCommand(id, body.PaymentMethod, body.Notes), ct);
        return NoContent();
    }
}

public record MarkPaidRequest(string PaymentMethod, string? Notes = null);
