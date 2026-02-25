using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HotelManagement.Infrastructure.Services;

/// <summary>
/// Фоновая служба: ежедневно отправляет email-напоминания гостям,
/// у которых заезд запланирован на следующий день.
/// </summary>
public class BookingReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BookingReminderService> _logger;

    // Запускаем первый раз через 30 секунд после старта, потом каждые 24 часа
    private static readonly TimeSpan InitialDelay = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan Period = TimeSpan.FromHours(24);

    public BookingReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<BookingReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BookingReminderService started.");

        await Task.Delay(InitialDelay, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await SendRemindersAsync(stoppingToken);

            try
            {
                await Task.Delay(Period, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("BookingReminderService stopped.");
    }

    private async Task SendRemindersAsync(CancellationToken ct)
    {
        _logger.LogInformation("BookingReminderService: sending tomorrow's check-in reminders...");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var queryService = scope.ServiceProvider.GetRequiredService<IBookingQueryService>();
            var emailService  = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var bookings = await queryService.GetTomorrowCheckInsAsync(ct);

            int count = 0;
            foreach (var b in bookings)
            {
                await emailService.SendBookingReminderAsync(new BookingEmailData(
                    b.GuestEmail,
                    b.GuestFullName,
                    b.Id.ToString(),
                    b.RoomNumber,
                    b.RoomTypeName,
                    b.CheckInDate,
                    b.CheckOutDate,
                    b.NightsCount,
                    b.TotalAmount
                ), ct);
                count++;
            }

            _logger.LogInformation("BookingReminderService: sent {Count} reminder(s).", count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BookingReminderService: error while sending reminders.");
        }
    }
}
