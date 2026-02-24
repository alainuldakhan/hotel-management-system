using HotelManagement.Application.DTOs;
using HotelManagement.Application.Features.Bookings.Commands;
using HotelManagement.Application.Features.Bookings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get paged list of bookings [Staff]</summary>
    [HttpGet]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] BookingFilterDto filter, CancellationToken ct)
        => Ok(await _mediator.Send(new GetBookingsQuery(filter), ct));

    /// <summary>Get my bookings [Guest]</summary>
    [HttpGet("my")]
    [Authorize(Roles = "Guest")]
    public async Task<IActionResult> GetMyBookings(CancellationToken ct)
    {
        var guestIdClaim = User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(guestIdClaim, out var guestId))
            return Unauthorized();

        return Ok(await _mediator.Send(new GetGuestBookingsQuery(guestId), ct));
    }

    /// <summary>Get booking by ID</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetBookingByIdQuery(id), ct));

    /// <summary>Get booking by QR token</summary>
    [HttpGet("qr/{token}")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetByQr(string token, CancellationToken ct)
        => Ok(await _mediator.Send(new GetBookingByQrQuery(token), ct));

    /// <summary>Create booking</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Confirm booking [Receptionist, Manager, SuperAdmin]</summary>
    [HttpPost("{id:guid}/confirm")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> Confirm(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ConfirmBookingCommand(id), ct);
        return NoContent();
    }

    /// <summary>Check-in by booking ID [Receptionist, Manager, SuperAdmin]</summary>
    [HttpPost("{id:guid}/check-in")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> CheckIn(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CheckInCommand(id), ct);
        return NoContent();
    }

    /// <summary>Check-in by QR token [Receptionist, Manager, SuperAdmin]</summary>
    [HttpPost("check-in/qr/{token}")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> CheckInByQr(string token, CancellationToken ct)
    {
        await _mediator.Send(new CheckInByQrCommand(token), ct);
        return NoContent();
    }

    /// <summary>Check-out [Receptionist, Manager, SuperAdmin]</summary>
    [HttpPost("{id:guid}/check-out")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> CheckOut(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CheckOutCommand(id), ct);
        return NoContent();
    }

    /// <summary>Cancel booking</summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelBookingRequest? body, CancellationToken ct)
    {
        await _mediator.Send(new CancelBookingCommand(id, body?.Reason), ct);
        return NoContent();
    }

    /// <summary>Add additional service to booking [Receptionist, Manager, SuperAdmin]</summary>
    [HttpPost("{id:guid}/services")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> AddService(Guid id, [FromBody] AddServiceRequest body, CancellationToken ct)
    {
        await _mediator.Send(new AddBookingServiceCommand(id, body.ServiceId, body.Quantity), ct);
        return NoContent();
    }

    /// <summary>Remove additional service from booking [Receptionist, Manager, SuperAdmin]</summary>
    [HttpDelete("{id:guid}/services/{serviceId:guid}")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> RemoveService(Guid id, Guid serviceId, CancellationToken ct)
    {
        await _mediator.Send(new RemoveBookingServiceCommand(id, serviceId), ct);
        return NoContent();
    }
}

// Simple request body DTOs for controller
public record CancelBookingRequest(string? Reason);
public record AddServiceRequest(Guid ServiceId, int Quantity = 1);
