using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces;

public interface IPdfReportService
{
    /// <summary>Генерирует PDF счёт-фактуру</summary>
    byte[] GenerateInvoicePdf(InvoiceDetailDto invoice);

    /// <summary>Генерирует ежедневный отчёт по заселению</summary>
    byte[] GenerateDailyOccupancyReport(DateTime date, IEnumerable<DailyOccupancyItemDto> items);

    /// <summary>Генерирует отчёт по выручке за период</summary>
    byte[] GenerateRevenueReport(DateTime from, DateTime to, IEnumerable<RevenueByPeriodDto> items);
}
