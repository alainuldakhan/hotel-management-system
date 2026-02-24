using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class HousekeepingTaskConfiguration : IEntityTypeConfiguration<HousekeepingTask>
{
    public void Configure(EntityTypeBuilder<HousekeepingTask> builder)
    {
        builder.ToTable("housekeeping_tasks");

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).HasColumnName("id");

        builder.Property(h => h.Type).HasColumnName("type").IsRequired();
        builder.Property(h => h.Status).HasColumnName("status").IsRequired();
        builder.Property(h => h.Notes).HasColumnName("notes").HasMaxLength(1000);
        builder.Property(h => h.DueDate).HasColumnName("due_date");
        builder.Property(h => h.CompletedAt).HasColumnName("completed_at");
        builder.Property(h => h.CompletionNotes).HasColumnName("completion_notes").HasMaxLength(1000);

        builder.Property(h => h.RoomId).HasColumnName("room_id");
        builder.Property(h => h.RequestedByUserId).HasColumnName("requested_by_user_id");
        builder.Property(h => h.AssignedToUserId).HasColumnName("assigned_to_user_id");
        builder.Property(h => h.CreatedAt).HasColumnName("created_at");
        builder.Property(h => h.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(h => h.Room)
            .WithMany()
            .HasForeignKey(h => h.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(h => h.RequestedBy)
            .WithMany()
            .HasForeignKey(h => h.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(h => h.AssignedTo)
            .WithMany()
            .HasForeignKey(h => h.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(h => h.RoomId);
        builder.HasIndex(h => h.Status);
        builder.HasIndex(h => h.AssignedToUserId);
    }
}
