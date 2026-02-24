using HotelManagement.Application.Features.RoomTypes.Commands;
using HotelManagement.Application.Features.RoomTypes.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/room-types")]
public class RoomTypesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomTypesController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get all room types (with rooms count)</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetRoomTypesQuery(), ct));

    /// <summary>Get room type detail by ID</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetRoomTypeByIdQuery(id), ct));

    /// <summary>Create a new room type [Manager, SuperAdmin]</summary>
    [HttpPost]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateRoomTypeCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Update room type [Manager, SuperAdmin]</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoomTypeCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    /// <summary>Deactivate room type [Manager, SuperAdmin]</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteRoomTypeCommand(id), ct);
        return NoContent();
    }
}
