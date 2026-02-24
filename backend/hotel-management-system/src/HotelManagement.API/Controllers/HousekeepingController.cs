using HotelManagement.Application.DTOs;
using HotelManagement.Application.Features.Housekeeping.Commands;
using HotelManagement.Application.Features.Housekeeping.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/housekeeping")]
[Authorize]
public class HousekeepingController : ControllerBase
{
    private readonly IMediator _mediator;

    public HousekeepingController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "HousekeepingStaff,Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] HousekeepingFilterDto filter, CancellationToken ct)
        => Ok(await _mediator.Send(new GetHousekeepingTasksQuery(filter), ct));

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "HousekeepingStaff,Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetHousekeepingTaskByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHousekeepingTaskCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignHousekeepingRequest body, CancellationToken ct)
    {
        await _mediator.Send(new AssignHousekeepingTaskCommand(id, body.AssignedToUserId), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "HousekeepingStaff,Manager,SuperAdmin")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] CompleteHousekeepingRequest body, CancellationToken ct)
    {
        await _mediator.Send(new CompleteHousekeepingTaskCommand(id, body.CompletionNotes), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CancelHousekeepingTaskCommand(id), ct);
        return NoContent();
    }
}

public record AssignHousekeepingRequest(Guid AssignedToUserId);
public record CompleteHousekeepingRequest(string? CompletionNotes = null);
