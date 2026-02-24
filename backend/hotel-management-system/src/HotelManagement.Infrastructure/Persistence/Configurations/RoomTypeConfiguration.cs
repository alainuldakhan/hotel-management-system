using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class RoomTypeConfiguration : IEntityTypeConfiguration<RoomType>
{
    public void Configure(EntityTypeBuilder<RoomType> builder)
    {
        builder.ToTable("room_types");

        builder.HasKey(rt => rt.Id);
        builder.Property(rt => rt.Id).HasColumnName("id");

        builder.Property(rt => rt.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(rt => rt.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(rt => rt.MaxOccupancy)
            .HasColumnName("max_occupancy")
            .IsRequired();

        builder.Property(rt => rt.BasePrice)
            .HasColumnName("base_price")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(rt => rt.Area)
            .HasColumnName("area")
            .HasPrecision(6, 2);

        var amenitiesComparer = new ValueComparer<List<string>>(
            (a, b) => a != null && b != null && a.SequenceEqual(b),
            v => v.Aggregate(0, (a, s) => HashCode.Combine(a, s.GetHashCode())),
            v => v.ToList());

        builder.Property(rt => rt.Amenities)
            .HasColumnName("amenities")
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            )
            .Metadata.SetValueComparer(amenitiesComparer);

        builder.Property(rt => rt.ImageUrl).HasColumnName("image_url");
        builder.Property(rt => rt.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(rt => rt.CreatedAt).HasColumnName("created_at");
        builder.Property(rt => rt.UpdatedAt).HasColumnName("updated_at");
    }
}
