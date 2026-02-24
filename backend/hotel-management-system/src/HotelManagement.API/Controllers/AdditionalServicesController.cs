using HotelManagement.Application.Features.AdditionalServices.Commands;
using HotelManagement.Application.Features.AdditionalServices.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/additional-services")]
public class AdditionalServicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdditionalServicesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAdditionalServicesQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetAdditionalServiceByIdQuery(id), ct));

    [HttpPost]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateAdditionalServiceCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAdditionalServiceCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteAdditionalServiceCommand(id), ct);
        return NoContent();
    }
}
