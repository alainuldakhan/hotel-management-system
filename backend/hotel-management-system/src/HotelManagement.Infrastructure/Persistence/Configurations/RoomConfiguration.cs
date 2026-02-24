using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("rooms");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");

        builder.Property(r => r.Number)
            .HasColumnName("number")
            .HasMaxLength(10)
            .IsRequired();

        builder.HasIndex(r => r.Number).IsUnique();

        builder.Property(r => r.Floor).HasColumnName("floor").IsRequired();

        builder.Property(r => r.Status)
            .HasColumnName("status")
            .IsRequired();

        builder.Property(r => r.Notes).HasColumnName("notes").HasMaxLength(500);
        builder.Property(r => r.IsActive).HasColumnName("is_active").HasDefaultValue(true);

        builder.Property(r => r.RoomTypeId).HasColumnName("room_type_id");
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(r => r.RoomType)
            .WithMany(rt => rt.Rooms)
            .HasForeignKey(r => r.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
