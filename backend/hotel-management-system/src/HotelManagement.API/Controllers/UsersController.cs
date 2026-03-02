using HotelManagement.Application.Features.Users.Commands;
using HotelManagement.Application.Features.Users.Queries;
using HotelManagement.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Manager,SuperAdmin")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetUsersQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetUserByIdQuery(id), ct));

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UserRole role, CancellationToken ct)
    {
        await _mediator.Send(new UpdateUserRoleCommand(id, role), ct);
        return NoContent();
    }

    /// <summary>Деактивировать пользователя (мягкое удаление)</summary>
    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeactivateUserCommand(id), ct);
        return NoContent();
    }

    /// <summary>Активировать ранее деактивированного пользователя</summary>
    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ActivateUserCommand(id), ct);
        return NoContent();
    }

    /// <summary>Добавить гостя в DNR (Do Not Rent / чёрный список)</summary>
    [HttpPost("{id:guid}/dnr")]
    public async Task<IActionResult> FlagDnr(Guid id, [FromBody] DnrRequest body, CancellationToken ct)
    {
        var staffId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());
        await _mediator.Send(new FlagGuestDnrCommand(id, body.Reason, staffId), ct);
        return NoContent();
    }

    /// <summary>Снять статус DNR с гостя</summary>
    [HttpDelete("{id:guid}/dnr")]
    public async Task<IActionResult> UnflagDnr(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new UnflagGuestDnrCommand(id), ct);
        return NoContent();
    }
}

public record DnrRequest(string Reason);
