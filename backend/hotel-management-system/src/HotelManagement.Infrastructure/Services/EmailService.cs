using HotelManagement.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace HotelManagement.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendBookingConfirmationAsync(BookingEmailData data, CancellationToken ct = default)
    {
        var subject = $"Подтверждение бронирования — Номер {data.RoomNumber}";
        var body = BuildBookingConfirmationHtml(data);
        await SendAsync(data.GuestEmail, data.GuestFullName, subject, body, ct);
    }

    public async Task SendCheckInNotificationAsync(BookingEmailData data, CancellationToken ct = default)
    {
        var subject = $"Добро пожаловать! Заселение в номер {data.RoomNumber}";
        var body = BuildCheckInHtml(data);
        await SendAsync(data.GuestEmail, data.GuestFullName, subject, body, ct);
    }

    public async Task SendCheckOutReceiptAsync(BookingEmailData data, CancellationToken ct = default)
    {
        var subject = $"Спасибо за пребывание — Квитанция #{data.BookingId[..8].ToUpper()}";
        var body = BuildCheckOutHtml(data);
        await SendAsync(data.GuestEmail, data.GuestFullName, subject, body, ct);
    }

    public async Task SendBookingCancellationAsync(BookingEmailData data, CancellationToken ct = default)
    {
        var subject = $"Бронирование отменено — Номер {data.RoomNumber}";
        var body = BuildCancellationHtml(data);
        await SendAsync(data.GuestEmail, data.GuestFullName, subject, body, ct);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct)
    {
        if (!_settings.IsEnabled)
        {
            _logger.LogInformation("Email sending is disabled. Would send to {Email}: {Subject}", toEmail, subject);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort,
                _settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, ct);

            if (!string.IsNullOrEmpty(_settings.SmtpUsername))
                await client.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword, ct);

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Email sent to {Email}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}: {Subject}", toEmail, subject);
        }
    }

    private static string BuildBookingConfirmationHtml(BookingEmailData d)
    {
        var specialRow = string.IsNullOrEmpty(d.SpecialRequests)
            ? ""
            : $"<tr><td>Пожелания</td><td>{d.SpecialRequests}</td></tr>";

        return $$"""
            <!DOCTYPE html>
            <html lang="ru">
            <head><meta charset="UTF-8"><style>
              body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
              .card { max-width: 560px; margin: auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
              .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #eee; }
              .hotel { font-size: 22px; font-weight: bold; color: #1677ff; }
              h2 { color: #333; margin: 24px 0 16px; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
              td:first-child { color: #888; width: 45%; }
              td:last-child { font-weight: 500; color: #333; }
              .total td { font-size: 16px; font-weight: bold; color: #1677ff; border-bottom: none; }
              .footer { text-align: center; color: #aaa; font-size: 12px; margin-top: 32px; }
            </style></head>
            <body>
            <div class="card">
              <div class="header">
                <div class="hotel">Hotel Management System</div>
              </div>
              <h2>Подтверждение бронирования</h2>
              <p>Уважаемый(ая) {{d.GuestFullName}},<br>ваше бронирование успешно принято!</p>
              <table>
                <tr><td>Номер комнаты</td><td>{{d.RoomNumber}} ({{d.RoomTypeName}})</td></tr>
                <tr><td>Дата заезда</td><td>{{d.CheckInDate:dd.MM.yyyy}}</td></tr>
                <tr><td>Дата выезда</td><td>{{d.CheckOutDate:dd.MM.yyyy}}</td></tr>
                <tr><td>Количество ночей</td><td>{{d.NightsCount}}</td></tr>
                {{specialRow}}
              </table>
              <table>
                <tr class="total"><td>Итого к оплате</td><td>{{d.TotalAmount:N0}} тенге</td></tr>
              </table>
              <div class="footer">Если у вас есть вопросы, обращайтесь на ресепшн.</div>
            </div>
            </body></html>
            """;
    }

    private static string BuildCheckInHtml(BookingEmailData d) => $$"""
        <!DOCTYPE html>
        <html lang="ru">
        <head><meta charset="UTF-8"><style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
          .hotel { font-size: 22px; font-weight: bold; color: #1677ff; text-align: center; }
          h2 { color: #333; margin: 24px 0 16px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
          td:first-child { color: #888; width: 45%; }
          td:last-child { font-weight: 500; color: #333; }
        </style></head>
        <body>
        <div class="card">
          <div class="hotel">Hotel Management System</div>
          <h2>Добро пожаловать!</h2>
          <p>Уважаемый(ая) {{d.GuestFullName}}, вы успешно заселились.</p>
          <table>
            <tr><td>Ваш номер</td><td>{{d.RoomNumber}} ({{d.RoomTypeName}})</td></tr>
            <tr><td>Дата выезда</td><td>{{d.CheckOutDate:dd.MM.yyyy}}</td></tr>
            <tr><td>Количество ночей</td><td>{{d.NightsCount}}</td></tr>
          </table>
          <p>Желаем вам приятного пребывания!</p>
        </div>
        </body></html>
        """;

    private static string BuildCheckOutHtml(BookingEmailData d) => $$"""
        <!DOCTYPE html>
        <html lang="ru">
        <head><meta charset="UTF-8"><style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
          .hotel { font-size: 22px; font-weight: bold; color: #1677ff; text-align: center; }
          h2 { color: #333; margin: 24px 0 16px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
          td:first-child { color: #888; width: 45%; }
          td:last-child { font-weight: 500; color: #333; }
          .total td { font-weight: bold; color: #1677ff; border-bottom: none; }
        </style></head>
        <body>
        <div class="card">
          <div class="hotel">Hotel Management System</div>
          <h2>Спасибо за пребывание!</h2>
          <p>Уважаемый(ая) {{d.GuestFullName}}, надеемся увидеть вас снова.</p>
          <table>
            <tr><td>Номер комнаты</td><td>{{d.RoomNumber}}</td></tr>
            <tr><td>Период</td><td>{{d.CheckInDate:dd.MM.yyyy}} — {{d.CheckOutDate:dd.MM.yyyy}}</td></tr>
            <tr><td>Ночей</td><td>{{d.NightsCount}}</td></tr>
          </table>
          <table>
            <tr class="total"><td>Итоговая сумма</td><td>{{d.TotalAmount:N0}} тенге</td></tr>
          </table>
        </div>
        </body></html>
        """;

    private static string BuildCancellationHtml(BookingEmailData d) => $$"""
        <!DOCTYPE html>
        <html lang="ru">
        <head><meta charset="UTF-8"><style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
          .hotel { font-size: 22px; font-weight: bold; color: #1677ff; text-align: center; }
          h2 { color: #cf1322; margin: 24px 0 16px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
          td:first-child { color: #888; width: 45%; }
          td:last-child { font-weight: 500; color: #333; }
        </style></head>
        <body>
        <div class="card">
          <div class="hotel">Hotel Management System</div>
          <h2>Бронирование отменено</h2>
          <p>Уважаемый(ая) {{d.GuestFullName}}, ваше бронирование отменено.</p>
          <table>
            <tr><td>Номер комнаты</td><td>{{d.RoomNumber}} ({{d.RoomTypeName}})</td></tr>
            <tr><td>Дата заезда</td><td>{{d.CheckInDate:dd.MM.yyyy}}</td></tr>
            <tr><td>Дата выезда</td><td>{{d.CheckOutDate:dd.MM.yyyy}}</td></tr>
          </table>
          <p>Если это ошибка, свяжитесь с нами.</p>
        </div>
        </body></html>
        """;
}
