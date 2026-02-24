using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class MaintenanceRequestConfiguration : IEntityTypeConfiguration<MaintenanceRequest>
{
    public void Configure(EntityTypeBuilder<MaintenanceRequest> builder)
    {
        builder.ToTable("maintenance_requests");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");

        builder.Property(m => m.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(m => m.Description).HasColumnName("description").HasMaxLength(2000).IsRequired();
        builder.Property(m => m.Status).HasColumnName("status").IsRequired();
        builder.Property(m => m.Priority).HasColumnName("priority").IsRequired();
        builder.Property(m => m.Resolution).HasColumnName("resolution").HasMaxLength(2000);
        builder.Property(m => m.ResolvedAt).HasColumnName("resolved_at");

        builder.Property(m => m.RoomId).HasColumnName("room_id");
        builder.Property(m => m.ReportedByUserId).HasColumnName("reported_by_user_id");
        builder.Property(m => m.AssignedToUserId).HasColumnName("assigned_to_user_id");
        builder.Property(m => m.CreatedAt).HasColumnName("created_at");
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(m => m.Room)
            .WithMany(r => r.MaintenanceRequests)
            .HasForeignKey(m => m.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.ReportedBy)
            .WithMany(u => u.MaintenanceRequests)
            .HasForeignKey(m => m.ReportedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.AssignedTo)
            .WithMany()
            .HasForeignKey(m => m.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
