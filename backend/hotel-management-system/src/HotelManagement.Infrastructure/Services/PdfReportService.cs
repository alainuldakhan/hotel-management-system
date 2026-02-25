using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HotelManagement.Infrastructure.Services;

public class PdfReportService : IPdfReportService
{
    private const string HotelName = "Hotel Management System";
    private const string AccentColor = "#1677ff";

    // ── Цвета и стили ──────────────────────────────────────────────────────────

    private static TextStyle HeaderStyle   => TextStyle.Default.FontSize(22).Bold().FontColor(AccentColor);
    private static TextStyle TitleStyle    => TextStyle.Default.FontSize(14).Bold().FontColor("#262626");
    private static TextStyle SubtitleStyle => TextStyle.Default.FontSize(10).FontColor("#595959");
    private static TextStyle TableHeadStyle => TextStyle.Default.FontSize(10).Bold().FontColor("#ffffff");
    private static TextStyle TableCellStyle => TextStyle.Default.FontSize(10).FontColor("#262626");
    private static TextStyle LabelStyle    => TextStyle.Default.FontSize(9).FontColor("#8c8c8c");
    private static TextStyle ValueStyle    => TextStyle.Default.FontSize(10).Bold();

    // ── Invoice PDF ────────────────────────────────────────────────────────────

