using HotelManagement.Application.Common.Interfaces.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Manager,SuperAdmin")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsQueryService _analyticsService;

    public AnalyticsController(IAnalyticsQueryService analyticsService)
        => _analyticsService = analyticsService;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
        => Ok(await _analyticsService.GetDashboardStatsAsync(ct));

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string groupBy = "month",
        CancellationToken ct = default)
        => Ok(await _analyticsService.GetRevenueByPeriodAsync(from, to, groupBy, ct));

    [HttpGet("occupancy-by-room-type")]
    public async Task<IActionResult> GetOccupancyByRoomType(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct = default)
    {
        var dateFrom = from ?? DateTime.UtcNow.AddMonths(-1);
        var dateTo = to ?? DateTime.UtcNow;
        return Ok(await _analyticsService.GetOccupancyByRoomTypeAsync(dateFrom, dateTo, ct));
    }

    [HttpGet("top-guests")]
    public async Task<IActionResult> GetTopGuests([FromQuery] int top = 10, CancellationToken ct = default)
        => Ok(await _analyticsService.GetTopGuestsAsync(top, ct));
}
