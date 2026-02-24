using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<AdditionalService> AdditionalServices => Set<AdditionalService>();
    public DbSet<BookingService> BookingServices => Set<BookingService>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
    public DbSet<PricingRule> PricingRules => Set<PricingRule>();
    public DbSet<HousekeepingTask> HousekeepingTasks => Set<HousekeepingTask>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