    public byte[] GenerateInvoicePdf(InvoiceDetailDto inv)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(10));

                page.Content().Column(col =>
                {
                    // Шапка
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(HotelName).Style(HeaderStyle);
                            c.Item().Text("Счёт-фактура").Style(TitleStyle);
                        });
                        row.ConstantItem(160).Column(c =>
                        {
                            c.Item().AlignRight().Text($"№ {inv.InvoiceNumber}").Style(TitleStyle);
                            c.Item().AlignRight()
                                .Text($"Дата: {inv.CreatedAt:dd.MM.yyyy}").Style(SubtitleStyle);
                            c.Item().AlignRight()
                                .Text(inv.Status == "Paid" ? "✓ ОПЛАЧЕНО" : "◌ ОЖИДАЕТ ОПЛАТЫ")
                                .Style(TextStyle.Default.FontSize(11).Bold()
                                    .FontColor(inv.Status == "Paid" ? "#52c41a" : "#fa8c16"));
                        });
                    });

                    col.Item().PaddingVertical(12).LineHorizontal(1).LineColor("#e8e8e8");

                    // Данные гостя и бронирования
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Гость").Style(LabelStyle);
                            c.Item().Text(inv.GuestFullName).Style(ValueStyle);
                            c.Item().Text(inv.GuestEmail).Style(SubtitleStyle);
                            if (!string.IsNullOrEmpty(inv.GuestPhone))
                                c.Item().Text(inv.GuestPhone).Style(SubtitleStyle);
                        });
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Номер").Style(LabelStyle);
                            c.Item().Text($"№ {inv.RoomNumber}").Style(ValueStyle);
                            c.Item().Text(inv.RoomTypeName).Style(SubtitleStyle);
                        });
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Период проживания").Style(LabelStyle);
                            c.Item().Text($"{inv.CheckInDate:dd.MM.yyyy} — {inv.CheckOutDate:dd.MM.yyyy}").Style(ValueStyle);
                            c.Item().Text($"{inv.NightsCount} ноч.").Style(SubtitleStyle);
                        });
                    });

                    col.Item().PaddingVertical(16);

                    // Таблица услуг
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(4);
                            c.RelativeColumn(1);
                            c.RelativeColumn(2);
                            c.RelativeColumn(2);
                        });

                        // Заголовок таблицы
                        table.Header(header =>
                        {
                            void HeaderCell(string text) =>
                                header.Cell().Background(AccentColor).Padding(8)
                                    .Text(text).Style(TableHeadStyle);

                            HeaderCell("Наименование");
                            HeaderCell("Кол-во");
                            HeaderCell("Цена за ед.");
                            HeaderCell("Сумма");
                        });

                        // Строка: проживание
                        var roomRow = table.Cell();
                        roomRow.BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                            .Text($"Проживание — {inv.RoomTypeName} (№ {inv.RoomNumber})")
                            .Style(TableCellStyle);
                        table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                            .AlignRight().Text($"{inv.NightsCount}").Style(TableCellStyle);
                        table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                            .AlignRight()
                            .Text(inv.NightsCount > 0
                                ? $"{inv.BaseAmount / inv.NightsCount:N0} ₸"
                                : $"{inv.BaseAmount:N0} ₸")
                            .Style(TableCellStyle);
                        table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                            .AlignRight().Text($"{inv.BaseAmount:N0} ₸").Style(TableCellStyle);

                        // Доп. услуги
                        foreach (var svc in inv.Services)
                        {
                            table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                                .Text(svc.ServiceName).Style(TableCellStyle);
                            table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                                .AlignRight().Text($"{svc.Quantity}").Style(TableCellStyle);
                            table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                                .AlignRight().Text($"{svc.UnitPrice:N0} ₸").Style(TableCellStyle);
                            table.Cell().BorderBottom(1).BorderColor("#f0f0f0").Padding(8)
                                .AlignRight().Text($"{svc.TotalPrice:N0} ₸").Style(TableCellStyle);
                        }
                    });

                    col.Item().PaddingVertical(8);

                    // Итого
                    col.Item().AlignRight().Row(row =>
                    {
                        row.ConstantItem(200).Background("#f0f5ff").Padding(12).Column(c =>
                        {
                            c.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Итого к оплате:").Style(TitleStyle);
                                r.ConstantItem(100).AlignRight()
                                    .Text($"{inv.Amount:N0} ₸")
                                    .Style(TextStyle.Default.FontSize(16).Bold().FontColor(AccentColor));
                            });
                            if (inv.Status == "Paid" && inv.PaidAt.HasValue)
                            {
                                c.Item().Text($"Оплачено: {inv.PaidAt:dd.MM.yyyy}  •  {inv.PaymentMethod}")
                                    .Style(SubtitleStyle);
                            }
                        });
                    });
                });

                page.Footer().AlignCenter()
                    .Text($"Сгенерировано: {DateTime.Now:dd.MM.yyyy HH:mm}  •  {HotelName}")
                    .Style(LabelStyle);
            });
        }).GeneratePdf();
    }

    // ── Daily Occupancy Report ─────────────────────────────────────────────────

    public byte[] GenerateDailyOccupancyReport(DateTime date, IEnumerable<DailyOccupancyItemDto> items)
    {
        var list = items.ToList();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(36);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(10));

                page.Content().Column(col =>
                {
                    // Шапка
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(HotelName).Style(HeaderStyle);
                            c.Item().Text("Ежедневный отчёт по заселению").Style(TitleStyle);
                            c.Item().Text($"Дата: {date:dd MMMM yyyy}").Style(SubtitleStyle);
                        });
                        row.ConstantItem(160).Column(c =>
                        {
                            c.Item().AlignRight().Background("#f0f5ff").Padding(8).Column(stats =>
                            {
                                stats.Item().AlignRight()
                                    .Text($"Занятых номеров: {list.Count}").Style(ValueStyle);
                                stats.Item().AlignRight()
                                    .Text($"Выручка: {list.Sum(x => x.TotalAmount):N0} ₸")
                                    .Style(TextStyle.Default.FontSize(11).Bold().FontColor(AccentColor));
                            });
                        });
                    });

                    col.Item().PaddingVertical(12).LineHorizontal(1).LineColor("#e8e8e8");

                    if (list.Count == 0)
                    {
                        col.Item().Padding(40).AlignCenter()
                            .Text("На выбранную дату нет активных броней").Style(SubtitleStyle);
                        return;
                    }

                    // Таблица
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1);  // Номер
                            c.RelativeColumn(2);  // Тип
                            c.RelativeColumn(3);  // Гость
                            c.RelativeColumn(3);  // Email
                            c.RelativeColumn(1.5f); // Заезд
                            c.RelativeColumn(1.5f); // Выезд
                            c.RelativeColumn(1.5f); // Статус
                            c.RelativeColumn(2);  // Сумма
                        });

                        table.Header(header =>
                        {
                            void H(string t) =>
                                header.Cell().Background(AccentColor).Padding(6)
                                    .Text(t).Style(TableHeadStyle);
                            H("Номер"); H("Тип"); H("Гость"); H("Email");
                            H("Заезд"); H("Выезд"); H("Статус"); H("Сумма");
                        });

                        foreach (var (item, i) in list.Select((x, i) => (x, i)))
                        {
                            var bg = i % 2 == 0 ? "#ffffff" : "#fafafa";

                            void Cell(string text, bool right = false)
                            {
                                var cell = table.Cell().Background(bg)
                                    .BorderBottom(1).BorderColor("#f0f0f0").Padding(6);
                                if (right) cell.AlignRight().Text(text).Style(TableCellStyle);
                                else cell.Text(text).Style(TableCellStyle);
                            }

                            var statusLabel = item.Status switch
                            {
                                "CheckedIn"  => "Заселён",
                                "Confirmed"  => "Подтверждено",
                                "Pending"    => "Ожидает",
                                _ => item.Status
                            };

                            Cell(item.RoomNumber);
                            Cell(item.RoomTypeName);
                            Cell(item.GuestFullName);
                            Cell(item.GuestEmail);
                            Cell(item.CheckInDate.ToString("dd.MM.yy"));
                            Cell(item.CheckOutDate.ToString("dd.MM.yy"));
                            Cell(statusLabel);
                            Cell($"{item.TotalAmount:N0} ₸", right: true);
                        }
                    });

                    // Итого
                    col.Item().PaddingTop(12).AlignRight()
                        .Text($"Итого выручка: {list.Sum(x => x.TotalAmount):N0} ₸")
                        .Style(TextStyle.Default.FontSize(12).Bold().FontColor(AccentColor));
                });

                page.Footer().AlignCenter()
                    .Text($"Сгенерировано: {DateTime.Now:dd.MM.yyyy HH:mm}  •  {HotelName}")
                    .Style(LabelStyle);
            });
        }).GeneratePdf();
    }

    // ── Revenue Report ─────────────────────────────────────────────────────────

    public byte[] GenerateRevenueReport(DateTime from, DateTime to, IEnumerable<RevenueByPeriodDto> items)
    {
        var list = items.ToList();
        var totalRevenue = list.Sum(x => x.Revenue);
        var totalBookings = list.Sum(x => x.BookingsCount);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(10));

                page.Content().Column(col =>
                {
                    // Шапка
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(HotelName).Style(HeaderStyle);
                            c.Item().Text("Отчёт по выручке").Style(TitleStyle);
                            c.Item().Text($"Период: {from:dd.MM.yyyy} — {to:dd.MM.yyyy}").Style(SubtitleStyle);
                        });
                    });

                    col.Item().PaddingVertical(12).LineHorizontal(1).LineColor("#e8e8e8");

                    // Сводка KPI
                    col.Item().Row(row =>
                    {
                        void KpiCard(string label, string value)
                        {
                            row.RelativeItem().Background("#f0f5ff").Padding(12).Column(c =>
                            {
                                c.Item().Text(label).Style(LabelStyle);
                                c.Item().Text(value)
                                    .Style(TextStyle.Default.FontSize(16).Bold().FontColor(AccentColor));
                            });
                        }

                        KpiCard("Общая выручка", $"{totalRevenue:N0} ₸");
                        row.ConstantItem(16);
                        KpiCard("Всего броней", $"{totalBookings}");
                        row.ConstantItem(16);
                        KpiCard("Средний чек", totalBookings > 0
                            ? $"{totalRevenue / totalBookings:N0} ₸"
                            : "—");
                        row.ConstantItem(16);
                        KpiCard("Периодов", $"{list.Count}");
                    });

                    col.Item().PaddingVertical(16);

                    // Таблица
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(2);
                            c.RelativeColumn(2);
                            c.RelativeColumn(1.5f);
                            c.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            void H(string t) =>
                                header.Cell().Background(AccentColor).Padding(8)
                                    .Text(t).Style(TableHeadStyle);
                            H("Период"); H("Выручка"); H("Бронирований"); H("Средний чек");
                        });

                        foreach (var (item, i) in list.Select((x, i) => (x, i)))
                        {
                            var bg = i % 2 == 0 ? "#ffffff" : "#fafafa";
                            var share = totalRevenue > 0
                                ? (item.Revenue / totalRevenue * 100).ToString("N1") + "%"
                                : "0%";

                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#f0f0f0")
                                .Padding(8).Text(item.Period).Style(TableCellStyle);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#f0f0f0")
                                .Padding(8).AlignRight()
                                .Text($"{item.Revenue:N0} ₸  ({share})")
                                .Style(TableCellStyle);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#f0f0f0")
                                .Padding(8).AlignRight()
                                .Text($"{item.BookingsCount}").Style(TableCellStyle);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#f0f0f0")
                                .Padding(8).AlignRight()
                                .Text($"{item.AverageBookingValue:N0} ₸").Style(TableCellStyle);
                        }
                    });

                    // Итого
                    col.Item().PaddingTop(12).AlignRight().Row(row =>
                    {
                        row.ConstantItem(280).Background("#f0f5ff").Padding(12).Column(c =>
                        {
                            c.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Итого выручка:").Style(TitleStyle);
                                r.ConstantItem(120).AlignRight()
                                    .Text($"{totalRevenue:N0} ₸")
                                    .Style(TextStyle.Default.FontSize(14).Bold().FontColor(AccentColor));
                            });
                        });
                    });
                });

                page.Footer().AlignCenter()
                    .Text($"Сгенерировано: {DateTime.Now:dd.MM.yyyy HH:mm}  •  {HotelName}")
                    .Style(LabelStyle);
            });
        }).GeneratePdf();
    }
}
