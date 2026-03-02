using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Interfaces;
using HotelManagement.Infrastructure.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    private readonly AuditSaveChangesInterceptor _auditInterceptor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditSaveChangesInterceptor auditInterceptor)
        : base(options)
    {
        _auditInterceptor = auditInterceptor;
    }

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
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RoomBlock> RoomBlocks => Set<RoomBlock>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditInterceptor);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // AuditLog
        modelBuilder.Entity<AuditLog>(b =>
        {
            b.ToTable("audit_logs");
            b.HasKey(a => a.Id);
            b.Property(a => a.Id).HasColumnName("id");
            b.Property(a => a.EntityName).HasColumnName("entity_name").HasMaxLength(100).IsRequired();
            b.Property(a => a.EntityId).HasColumnName("entity_id").HasMaxLength(100).IsRequired();
            b.Property(a => a.Action).HasColumnName("action").HasMaxLength(20).IsRequired();
            b.Property(a => a.OldValues).HasColumnName("old_values").HasColumnType("jsonb");
            b.Property(a => a.NewValues).HasColumnName("new_values").HasColumnType("jsonb");
            b.Property(a => a.ChangedBy).HasColumnName("changed_by");
            b.Property(a => a.ChangedAt).HasColumnName("changed_at");
        });

        // RoomBlock
        modelBuilder.Entity<RoomBlock>(b =>
        {
            b.ToTable("room_blocks");
            b.HasKey(rb => rb.Id);
            b.Property(rb => rb.Id).HasColumnName("id");
            b.Property(rb => rb.RoomId).HasColumnName("room_id").IsRequired();
            b.Property(rb => rb.BlockedFrom).HasColumnName("blocked_from").IsRequired();
            b.Property(rb => rb.BlockedTo).HasColumnName("blocked_to").IsRequired();
            b.Property(rb => rb.Reason).HasColumnName("reason").HasMaxLength(500).IsRequired();
            b.Property(rb => rb.BlockedByUserId).HasColumnName("blocked_by_user_id").IsRequired();
            b.Property(rb => rb.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            b.Property(rb => rb.CreatedAt).HasColumnName("created_at");
            b.Property(rb => rb.UpdatedAt).HasColumnName("updated_at");
            b.HasOne(rb => rb.Room).WithMany().HasForeignKey(rb => rb.RoomId);
        });

        // Payment
        modelBuilder.Entity<Payment>(b =>
        {
            b.ToTable("payments");
            b.HasKey(p => p.Id);
            b.Property(p => p.Id).HasColumnName("id");
            b.Property(p => p.BookingId).HasColumnName("booking_id").IsRequired();
            b.Property(p => p.InvoiceId).HasColumnName("invoice_id");
            b.Property(p => p.Amount).HasColumnName("amount").HasColumnType("decimal(18,2)").IsRequired();
            b.Property(p => p.Method).HasColumnName("method").HasMaxLength(50).IsRequired();
            b.Property(p => p.Reference).HasColumnName("reference").HasMaxLength(200);
            b.Property(p => p.ReceivedAt).HasColumnName("received_at").IsRequired();
            b.Property(p => p.ReceivedByUserId).HasColumnName("received_by_user_id").IsRequired();
            b.Property(p => p.Notes).HasColumnName("notes").HasMaxLength(500);
            b.Property(p => p.CreatedAt).HasColumnName("created_at");
            b.Property(p => p.UpdatedAt).HasColumnName("updated_at");
            b.HasOne(p => p.Booking).WithMany().HasForeignKey(p => p.BookingId);
        });
    }
}
