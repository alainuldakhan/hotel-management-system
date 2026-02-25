using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IInvoiceQueryService _invoiceQuery;
    private readonly IAnalyticsQueryService _analyticsQuery;
    private readonly IPdfReportService _pdfService;

    public ReportsController(
        IInvoiceQueryService invoiceQuery,
        IAnalyticsQueryService analyticsQuery,
        IPdfReportService pdfService)
    {
        _invoiceQuery  = invoiceQuery;
        _analyticsQuery = analyticsQuery;
        _pdfService     = pdfService;
    }

    /// <summary>Скачать PDF счёт-фактуру [Receptionist, Manager, SuperAdmin]</summary>
    [HttpGet("invoice/{invoiceId:guid}")]
    [Authorize(Roles = "Receptionist,Manager,SuperAdmin")]
    public async Task<IActionResult> InvoicePdf(Guid invoiceId, CancellationToken ct)
    {
        var invoice = await _invoiceQuery.GetDetailByIdAsync(invoiceId, ct)
            ?? throw new NotFoundException("Invoice", invoiceId);

        var bytes = _pdfService.GenerateInvoicePdf(invoice);
        var fileName = $"invoice-{invoice.InvoiceNumber}.pdf";
        return File(bytes, "application/pdf", fileName);
    }

    /// <summary>Скачать ежедневный отчёт по заселению [Manager, SuperAdmin]</summary>
    [HttpGet("daily-occupancy")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> DailyOccupancyReport([FromQuery] DateTime? date, CancellationToken ct)
    {
        var reportDate = date?.Date ?? DateTime.UtcNow.Date;
        var items = await _invoiceQuery.GetDailyOccupancyAsync(reportDate, ct);
        var bytes = _pdfService.GenerateDailyOccupancyReport(reportDate, items);
        var fileName = $"occupancy-{reportDate:yyyy-MM-dd}.pdf";
        return File(bytes, "application/pdf", fileName);
    }

    /// <summary>Скачать отчёт по выручке за период [Manager, SuperAdmin]</summary>
    [HttpGet("revenue")]
    [Authorize(Roles = "Manager,SuperAdmin")]
    public async Task<IActionResult> RevenueReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string groupBy = "month",
        CancellationToken ct = default)
    {
        var items = await _analyticsQuery.GetRevenueByPeriodAsync(from, to, groupBy, ct);
        var bytes = _pdfService.GenerateRevenueReport(from, to, items);
        var fileName = $"revenue-{from:yyyy-MM-dd}-{to:yyyy-MM-dd}.pdf";
        return File(bytes, "application/pdf", fileName);
    }
}
