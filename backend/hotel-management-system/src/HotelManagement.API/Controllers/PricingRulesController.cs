using HotelManagement.Application.Features.PricingRules.Commands;
using HotelManagement.Application.Features.PricingRules.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/pricing-rules")]
[Authorize(Roles = "Manager,SuperAdmin")]
public class PricingRulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PricingRulesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetPricingRulesQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPricingRuleByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePricingRuleCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePricingRuleCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeletePricingRuleCommand(id), ct);
        return NoContent();
    }
}
