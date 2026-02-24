using HotelManagement.Application.DTOs;
using HotelManagement.Application.Features.Maintenance.Commands;
using HotelManagement.Application.Features.Maintenance.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/maintenance")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IMediator _mediator;

    public MaintenanceController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "MaintenanceStaff,Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] MaintenanceFilterDto filter, CancellationToken ct)
        => Ok(await _mediator.Send(new GetMaintenanceRequestsQuery(filter), ct));

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "MaintenanceStaff,Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetMaintenanceRequestByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMaintenanceRequestCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignRequest body, CancellationToken ct)
    {
        await _mediator.Send(new AssignMaintenanceCommand(id, body.AssignedToUserId), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/resolve")]
    [Authorize(Roles = "MaintenanceStaff,Manager,SuperAdmin")]
    public async Task<IActionResult> Resolve(Guid id, [FromBody] ResolveRequest body, CancellationToken ct)
    {
        await _mediator.Send(new ResolveMaintenanceCommand(id, body.Resolution), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CancelMaintenanceCommand(id), ct);
        return NoContent();
    }
}

public record AssignRequest(Guid AssignedToUserId);
public record ResolveRequest(string Resolution);
