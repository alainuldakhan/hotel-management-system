using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Queries;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Interfaces;
using HotelManagement.Infrastructure.Persistence;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HotelManagement.Infrastructure.Extensions;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        // ── EF Core (Commands / Write) ──────────────────────────────────────
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
            ));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // EF Core репозитории
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IAdditionalServiceRepository, AdditionalServiceRepository>();
        services.AddScoped<IPricingRuleRepository, PricingRuleRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();
        services.AddScoped<IHousekeepingRepository, HousekeepingRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();

        // ── Dapper (Queries / Read) ─────────────────────────────────────────
        services.AddSingleton<IDbConnectionFactory>(
            new NpgsqlConnectionFactory(connectionString));

        // Dapper query-сервисы
        services.AddScoped<IRoomTypeQueryService, RoomTypeQueryService>();
        services.AddScoped<IRoomQueryService, RoomQueryService>();
        services.AddScoped<IBookingQueryService, BookingQueryService>();
        services.AddScoped<IAnalyticsQueryService, AnalyticsQueryService>();
        services.AddScoped<IAdditionalServiceQueryService, AdditionalServiceQueryService>();
        services.AddScoped<IPricingRuleQueryService, PricingRuleQueryService>();
        services.AddScoped<IInvoiceQueryService, InvoiceQueryService>();
        services.AddScoped<IMaintenanceQueryService, MaintenanceQueryService>();
        services.AddScoped<IUserQueryService, UserQueryService>();
        services.AddScoped<IHousekeepingQueryService, HousekeepingQueryService>();
        services.AddScoped<IReviewQueryService, ReviewQueryService>();

        // ── Services ────────────────────────────────────────────────────────
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.AddScoped<IEmailService, EmailService>();
        services.AddSingleton<IPdfReportService, PdfReportService>();

        // QuestPDF Community License (бесплатная для некоммерческих проектов)
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

        // Фоновая служба напоминаний о заезде
        services.AddHostedService<BookingReminderService>();

        return services;
    }
}
