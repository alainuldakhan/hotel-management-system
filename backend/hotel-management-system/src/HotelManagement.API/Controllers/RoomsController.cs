using HotelManagement.Application.Features.Rooms.Commands;
using System.Security.Claims;
using HotelManagement.Application.Features.Rooms.Queries;
using HotelManagement.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get all active rooms</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllRoomsQuery(), ct));

    /// <summary>Get available rooms for booking</summary>
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable(
        [FromQuery] DateTime checkIn,
        [FromQuery] DateTime checkOut,
        [FromQuery] int guestsCount,
        [FromQuery] Guid? roomTypeId,
        CancellationToken ct)
        => Ok(await _mediator.Send(new GetAvailableRoomsQuery(checkIn, checkOut, guestsCount, roomTypeId), ct));

    /// <summary>Get occupancy statistics</summary>
    [HttpGet("occupancy-stats")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetOccupancyStats(CancellationToken ct)
        => Ok(await _mediator.Send(new GetOccupancyStatsQuery(), ct));

    /// <summary>Get room detail by ID</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetRoomByIdQuery(id), ct));

    /// <summary>Create a new room [Manager, SuperAdmin]</summary>
    [HttpPost]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateRoomCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Update room details [Manager, SuperAdmin]</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoomCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    /// <summary>Change room status [Receptionist, HousekeepingStaff, Manager, SuperAdmin]</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Receptionist,HousekeepingStaff,Manager,SuperAdmin")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeStatusRequest body, CancellationToken ct)
    {
        if (!Enum.TryParse<RoomStatus>(body.Status, out var status))
            return BadRequest(new { message = "Неверный статус" });
        await _mediator.Send(new ChangeRoomStatusCommand(id, status), ct);
        return NoContent();
    }

    /// <summary>Deactivate a room [Manager, SuperAdmin]</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteRoomCommand(id), ct);
        return NoContent();
    }

    /// <summary>Get room blocks [Receptionist, Manager, SuperAdmin]</summary>
    [HttpGet("{id:guid}/blocks")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> GetBlocks(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetRoomBlocksQuery(id), ct));

    /// <summary>Block a room [Manager, SuperAdmin]</summary>
    [HttpPost("{id:guid}/block")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Block(Guid id, [FromBody] BlockRoomRequest body, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());
        var blockId = await _mediator.Send(new BlockRoomCommand(id, body.BlockedFrom, body.BlockedTo, body.Reason, userId), ct);
        return Ok(new { id = blockId });
    }

    /// <summary>Unblock a room [Manager, SuperAdmin]</summary>
    [HttpDelete("{id:guid}/block/{blockId:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Unblock(Guid id, Guid blockId, CancellationToken ct)
    {
        await _mediator.Send(new UnblockRoomCommand(blockId), ct);
        return NoContent();
    }
}

public record BlockRoomRequest(DateTime BlockedFrom, DateTime BlockedTo, string Reason);
public record ChangeStatusRequest(string Status);