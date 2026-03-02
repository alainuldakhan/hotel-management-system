using HotelManagement.Application.Features.Bookings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Front Desk — оперативные данные для ресепшена:
/// заезды, выезды, проживающие, прогноз загрузки.
/// </summary>
[ApiController]
[Route("api/front-desk")]
[Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
public class FrontDeskController : ControllerBase
{
    private readonly IMediator _mediator;

    public FrontDeskController(IMediator mediator) => _mediator = mediator;

    /// <summary>Список ожидаемых заездов на дату (по умолчанию — сегодня)</summary>
    [HttpGet("arrivals")]
    public async Task<IActionResult> GetArrivals(
        [FromQuery] DateTime? date, CancellationToken ct)
        => Ok(await _mediator.Send(new GetArrivalsQuery(date), ct));

    /// <summary>Список ожидаемых выездов на дату (по умолчанию — сегодня)</summary>
    [HttpGet("departures")]
    public async Task<IActionResult> GetDepartures(
        [FromQuery] DateTime? date, CancellationToken ct)
        => Ok(await _mediator.Send(new GetDeparturesQuery(date), ct));

    /// <summary>Список всех проживающих в данный момент гостей</summary>
    [HttpGet("in-house")]
    public async Task<IActionResult> GetInHouse(CancellationToken ct)
        => Ok(await _mediator.Send(new GetInHouseGuestsQuery(), ct));

    /// <summary>Прогноз загрузки номерного фонда на следующие N дней</summary>
    [HttpGet("forecast")]
    public async Task<IActionResult> GetForecast(
        [FromQuery] int days = 30, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetForecastQuery(days), ct));
}
