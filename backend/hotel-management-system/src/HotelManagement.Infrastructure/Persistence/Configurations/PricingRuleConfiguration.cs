using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
{
    public void Configure(EntityTypeBuilder<PricingRule> builder)
    {
        builder.ToTable("pricing_rules");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.Property(p => p.Name).HasColumnName("name").HasMaxLength(200).IsRequired();

        builder.Property(p => p.Multiplier)
            .HasColumnName("multiplier")
            .HasPrecision(5, 4)
            .IsRequired();

        builder.Property(p => p.StartDate).HasColumnName("start_date");
        builder.Property(p => p.EndDate).HasColumnName("end_date");

        var daysComparer = new ValueComparer<DayOfWeek[]?>(
            (a, b) => (a == null && b == null) || (a != null && b != null && a.SequenceEqual(b)),
            v => v == null ? 0 : v.Aggregate(0, (a, d) => HashCode.Combine(a, d.GetHashCode())),
            v => v == null ? null : v.ToArray());

        builder.Property(p => p.ApplicableDays)
            .HasColumnName("applicable_days")
            .HasConversion(
                v => v == null ? null : string.Join(',', v.Select(d => (int)d)),
                v => v == null ? null : v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                         .Select(d => (DayOfWeek)int.Parse(d)).ToArray()
            )
            .Metadata.SetValueComparer(daysComparer);

        builder.Property(p => p.MinOccupancyPercent).HasColumnName("min_occupancy_percent");
        builder.Property(p => p.MaxDaysBeforeCheckIn).HasColumnName("max_days_before_check_in");
        builder.Property(p => p.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(p => p.RoomTypeId).HasColumnName("room_type_id");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(p => p.RoomType)
            .WithMany(rt => rt.PricingRules)
            .HasForeignKey(p => p.RoomTypeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
