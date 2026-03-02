using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HotelManagement.Infrastructure.Persistence;

/// <summary>
/// Начальное наполнение базы данных тестовыми данными.
/// Запускается при старте приложения если база пустая.
/// </summary>
public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _hasher;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        ApplicationDbContext context,
        IPasswordHasher hasher,
        ILogger<DataSeeder> logger)
    {
        _context = context;
        _hasher  = hasher;
        _logger  = logger;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await _context.Users.AnyAsync(ct))
        {
            _logger.LogInformation("Database already seeded, skipping.");
            return;
        }

        _logger.LogInformation("Seeding database with initial data...");

        // ── 1. Users ──────────────────────────────────────────────────────────
        var admin = User.Create("Admin", "Admin", "admin@hotel.com",
            _hasher.Hash("Admin123!"), UserRole.SuperAdmin, "+77001234567");

        var manager = User.Create("Мария", "Иванова", "manager@hotel.com",
            _hasher.Hash("Admin123!"), UserRole.Manager, "+77001234568");

        var reception = User.Create("Алексей", "Петров", "reception@hotel.com",
            _hasher.Hash("Admin123!"), UserRole.Receptionist, "+77001234569");

        var housekeeper = User.Create("Айгерим", "Сатова", "housekeeper@hotel.com",
            _hasher.Hash("Admin123!"), UserRole.HousekeepingStaff, "+77001234570");

        var maintenance = User.Create("Берик", "Жаксыбеков", "maintenance@hotel.com",
            _hasher.Hash("Admin123!"), UserRole.MaintenanceStaff, "+77001234571");

        await _context.Users.AddRangeAsync(
            [admin, manager, reception, housekeeper, maintenance], ct);

        // ── 2. Room Types ─────────────────────────────────────────────────────
        var standard = CreateRoomType("Стандарт", 5_000,
            "Двуспальная кровать,Телевизор,Кондиционер,Wi-Fi,Холодильник,Ванная комната");

        var deluxe = CreateRoomType("Делюкс", 9_000,
            "Двуспальная кровать King Size,Телевизор 55\",Кондиционер,Wi-Fi,Мини-бар,Ванная с джакузи,Вид на город,Балкон");

        var suite = CreateRoomType("Люкс", 18_000,
            "Спальня King Size,Гостиная,Кухня-студия,2 ванных комнаты,Панорамный вид,Мини-бар,Сейф,Wi-Fi 1 Гбит,Персональный менеджер");

        await _context.RoomTypes.AddRangeAsync([standard, deluxe, suite], ct);
        await _context.SaveChangesAsync(ct);  // нужны ID для Room

        // ── 3. Rooms ──────────────────────────────────────────────────────────
        var rooms = new List<Room>
        {
            // Стандарт — этаж 1
            CreateRoom("101", 1, standard.Id),
            CreateRoom("102", 1, standard.Id),
            CreateRoom("103", 1, standard.Id),
            // Делюкс — этаж 2
            CreateRoom("201", 2, deluxe.Id),
            CreateRoom("202", 2, deluxe.Id),
            CreateRoom("203", 2, deluxe.Id),
            // Люкс — этаж 3
            CreateRoom("301", 3, suite.Id),
            CreateRoom("302", 3, suite.Id),
            CreateRoom("303", 3, suite.Id),
        };

        await _context.Rooms.AddRangeAsync(rooms, ct);

        // ── 4. Additional Services ────────────────────────────────────────────
        var services = new[]
        {
            AdditionalService.Create("Завтрак", "Шведский стол",  800),
            AdditionalService.Create("Трансфер из аэропорта", "Встреча и доставка в отель", 5_000),
            AdditionalService.Create("Спа-процедуры", "1 час в спа-зоне", 3_500),
            AdditionalService.Create("Прачечная", "Стирка и глажка (до 5 кг)", 1_200),
            AdditionalService.Create("Обслуживание в номере", "Доставка еды и напитков в номер", 500),
        };

        await _context.AdditionalServices.AddRangeAsync(services, ct);

        // ── 5. Pricing Rules ──────────────────────────────────────────────────
        var weekendRule = PricingRule.Create("Надбавка за выходные", 1.20m);
        weekendRule.Update(
            "Надбавка за выходные", 1.20m,
            startDate: null, endDate: null,
            applicableDays: [DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
            minOccupancyPercent: null, maxDaysBeforeCheckIn: null,
            roomTypeId: null);

        var highSeasonRule = PricingRule.Create("Высокий сезон (лето)", 1.30m);
        highSeasonRule.Update(
            "Высокий сезон (лето)", 1.30m,
            startDate: new DateTime(DateTime.UtcNow.Year, 7, 1),
            endDate:   new DateTime(DateTime.UtcNow.Year, 8, 31),
            applicableDays: null,
            minOccupancyPercent: null, maxDaysBeforeCheckIn: null,
            roomTypeId: null);

        await _context.PricingRules.AddRangeAsync([weekendRule, highSeasonRule], ct);

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Database seeded successfully.");
    }

    private static RoomType CreateRoomType(string name, decimal price, string amenitiesCsv)
    {
        var amenities = amenitiesCsv.Split(',').Select(a => a.Trim()).ToList();
        return RoomType.Create(name, name, maxOccupancy: 2, basePrice: price, area: 25m, amenities);
    }

    private static Room CreateRoom(string number, int floor, Guid roomTypeId)
        => Room.Create(number, floor, roomTypeId);
}
