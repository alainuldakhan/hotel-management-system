using HotelManagement.Application.Features.Reviews.Commands;
using HotelManagement.Application.Features.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator) => _mediator = mediator;

    /// <summary>POST /api/reviews — создать отзыв (только Guest, только после CheckedOut)</summary>
    [HttpPost]
    [Authorize(Roles = "Guest")]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var guestIdClaim = User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(guestIdClaim, out var guestId))
            return Unauthorized();

        var id = await _mediator.Send(
            new CreateReviewCommand(request.BookingId, guestId, request.Rating, request.Comment), ct);

        return CreatedAtAction(nameof(GetAll), new { }, new { id });
    }

    /// <summary>GET /api/reviews — список отзывов (все авторизованные)</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? roomTypeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetReviewsQuery(roomTypeId, page, pageSize), ct));

    /// <summary>GET /api/reviews/ratings — средние оценки по типам номеров (Manager+)</summary>
    [HttpGet("ratings")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> GetRatings(CancellationToken ct)
        => Ok(await _mediator.Send(new GetRoomTypeRatingsQuery(), ct));
}

public record CreateReviewRequest(Guid BookingId, int Rating, string? Comment);
